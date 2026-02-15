import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.DEEPGRAM_API_KEY
  console.log("deepgram api", apiKey);
  if (!apiKey) {
    return NextResponse.json({ error: "Missing DEEPGRAM_API_KEY" }, { status: 500 })
  }

  const form = await request.formData()
  const file = form.get("audio") as File | null
  if (!file) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const body = Buffer.from(arrayBuffer)
    const resp = await fetch(
      `https://api.deepgram.com/v1/listen?model=general&language=en&punctuate=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body,
      }
    )

    if (!resp.ok) {
      const text = await resp.text()
      console.error("Deepgram error:", text)
      return NextResponse.json({ error: text }, { status: resp.status })
    }

    const json = await resp.json()
    const transcript = json?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""

    return NextResponse.json({ transcript })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}
