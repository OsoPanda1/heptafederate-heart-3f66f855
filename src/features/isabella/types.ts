export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  reasoning?: string;
  createdAt: number;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ReasoningEffort = "none" | "low" | "medium";

export const ISABELLA_STORAGE_KEY = "isabella.conversations.v1";
