export const API_BASE_URL = "https://ai.t8star.cn/v1";
export const CHAT_ENDPOINT = `${API_BASE_URL}/chat/completions`;
export const IMAGE_ENDPOINT = `${API_BASE_URL}/images/generations`;

export const DEFAULT_CHAT_MODEL = "grok-3";
export const DEFAULT_IMAGE_MODEL = "dall-e-3"; // Fallback for image generation if supported by provider

export const STORAGE_KEY_API_KEY = "grok_app_api_key";