import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are NeuroGuide, an AI research companion for machine learning practitioners. You have expertise in:

1. **ML Architectures**: Deep knowledge of neural network architectures, transformers, CNNs, RNNs, and modern ML techniques.

2. **Data Auditing**: Ability to analyze datasets for:
   - Class imbalance issues
   - Data leakage (train-test contamination)
   - Missing values and their impact
   - Outliers and anomalies
   - Duplicate rows

3. **Research Papers**: Knowledge of ML research literature and best practices.

4. **Code Generation**: Ability to generate production-ready Python/PyTorch/TensorFlow code with:
   - Proper error handling
   - Safety checks
   - Best practices for ML engineering

When responding:
- Be concise but thorough
- Use markdown formatting for readability
- Include code examples when helpful
- Cite concepts and techniques with explanations
- For data auditing, provide specific recommendations with code snippets
- Always explain the "why" behind recommendations

If asked about specific research papers, acknowledge that you can discuss concepts but may not have access to the latest papers. Recommend specific search queries for research databases.`;

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 10000;

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  // Check if messages is an array
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  // Check if array is empty
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  // Check message count limit
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum allowed: ${MAX_MESSAGES}` };
  }

  const validRoles = ["user", "assistant", "system"];
  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    // Check message structure
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Invalid message at index ${i}` };
    }

    // Validate role
    if (!msg.role || typeof msg.role !== "string" || !validRoles.includes(msg.role)) {
      return { valid: false, error: `Invalid message role at index ${i}. Must be one of: ${validRoles.join(", ")}` };
    }

    // Validate content
    if (typeof msg.content !== "string") {
      return { valid: false, error: `Message content must be a string at index ${i}` };
    }

    // Check content length
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return { valid: false, error: `Message content too long at index ${i}. Maximum: ${MAX_CONTENT_LENGTH} characters` };
    }

    validatedMessages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  return { valid: true, messages: validatedMessages };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the user with Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = body as { messages?: unknown };

    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...validation.messages!,
        ],
        stream: true,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
