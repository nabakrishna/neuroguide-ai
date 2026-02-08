// Multi-agent orchestration layer

import { 
  AgentType, 
  AgentContext, 
  AgentOutput, 
  IntentClassification,
  ChatMessage,
  STRUCTURED_OUTPUT_TOOLS 
} from "./types.ts";
import {
  ROUTER_PROMPT,
  DATA_ENGINEER_PROMPT,
  SCHOLAR_PROMPT,
  CODE_GENERATOR_PROMPT,
  CRITIC_PROMPT,
  ORCHESTRATOR_PROMPT
} from "./prompts.ts";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface OrchestratorConfig {
  apiKey: string;
  enableCritic?: boolean;
  maxAgents?: number;
}

export class AgentOrchestrator {
  private apiKey: string;
  private enableCritic: boolean;
  private maxAgents: number;

  constructor(config: OrchestratorConfig) {
    this.apiKey = config.apiKey;
    this.enableCritic = config.enableCritic ?? true;
    this.maxAgents = config.maxAgents ?? 3;
  }

  async routeQuery(context: AgentContext): Promise<IntentClassification> {
    const startTime = Date.now();
    
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast model for routing
        messages: [
          { role: "system", content: ROUTER_PROMPT },
          { role: "user", content: context.userQuery }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Router failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          primaryIntent: parsed.primary_intent || 'general_ml',
          confidence: parsed.confidence || 0.8,
          entities: [],
          requiresMultipleAgents: parsed.requires_multiple_agents || false,
          agentSequence: this.mapAgentSequence(parsed.agent_sequence || ['scholar']),
        };
      }
    } catch (e) {
      console.error("Failed to parse router response:", e);
    }

    // Default fallback
    return {
      primaryIntent: 'general_ml',
      confidence: 0.7,
      entities: [],
      requiresMultipleAgents: false,
      agentSequence: ['scholar'],
    };
  }

  private mapAgentSequence(agents: string[]): AgentType[] {
    const mapping: Record<string, AgentType> = {
      'DATA_ENGINEER': 'data_engineer',
      'SCHOLAR': 'scholar',
      'CODE_GENERATOR': 'code_generator',
      'CRITIC': 'critic',
    };
    
    return agents
      .slice(0, this.maxAgents)
      .map(a => mapping[a] || 'scholar')
      .filter((a): a is AgentType => !!a);
  }

  private getAgentPrompt(agent: AgentType): string {
    const prompts: Record<AgentType, string> = {
      router: ROUTER_PROMPT,
      data_engineer: DATA_ENGINEER_PROMPT,
      scholar: SCHOLAR_PROMPT,
      code_generator: CODE_GENERATOR_PROMPT,
      critic: CRITIC_PROMPT,
    };
    return prompts[agent];
  }

  private getAgentTools(agent: AgentType): object[] {
    switch (agent) {
      case 'data_engineer':
        return [STRUCTURED_OUTPUT_TOOLS.analyze_data_issues];
      case 'scholar':
        return [STRUCTURED_OUTPUT_TOOLS.provide_citations];
      case 'code_generator':
        return [STRUCTURED_OUTPUT_TOOLS.provide_code];
      default:
        return [];
    }
  }

  async executeAgent(
    agent: AgentType,
    context: AgentContext
  ): Promise<AgentOutput> {
    const startTime = Date.now();
    const systemPrompt = this.getAgentPrompt(agent);
    const tools = this.getAgentTools(agent);

    // Build context-aware prompt
    let contextPrompt = context.userQuery;
    if (context.previousAgentOutputs?.length) {
      contextPrompt += "\n\nPrevious analysis:\n";
      for (const output of context.previousAgentOutputs) {
        contextPrompt += `[${output.agent}]: ${output.content.slice(0, 500)}...\n`;
      }
    }

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...context.conversationHistory.slice(-10), // Last 10 messages for context
      { role: "user", content: contextPrompt }
    ];

    const requestBody: Record<string, unknown> = {
      model: "google/gemini-2.5-pro", // Pro model for complex reasoning
      messages,
      temperature: 0.3,
      max_tokens: 4000,
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Agent ${agent} failed: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content || "";
    const toolCalls = message?.tool_calls || [];

    // Parse structured output from tool calls
    let structured = {};
    for (const call of toolCalls) {
      if (call.function?.arguments) {
        try {
          const args = JSON.parse(call.function.arguments);
          structured = { ...structured, ...args };
        } catch (e) {
          console.error("Failed to parse tool call:", e);
        }
      }
    }

    return {
      agent,
      content,
      structured: Object.keys(structured).length > 0 ? structured : undefined,
      confidence: 0.85,
      processingTime: Date.now() - startTime,
    };
  }

  async orchestrate(
    userQuery: string,
    conversationHistory: ChatMessage[]
  ): Promise<{ content: string; agentOutputs: AgentOutput[]; intent: IntentClassification }> {
    const context: AgentContext = {
      userQuery,
      conversationHistory,
    };

    // Step 1: Route the query
    const intent = await this.routeQuery(context);
    context.intent = intent;

    const agentOutputs: AgentOutput[] = [];

    // Step 2: Execute agents in sequence
    for (const agent of intent.agentSequence) {
      const output = await this.executeAgent(agent, {
        ...context,
        previousAgentOutputs: agentOutputs,
      });
      agentOutputs.push(output);
    }

    // Step 3: Optional critic review for complex queries
    if (this.enableCritic && intent.requiresMultipleAgents && agentOutputs.length > 0) {
      const criticOutput = await this.executeAgent('critic', {
        ...context,
        previousAgentOutputs: agentOutputs,
      });
      agentOutputs.push(criticOutput);
    }

    // Combine outputs into final response
    const finalContent = this.synthesizeResponse(agentOutputs, intent);

    return {
      content: finalContent,
      agentOutputs,
      intent,
    };
  }

  private synthesizeResponse(outputs: AgentOutput[], intent: IntentClassification): string {
    if (outputs.length === 0) {
      return "I couldn't process your request. Please try rephrasing your question.";
    }

    if (outputs.length === 1) {
      return outputs[0].content;
    }

    // For multi-agent responses, combine with clear sections
    let response = "";
    
    for (const output of outputs) {
      if (output.agent === 'critic') {
        response += `\n\n---\n\n**Quality Review**:\n${output.content}`;
      } else {
        response += output.content + "\n\n";
      }
    }

    return response.trim();
  }
}

// Streaming orchestrator for real-time responses
export async function* streamingOrchestrate(
  apiKey: string,
  userQuery: string,
  conversationHistory: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  // For streaming, we use the main model directly with the orchestrator prompt
  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: ORCHESTRATOR_PROMPT },
        ...conversationHistory.slice(-10),
        { role: "user", content: userQuery }
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Orchestration failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") return;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      } catch {
        // Incomplete JSON, continue
      }
    }
  }
}
