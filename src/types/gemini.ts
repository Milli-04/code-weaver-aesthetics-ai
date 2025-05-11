
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
    details: Array<any>;
  };
}
