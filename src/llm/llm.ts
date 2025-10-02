import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';

import { llmConfig } from '../configs/llm.config';

// Initialize LLM instances
export const groqModel = new ChatGroq({
    apiKey: llmConfig.groq.apiKey,
    model: llmConfig.groq.model,
    temperature: llmConfig.groq.temperature,
});

export const geminiModel = new ChatGoogleGenerativeAI({
    apiKey: llmConfig.gemini.apiKey,
    model: llmConfig.gemini.model,
    temperature: llmConfig.gemini.temperature,
});

// HuggingFace Mistral model
export const huggingfaceModel = new HuggingFaceInference({
    apiKey: llmConfig.huggingface.apiKey,
    model: llmConfig.huggingface.model,
    temperature: llmConfig.huggingface.temperature,
    maxTokens: llmConfig.huggingface.maxTokens,
});
