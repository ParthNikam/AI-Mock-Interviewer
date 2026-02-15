import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete chat messages
    const { error: messagesError } = await supabase
      .from('chats')
      .delete()
      .eq('chat_id', id)

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to delete chat messages' },
        { status: 500 }
      )
    }

    // Delete recommendations
    const { error: recomsError } = await supabase
      .from('recoms')
      .delete()
      .eq('chat_id', id)

    if (recomsError) {
      console.error('Error deleting recommendations:', recomsError)
      // Don't fail the request if recommendations deletion fails
      // as the chat messages are already deleted
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    )
  }
}
