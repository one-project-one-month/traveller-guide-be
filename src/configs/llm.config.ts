import { serverConfig } from './server.config';

export const llmConfig = {
    groq: {
        apiKey: serverConfig.groqApiKey,
        model: serverConfig.groqModel,
        temperature: serverConfig.temperature,
    },
    gemini: {
        apiKey: serverConfig.geminiApiKey,
        model: serverConfig.geminiModel,
        temperature: serverConfig.temperature,
    },
    huggingface: {
        apiKey: serverConfig.huggingfaceApiKey,
        model: serverConfig.huggingfaceModel,
        temperature: serverConfig.temperature,
        maxTokens: serverConfig.maxTokens,
    },
};
