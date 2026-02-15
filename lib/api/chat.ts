import { createClient } from "../supabase/server";
import { randomUUID } from "crypto";
import Groq from "groq-sdk";
import { parseDetailedResponse } from "@/lib/utils/parse-response";

export type ChatSender = "user" | "assistant";

export type ChatMessage = {
  id: string;
  chat_id: string;
  message: string;
  sender: ChatSender;
  created_at?: string;
  category?: string;
};

export async function uploadChat(params: {
  message: string;
  sender: ChatSender;
  chatId?: string;
  category?: string;
  owner?: string;
}): Promise<string> {
  const chatId = params.chatId ?? randomUUID();
  const supabase = await createClient();

  // If this is the first message in a new chat, get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const row: Record<string, unknown> = {
    chat_id: chatId,
    message: params.message,
    sender: params.sender,
  };
  
  // Add owner for the first message in a chat
  if (user && !params.chatId) {
    row.owner = user.id;
  }
  
  if (params.category != null) row.category = params.category;

  const { error } = await supabase.from("chats").insert(row);

  if (error) {
    throw new Error(`Failed to upload chat: ${error.message}`);
  }

  return chatId;
}

// Fetches messages for a chat, ordered by created_at
export async function getChatMessages(
  chatId: string
): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .select("id, chat_id, message, sender, created_at, category")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch chat: ${error.message}`);
  }

  return (data ?? []) as ChatMessage[];
}

// Parsed recommendations: { title: bulletContent, ... }
export type RecomData = string; // Record<string, { positive: string; improvement: string; recommendations: string }>;

// Upserts parsed recommendations to recoms collection
export async function uploadToRecoms(params: {
  chatId: string;
  data: RecomData;
  score?: Record<string, number>;
}): Promise<void> {
  const supabase = await createClient();
  const uploadData: any = { 
    chat_id: params?.chatId, 
    message: params?.data 
  };
  
  if (params?.score) {
    uploadData.score = params.score;
  }
  
  const { error } = await supabase
    .from("recoms")
    .upsert(uploadData, { onConflict: "chat_id" });

  if (error) {
    throw new Error(`Failed to upload recoms: ${error.message}`);
  }
}

// Fetches recommendations for a chat
export async function getRecom(chatId: string): Promise<{message: RecomData, score: Record<string, number>} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recoms")
    .select("message, score")
    .eq("chat_id", chatId)
    .single();

  if (error || !data) return null;
  return {
    message: data.message as RecomData,
    score: data.score as Record<string, number> || {}
  };
}

const INTERVIEW_AGENTS = [
  {
      "code": "PM",
      "role": "Product Manager",
      "prompt": "Evaluate based on: Structure and Clarity, Creativity and Innovation, Depth of Analysis, Market Understanding, Business and Strategy, Technical Feasibility, Personalization and Decision Making."
  },
  {
      "code": "TA",
      "role": "Technical Architect",
      "prompt": "Evaluate based on: Logical Decomposition, System Scalability, Trade-off Analysis, Edge Case Resilience, Clean Code & Patterns, Technical Communication, and Security Mindset."
  },
  {
      "code": "SE",
      "role": "Software Engineer",
      "prompt": "Evaluate based on: Algorithmic Efficiency, Code Readability, Testing & Validation, Problem-Solving Logic, Tool/Framework Mastery, Documentation Quality, and Version Control Best Practices."
  },
  {
      "code": "DS",
      "role": "Data Scientist",
      "prompt": "Evaluate based on: Feature Engineering Logic, Model Selection Reasoning, Handling Bias & Overfitting, Statistical Significance, Deployment Feasibility, Data Intuition, and Evaluation Metrics Selection."
  },
  {
      "code": "HR",
      "role": "Human Resources",
      "prompt": "Evaluate based on: Conflict Resolution, Cultural Alignment, Behavioral Consistency, Communication Style, Growth Mindset, Policy Awareness, and Team Collaboration Potential."
  },
  {
      "code": "GM",
      "role": "Growth Marketer",
      "prompt": "Evaluate based on: Data Literacy, Hypothesis Generation, Channel Mastery, Experimentation Rigor, Creative Intuition, Cross-Functional Ops, and Budget Efficiency."
  },
  {
      "code": "CSL",
      "role": "Customer Success Lead",
      "prompt": "Evaluate based on: De-escalation Skills, Proactive Strategy, Value Realization, Empathy & Active Listening, Relationship Building, Product Expertise, and Expansion Identification."
  },
  {
      "code": "VL",
      "role": "Visionary Leader",
      "prompt": "Evaluate based on: Strategic Agility, Cultural Stewardship, Talent Development, Decision-Making Under Pressure, Influence & Persuasion, Operational Excellence, and Emotional Intelligence (EQ)."
  }
]

const UNIVERSAL_FORMAT = `
For each of the 7 factors above, provide ONLY:
- Positive Aspects (2-3 bullets, 1-2 lines each)
- Areas for Improvement (2-3 bullets, 1-2 lines each)
- Actionable Recommendations (2-3 bullets, 1-2 lines each)
- each header begins with #
- each sub-section begins with ###
- each bullet point begins with -

