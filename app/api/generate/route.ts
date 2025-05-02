import { type NextRequest, NextResponse } from "next/server"
import { generateText, generateEnhancedDemoText, QuotaExceededError } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json().catch((error) => {
      console.error("Error parsing request body:", error)
      return {}
    })

    const { prompt, text, tone, action, apiKey } = body

    console.log("Received request:", { prompt, text, tone, action, hasApiKey: !!apiKey })

    if (!action) {
      return NextResponse.json({ error: "Missing required field: action" }, { status: 400 })
    }

    // Use the API key from the request if provided, otherwise use environment variables
    const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""

    try {
      // Try to generate text with the OpenAI API
      const result = await generateText(prompt || "", text || "", tone || "casual", action, effectiveApiKey)

      // Check if the result contains the demo mode marker
      const isDemoMode = result.includes("[Demo Mode:")

      if (isDemoMode) {
        return NextResponse.json({
          result,
          isDemoMode: true,
          message: "Using demo mode due to API limitations",
        })
      }

      return NextResponse.json({ result })
    } catch (error) {
      console.error("Error generating text:", error)

      // Generate demo text for the response
      const demoResult = generateEnhancedDemoText(text || "", action)

      // If it's a quota exceeded error, return a specific error code and message
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            result: demoResult,
            error: "OpenAI API quota exceeded",
            details: error.message,
            quotaExceeded: true,
            isDemoMode: true,
          },
          { status: 200 }, // Return 200 to prevent client-side errors
        )
      }

      // For other errors, return a generic error message with demo result
      return NextResponse.json(
        {
          result: demoResult,
          error: "Failed to generate text",
          details: error instanceof Error ? error.message : String(error),
          isDemoMode: true,
        },
        { status: 200 }, // Return 200 to prevent client-side errors
      )
    }
  } catch (error) {
    console.error("Error in API route:", error)

    // Ensure we always return a properly formatted JSON response with demo text
    return NextResponse.json(
      {
        result: generateEnhancedDemoText("", "continue"),
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
        isDemoMode: true,
      },
      { status: 200 }, // Return 200 to prevent client-side errors
    )
  }
}
