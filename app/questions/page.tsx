"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { startInterview } from "@/lib/actions/interview"
import type { Question } from "@/lib/questions"

export default function QuestionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const ROLES = [
    "Product Manager",
    "Technical Architect", 
    "Software Engineer",
    "Data Scientist",
    "Human Resources",
    "Growth Marketer",
    "Customer Success Lead",
    "Visionary Leader",
  ]

  useEffect(() => {
    // Load questions from the JSON file
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data)
        setFilteredQuestions(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading questions:", error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = questions

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((q) => q.role === selectedRole)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredQuestions(filtered)
  }, [questions, selectedRole, searchTerm])

  const handleQuestionClick = async (question: Question) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      // Create a new chat with the specific question
      const response = await fetch('/api/create-chat-with-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          role: question.role,
          company: question.company,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const { chatId } = await response.json()
      router.push(`/chat/${chatId}?role=${encodeURIComponent(question.role)}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Questions</h1>
        <p className="text-muted-foreground">
          Click on any question to start an interview practice session
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search questions, companies, or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleQuestionClick(question)}
          >
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 leading-relaxed">
                    {question.question}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{question.company}</Badge>
                    <Badge variant="outline">{question.role}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Start →
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No questions found matching your filters.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("")
              setSelectedRole("all")
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
