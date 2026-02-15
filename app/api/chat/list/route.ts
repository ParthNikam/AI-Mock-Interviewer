import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  try {
    // Get current user
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    console.log(user);

    const { data: chats, error } = await supabase
    .from('chats')
    .select('chat_id, message, created_at')
    .eq('owner', user.id)   // foreign key match
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
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

    return NextResponse.json(Array.from(chatMap.values()))
  } catch (error) {
    console.error('Error in chat list API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
