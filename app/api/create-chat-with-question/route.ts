import { NextRequest, NextResponse } from 'next/server'
import { uploadChat } from '@/lib/api/chat'

export async function POST(request: NextRequest) {
  try {
    const { question, role, company } = await request.json()

    if (!question || !role) {
      return NextResponse.json(
        { error: 'Missing required parameters: question and role' },
        { status: 400 }
      )
    }

    // Create a new chat with the specific question
    const chatId = await uploadChat({
      message: question,
      sender: "assistant",
      category: role,
    })

    return NextResponse.json({ chatId })

  } catch (error) {
    console.error('Error creating chat with question:', error)
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    )
  }
}
