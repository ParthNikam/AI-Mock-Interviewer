import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getRecom, getChatMessages, type ChatMessage } from "@/lib/api/chat"
import { createClient } from "@/lib/supabase/server"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { parseDetailedResponse } from "@/lib/utils/parse-response"

type FeedbackContent = {
  positive: string[]
  improvement: string[]
  recommendations: string[]
}

type RecomData = Record<string, FeedbackContent>

type ScoreData = {
  overall: number
  criteria: {
    name: string
    score: number
    maxScore: number
  }[]
}

// Function to get color based on score (0-10 scale)
function getScoreColor(score: number): string {
  if (score <= 3) return 'text-red-500'      // Bad (0-3)
  if (score <= 6) return 'text-yellow-500'  // Medium (4-6)
  return 'text-green-500'                   // Good (7-10)
}

// Function to get background color class for progress bars
function getScoreBgColor(score: number): string {
  if (score <= 3) return 'bg-red-500'      // Bad (0-3)
  if (score <= 6) return 'bg-yellow-500'  // Medium (4-6)
  return 'bg-green-500'                   // Good (7-10)
}

export default async function RecomPage({ params }: { params: Promise<{ id: string }> }) {
  // Server-side auth check — redirect to signin when unauthenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth/signin')

  const resolvedParams = await params
  const { id } = resolvedParams
  
  const recomData = await getRecom(id);
  // console.log(recomData);
  if (!recomData || !recomData.message || Object.keys(recomData.message).length === 0) {
    console.error('No recommendations found for chat ID:', id);
    notFound()
  }

  const chatMessages = await getChatMessages(id);
  const parsedData = parseDetailedResponse(recomData.message);

  // Calculate score data from database or use mock data
  let scoreData: ScoreData;
  
  if (recomData?.score && Object.keys(recomData.score).length > 0) {
    const scores = recomData.score;
    const criteria = Object.entries(scores).map(([name, score]) => ({
      name,
      score: score as number,
      maxScore: 10
    }));
    
    const overall = Math.round((criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length) * 10) / 10
    
    scoreData = { overall, criteria };
    console.log("✅ Using actual scores from database:", scoreData);
  } else {
    // Mock score data - fallback
    scoreData = {
      overall: 4.4,
      criteria: [
        { name: "Structuring & Clarity", score: 5, maxScore: 10 },
        { name: "Creativity & Innovation", score: 4, maxScore: 10 },
        { name: "Depth of Analysis", score: 6, maxScore: 10 },
        { name: "Market Understanding", score: 3, maxScore: 10 },
        { name: "Business & Strategy", score: 7, maxScore: 10 },
        { name: "Technical Feasibility", score: 5, maxScore: 10 },
        { name: "Prioritization", score: 4, maxScore: 10 },
      ]
    };
    console.log("⚠️ Using mock scores - no scores found in database");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Interview Feedback</h1>
        <p className="text-muted-foreground mt-1">
          Evaluation of your response
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabs Section - 2/3 width */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="user-responses">User Responses & Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations" className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(parsedData).map(([title, content], index) => (
                  <AccordionItem
                    key={`${title}-${index}`}
                    value={`section-${index}`}
                  >
                    <AccordionTrigger>{title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {content.positive.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Positive Aspects</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {content.positive.map((point, pointIndex) => (
                                <li key={pointIndex}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {content.improvement.length > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {content.improvement.map((point, pointIndex) => (
                                <li key={pointIndex}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {content.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Actionable Recommendations</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {content.recommendations.map((point, pointIndex) => (
                                <li key={pointIndex}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="user-responses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Responses & Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-muted-foreground">No messages found for this chat.</p>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div className="font-medium text-sm mb-1">
                              {message.sender === "user" ? "You" : "Assistant"}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.message}
                            </div>
                            {message.created_at && (
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Score Card - 1/3 width */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Overall Score */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(scoreData.overall / 10) * 226} 226`}
                      className={getScoreColor(scoreData.overall)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{scoreData.overall}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>

              {/* Criteria Scores */}
              <div className="space-y-4">
                {scoreData.criteria.map((criterion, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{criterion.name}</span>
                      <span className={`text-sm ${getScoreColor(criterion.score)}`}>
                        {criterion.score}/{criterion.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(criterion.score)}`}
                        style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