No intro or outro text. Be clinical, demanding and objective. 
`

// Generate numerical scores for evaluation criteria
async function generateScores(evaluationText: string, role: string): Promise<Record<string, number>> {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Get the role-specific criteria
  const rolePrompt = INTERVIEW_AGENTS.find((agent) => agent.role === role)?.prompt || "";
  
  const scoringPrompt = `
Based on the following evaluation feedback, provide a numerical score (1-10) for EACH evaluation factor mentioned in the role criteria.

Role Criteria: ${rolePrompt}

Evaluation Feedback:
${evaluationText}

Return ONLY a JSON object with factor names as keys and numerical scores (1-10) as values.
Example format:
{
  "Structuring & Clarity": 7,
  "Creativity & Innovation": 6,
  "Depth of Analysis": 8
}

IMPORTANT: 
- Score each factor mentioned in the criteria
- Use numbers 1-10 only
- Return valid JSON only
`;

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "user", content: scoringPrompt }
      ],
      temperature: 0.3,
      max_completion_tokens: 1024,
      top_p: 1,
      reasoning_effort: "low",
      stream: false,
      stop: null
    });

    const scoreResponse = completion.choices?.[0]?.message?.content || "{}";
    console.log("📊 Raw score response:", scoreResponse);
    
    const scoreData = JSON.parse(scoreResponse);
    console.log("✅ Parsed score data:", scoreData);
    return scoreData;
  } catch (error) {
    console.error("❌ Error generating scores:", error);
    return {};
  }
}

export const getLLMResponse = async function(params: {
  role: string
  question: string
  answer: string
  chatId: string
}): Promise<string> {
  const { role, question, answer, chatId } = params

  await uploadChat({
    message: answer,
    sender: "user",
    chatId,
  })

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = INTERVIEW_AGENTS.find((m) => m.role === role)?.prompt

  const SYSTEM_PROMPT = prompt + UNIVERSAL_FORMAT

  const USER_PROMPT = `
  ### INTERVIEW QUESTION
  ${question}

  ### CANDIDATE RESPONSE FOR EVALUTAION
  ${answer}
  `

  const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT }
    ],
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    reasoning_effort: "medium",
    stream: true,
    stop: null
  });
  
  
  let fullResponse = "";

  for await (const chunk of completion) {
    const content = chunk.choices?.[0]?.delta?.content ?? "";
    fullResponse += content;
  }

  // Generate scores for the evaluation
  console.log("📊 Generating scores for evaluation...");
  const scoreData = await generateScores(fullResponse, role);
  
  await uploadToRecoms({
    chatId,
    data: fullResponse,
    score: scoreData,
  });

  return fullResponse;
}

