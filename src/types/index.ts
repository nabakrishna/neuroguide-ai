export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  goal?: 'research' | 'startup' | 'learning';
  onboarding_completed: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'ideation' | 'data_audit' | 'modeling' | 'completed';
  health_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    agent?: string;
    citations?: Citation[];
    code_blocks?: CodeBlock[];
    data_issues?: DataIssue[];
  };
  created_at: string;
}

export interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  url: string;
  abstract?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface DataIssue {
  type: 'class_imbalance' | 'data_leakage' | 'missing_values' | 'outliers' | 'duplicate_rows';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_columns?: string[];
  recommendation: string;
}

export interface AgentResponse {
  agent: 'router' | 'data_engineer' | 'scholar' | 'code_generator' | 'critic';
  content: string;
  citations?: Citation[];
  code?: CodeBlock[];
  data_issues?: DataIssue[];
  confidence: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentAgent?: string;
  streamingContent: string;
}
