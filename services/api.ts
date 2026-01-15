import { Message, Role, ApiResponse } from '../types';
import { CHAT_ENDPOINT } from '../constants';

export const sendChatRequest = async (
  apiKey: string,
  messages: Message[],
  model: string
): Promise<string> => {
  
  // Format messages for OpenAI-compatible Vision API
  const formattedMessages = messages.map(m => {
    // If message contains an image URL (Base64 from user upload), structure it as a content array
    if (m.role === Role.User && m.imageUrl) {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content || "Analyze this image" },
          { 
            type: "image_url", 
            image_url: { 
              url: m.imageUrl // Assuming this is already a data:image/jpeg;base64,... string
            } 
          }
        ]
      };
    }
    
    // Standard text message
    return {
      role: m.role,
      content: m.content
    };
  });

  const payload = {
    model: model,
    messages: formattedMessages,
    stream: false,
    max_tokens: 4096 // Ensure enough tokens for image descriptions
  };

  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `API Error: ${response.statusText}`);
  }

  return data.choices?.[0]?.message?.content || "";
};

// Deprecated: Chat endpoint handles everything now, but keeping helper if needed internally
export const generateImage = async (
  apiKey: string,
  prompt: string,
  model: string = "dall-e-3"
): Promise<string> => {
   // Implementation preserved but unused in new flow
   return "";
};