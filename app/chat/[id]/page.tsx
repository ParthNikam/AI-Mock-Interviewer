import { notFound, redirect } from "next/navigation"
import { getChatMessages } from "@/lib/api/chat"
import { ChatPageClient } from "./chat-page-client"
import { createClient } from "@/lib/supabase/server"

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Server-side auth check — redirect to signin when unauthenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth/signin')

  const { id: chatId } = await params
  const resolvedSearchParams = await searchParams

  let messages
  try {
    messages = await getChatMessages(chatId)
  } catch {
    notFound()
  }

  const initialQuestion =
    messages.find((m) => m.sender === "assistant") ?? null

  if (!initialQuestion) {
    notFound()
  }

  return (
    <ChatPageClient 
      chatId={chatId} 
      initialQuestion={initialQuestion}
      role={resolvedSearchParams.role as string || "Product Manager"}
    />
  )
}
