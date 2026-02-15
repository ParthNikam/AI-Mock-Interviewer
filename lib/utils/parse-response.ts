/**
 * Parses LLM response in format: "# Title\n### Sub-section\n- bullet\n- bullet\n\n# Title..."
 * Returns a JSON object where keys are titles and values are the bullet-point content.
 */
export function parseDetailedResponse(text: string) {
  const cleanText = text.replace(/\*\*/g, "").trim()

  type FeedbackContent = {
    positive: string[]
    improvement: string[]
    recommendations: string[]
  }

  const result: Record<string, FeedbackContent> = {}

  // Split by main sections (# headers)
  const sections = cleanText.split(/\n(?=#\s)/)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue

    const headerMatch = trimmed.match(/^#\s+([^\n]+)/)
    if (!headerMatch) continue

    const title = headerMatch[1].trim()

    const lines = trimmed.split("\n").map(l => l.trim())

    let currentKey: keyof FeedbackContent | null = null
    const content: FeedbackContent = {
      positive: [],
      improvement: [],
      recommendations: [],
    }

    for (const line of lines) {
      if (/^###\s*Positive Aspects/i.test(line)) {
        currentKey = "positive"
        continue
      }

      if (/^###\s*Areas for Improvement/i.test(line)) {
        currentKey = "improvement"
        continue
      }

      if (/^###\s*Actionable Recommendations/i.test(line)) {
        currentKey = "recommendations"
        continue
      }

      // Capture bullet points
      if (currentKey && /^-\s+/.test(line)) {
        const cleaned = line.replace(/^-+\s*/, "").trim()
        content[currentKey].push(cleaned)
      }
    }

    result[title] = content
  }

  return result
}