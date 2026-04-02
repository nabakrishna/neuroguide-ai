// Agent types and interfaces for multi-agent orchestration

export type AgentType = 
  | 'router' 
  | 'data_engineer' 
  | 'scholar' 
  | 'code_generator' 
  | 'critic';

export interface AgentContext {
  userQuery: string;
  conversationHistory: ChatMessage[];
  intent?: IntentClassification;
  previousAgentOutputs?: AgentOutput[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IntentClassification {
  primaryIntent: Intent;
  confidence: number;
  entities: Entity[];
  requiresMultipleAgents: boolean;
  agentSequence: AgentType[];
}

export type Intent = 
  | 'architecture_question'
  | 'data_audit'
  | 'research_query'
  | 'code_generation'
  | 'general_ml'
  | 'critique_request'
  | 'clarification';

export interface Entity {
  type: 'model_name' | 'dataset' | 'metric' | 'framework' | 'paper' | 'concept';
  value: string;
  confidence: number;
}

export interface AgentOutput {
  agent: AgentType;
  content: string;
  structured?: StructuredOutput;
  confidence: number;
  processingTime: number;
}

export interface StructuredOutput {
  citations?: Citation[];
  codeBlocks?: CodeBlock[];
  dataIssues?: DataIssue[];
  recommendations?: Recommendation[];
}

export interface Citation {
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  relevance: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  description: string;
}

export interface DataIssue {
  type: 'class_imbalance' | 'data_leakage' | 'missing_values' | 'outliers' | 'duplicate_rows';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedColumns?: string[];
  recommendation: string;
}

export interface Recommendation {
  category: 'architecture' | 'training' | 'data' | 'deployment' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation?: string;
}

// Tool calling schemas for structured outputs
export const STRUCTURED_OUTPUT_TOOLS = {
  provide_citations: {
    type: "function",
    function: {
      name: "provide_citations",
      description: "Provide academic citations and references for ML concepts",
      parameters: {
        type: "object",
        properties: {
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                authors: { type: "array", items: { type: "string" } },
                year: { type: "number" },
                venue: { type: "string" },
                relevance: { type: "string" }
              },
              required: ["title", "authors", "year", "relevance"]
            }
          }
        },
        required: ["citations"]
      }
    }
  },
  provide_code: {
    type: "function",
    function: {
      name: "provide_code",
      description: "Provide code implementations with explanations",
      parameters: {
        type: "object",
        properties: {
          code_blocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                language: { type: "string" },
                code: { type: "string" },
                filename: { type: "string" },
                description: { type: "string" }
              },
              required: ["language", "code", "description"]
            }
          }
        },
        required: ["code_blocks"]
      }
    }
  },
  analyze_data_issues: {
    type: "function",
    function: {
      name: "analyze_data_issues",
      description: "Analyze and report data quality issues in a dataset",
      parameters: {
        type: "object",
        properties: {
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["class_imbalance", "data_leakage", "missing_values", "outliers", "duplicate_rows"] },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                description: { type: "string" },
                affected_columns: { type: "array", items: { type: "string" } },
                recommendation: { type: "string" }
              },
              required: ["type", "severity", "description", "recommendation"]
            }
          }
        },
        required: ["issues"]
      }
    }
  }
};
