"use server"

import { getLLMResponse } from "@/lib/api/chat"

export async function submitAnswer(params: {
  role: string
  question: string
  answer: string
  chatId: string
}) {
  try {
    console.log('Starting LLM response generation with params:', params);
    const result = await getLLMResponse(params);
    console.log('LLM response generated successfully');
    return result;
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    throw new Error('Failed to process your answer. Please try again.');
  }
}
