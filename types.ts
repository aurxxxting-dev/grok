export enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export interface Message {
  role: Role;
  content: string;
  imageUrl?: string; // For generated images or user uploaded base64 images
}

export interface ChatConfig {
  apiKey: string;
  model: string;
}

export interface ApiResponse {
  choices?: {
    message: {
      content: string;
    }
  }[];
  error?: {
    message: string;
  };
}