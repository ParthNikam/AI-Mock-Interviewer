import questionsData from "./ques.json"

export type Question = {
  company: string
  question: string
  role: string
}

const allQuestions: Question[] =
  questionsData.role_based_questions as Question[]

export function getRandomQuestion(role?: string): Question {
  const questions = role 
    ? allQuestions.filter(q => q.role === role)
    : allQuestions;
  
  if (questions.length === 0) {
    // Fallback to any question if no questions found for the role
    return allQuestions[Math.floor(Math.random() * allQuestions.length)]!
  }
  
  return questions[Math.floor(Math.random() * questions.length)]!
}
