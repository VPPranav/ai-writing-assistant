// Custom error class for quota exceeded errors
export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "QuotaExceededError"
  }
}

type ToneType = "formal" | "casual" | "persuasive" | "informative" | "creative"
type ActionType = "continue" | "rewrite" | "expand" | "summarize"

// Helper function to implement retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
  }: { maxRetries?: number; initialDelay?: number; maxDelay?: number } = {},
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if it's a quota exceeded error - don't retry these
      if (lastError.message.includes("exceeded your current quota") || lastError.message.includes("billing details")) {
        throw new QuotaExceededError(
          "OpenAI API quota exceeded. Please check your billing details at https://platform.openai.com/account/billing",
        )
      }

      // If it's the last attempt, don't wait, just throw
      if (attempt === maxRetries - 1) {
        break
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(initialDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay)
      console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`)

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`)
}

// Fallback function that generates text without using the API
export function generateDemoText(text: string, action: ActionType): string {
  switch (action) {
    case "continue":
      return text
        ? text +
            " This is demo text generated without using the OpenAI API. To use the full functionality, please check your OpenAI API key and billing details."
        : "This is demo text generated without using the OpenAI API. To use the full functionality, please check your OpenAI API key and billing details."
    case "rewrite":
      return "This is a rewritten version of your text. To use the full functionality, please check your OpenAI API key and billing details."
    case "expand":
      return (
        text +
        " This is an expanded version with more details. To use the full functionality, please check your OpenAI API key and billing details."
      )
    case "summarize":
      return "This is a summary of your text. To use the full functionality, please check your OpenAI API key and billing details."
    default:
      return "Demo text. To use the full functionality, please check your OpenAI API key and billing details."
  }
}

// Generate more interesting demo text based on the action
export function generateEnhancedDemoText(text: string, action: ActionType): string {
  // Base text to work with
  const baseText = text || "The quick brown fox jumps over the lazy dog."

  switch (action) {
    case "continue":
      return (
        baseText +
        " Meanwhile, the clever rabbit watched from a distance, contemplating the scene with amusement. " +
        "The forest was alive with activity as other creatures went about their daily routines. " +
        "[Demo Mode: This is generated without using the OpenAI API]"
      )

    case "rewrite":
      return (
        "A swift auburn fox leaped over a dormant canine. The agile creature gracefully bounded across, " +
        "while the indolent dog remained motionless, unaware of the acrobatic display happening above. " +
        "[Demo Mode: This is generated without using the OpenAI API]"
      )

    case "expand":
      return (
        baseText +
        " The fox, with its vibrant reddish-orange fur gleaming in the sunlight, demonstrated remarkable agility " +
        "as it gracefully soared through the air. The dog, a large brown hound with droopy ears, lay peacefully " +
        "in the warm grass, completely oblivious to the athletic prowess being displayed mere inches above its head. " +
        "This scene took place at the edge of a meadow, where the tall grass swayed gently in the summer breeze. " +
        "[Demo Mode: This is generated without using the OpenAI API]"
      )

    case "summarize":
      return "An agile fox jumped over a resting dog. " + "[Demo Mode: This is generated without using the OpenAI API]"

    default:
      return (
        "The quick brown fox jumps over the lazy dog. " + "[Demo Mode: This is generated without using the OpenAI API]"
      )
  }
}

// Direct API call to OpenAI
export async function generateTextWithFetch(
  apiKey: string,
  prompt: string,
  text: string,
  tone: ToneType,
  action: ActionType,
): Promise<string> {
  try {
    if (!apiKey) {
      console.warn("No OpenAI API key provided, using demo mode")
      return generateEnhancedDemoText(text, action)
    }

    let systemPrompt = `You are an AI writing assistant that helps users improve their writing. `

    // Add tone instructions
    switch (tone) {
      case "formal":
        systemPrompt += "Write in a formal, professional tone. Use proper grammar and avoid contractions or slang. "
        break
      case "casual":
        systemPrompt += "Write in a casual, conversational tone. Use contractions and everyday language. "
        break
      case "persuasive":
        systemPrompt += "Write in a persuasive tone. Use compelling arguments and emotional appeals. "
        break
      case "informative":
        systemPrompt += "Write in an informative tone. Focus on facts and clear explanations. "
        break
      case "creative":
        systemPrompt += "Write in a creative, expressive tone. Use vivid language and imagery. "
        break
      default:
        systemPrompt += "Write in a balanced, neutral tone. "
    }

    // Create the user prompt based on the action
    let userPrompt = ""
    switch (action) {
      case "continue":
        userPrompt = `Continue the following text in a natural way, maintaining the same style and flow: "${text || "Start writing something creative."}"`
        break
      case "rewrite":
        userPrompt = `Rewrite the following text to improve clarity and flow: "${text}"`
        break
      case "expand":
        userPrompt = `Expand on the following text with more details and examples: "${text}"`
        break
      case "summarize":
        userPrompt = `Summarize the following text concisely while preserving the key points: "${text}"`
        break
      default:
        userPrompt = `Improve the following text: "${text}"`
    }

    // Add the custom prompt if provided
    if (prompt && prompt.trim()) {
      userPrompt += ` Additional instructions: ${prompt}`
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        // Check for quota exceeded or billing issues
        if (
          errorData?.error?.message?.includes("exceeded your current quota") ||
          errorData?.error?.message?.includes("billing") ||
          errorData?.error?.type === "insufficient_quota" ||
          response.status === 429
        ) {
          console.warn("OpenAI API quota exceeded, using demo mode")
          throw new QuotaExceededError(
            "OpenAI API quota exceeded. Please check your billing details at https://platform.openai.com/account/billing",
          )
        }

        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      // If it's a quota exceeded error, return demo text directly
      if (error instanceof QuotaExceededError) {
        console.warn("Quota exceeded, using demo mode:", error.message)
        return generateEnhancedDemoText(text, action)
      }

      // For network errors or other issues, also use demo mode
      console.error("Error in OpenAI API call:", error)
      return generateEnhancedDemoText(text, action)
    }
  } catch (error) {
    console.error("Error in direct OpenAI API call:", error)

    // Always fall back to demo mode for any error
    return generateEnhancedDemoText(text, action)
  }
}

// Simplified version of generateText that doesn't rely on AI SDK
export async function generateText(
  prompt: string,
  text: string,
  tone: ToneType,
  action: ActionType,
  customApiKey?: string,
): Promise<string> {
  try {
    // Check if we're in a browser environment (client-side)
    const isClient = typeof window !== "undefined"

    // Get API key from provided parameter, environment variable (server-side) or localStorage (client-side)
    const apiKey =
      customApiKey ||
      (isClient
        ? localStorage.getItem("openai_api_key") || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
        : process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || "")

    if (!apiKey) {
      console.warn("OpenAI API key not found, using demo mode")
      return generateEnhancedDemoText(text, action)
    }

    try {
      return await generateTextWithFetch(apiKey, prompt, text, tone, action)
    } catch (error) {
      // If it's a quota exceeded error, return demo text
      if (error instanceof QuotaExceededError) {
        console.warn("Quota exceeded, using demo mode:", error.message)
        return generateEnhancedDemoText(text, action)
      }

      // For other errors, also use demo mode
      console.error("Error generating text:", error)
      return generateEnhancedDemoText(text, action)
    }
  } catch (error) {
    console.error("Error in text generation:", error)
    return generateEnhancedDemoText(text, action)
  }
}
