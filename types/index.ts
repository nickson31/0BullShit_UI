export interface Investor {
  id: string | number;
  name: string;
  company: string;
  location: string;
  focus: string;
  isFavorite: boolean;
}

export interface Employee {
  id: string | number;
  name: string;
  position: string;
  company: string;
  linkedIn: string;
  isFavorite: boolean;
}

export interface MessageTemplate {
  id: string | number;
  name: string;
  description: string;
  subject: string;
  body: string;
}

export interface Campaign {
  id: string | number;
  name: string;
  status: "active" | "paused";
  progress: number;
  sent: number;
  responses: number;
  meetings: number;
  template: string;
}

export interface Project {
  id: string | number;
  name: string;
  active: boolean;
}

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
} 