"use server"

import { uploadChat } from "@/lib/api/chat"
import { getRandomQuestion } from "@/lib/questions"

export async function startInterview(role?: string) {
  const question = getRandomQuestion(role)
  const chatId = await uploadChat({
    message: question.question,
    sender: "assistant",
    category: question.role,
  })
  return { chatId }
}
