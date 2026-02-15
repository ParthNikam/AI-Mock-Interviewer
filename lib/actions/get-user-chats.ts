"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserChats() {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return []
    }

    // Fetch chats where owner is the current user
    const { data: chats, error } = await supabase
      .from('chats')
      .select('chat_id, message, created_at')
      .eq('sender', 'assistant') // Only get assistant messages (first message of each chat)
      .eq('owner_id', user.id)   // Only get chats owned by current user
      .order('created_at', { ascending: false }) // Most recent first

    if (error) {
      console.error('Error fetching chats:', error)
      return []
    }

    // Group by chat_id to get the first message of each chat
    const chatMap = new Map<string, { id: string; title: string; createdAt: string }>()
    
    chats.forEach((chat: { chat_id: string; message: string; created_at: string }) => {
      if (!chatMap.has(chat.chat_id)) {
        chatMap.set(chat.chat_id, {
          id: chat.chat_id,
          title: chat.message || 'Untitled Chat',
          createdAt: chat.created_at
        })
      }
    })

    return Array.from(chatMap.values())
  } catch (error) {
    console.error('Error in getUserChats:', error)
    return []
  }
}
