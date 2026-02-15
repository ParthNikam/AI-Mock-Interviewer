import { NextResponse } from 'next/server'
import questionsData from '@/lib/questions/ques.json'

export async function GET() {
  try {
    const questions = questionsData.role_based_questions
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}
