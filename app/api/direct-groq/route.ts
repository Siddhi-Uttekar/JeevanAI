import { NextResponse } from "next/server"

// Alternative implementation using direct Groq API if you prefer not to use the AI SDK
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { conversation, patientInfo } = data

    // Format the conversation history and patient info for the AI
    const prompt = formatPromptFromConversation(conversation, patientInfo)

    // Define the system prompt for the medical assistant
    const MEDICAL_SYSTEM_PROMPT = `
    You are a medical symptom analysis assistant. Your job is to:

    1. Analyze patient symptoms and information
    2. Identify possible conditions based on the symptoms
    3. Provide a probability assessment for each condition
    4. Suggest appropriate recommendations
    5. Determine the appropriate level of care needed

    Always format your response as a JSON object with the following structure:
    {
      "nextQuestion": string | null, // The next question to ask the patient, or null if diagnosis is complete
      "conditions": [{ "name": string, "probability": number }], // Array of possible conditions with probabilities (0-1)
      "recommendations": string[], // Array of recommendations
      "careLevel": "self-care" | "primary care" | "specialist" | "urgent care" | "emergency", // Recommended level of care
      "reasoning": string // Brief explanation of your reasoning
    }

    IMPORTANT: Your response MUST be a valid JSON object with the exact structure specified above.
    Do not include any text before or after the JSON object.

    Be medically accurate but cautious. When in doubt, recommend seeking professional medical advice.
    Do not diagnose rare or extremely serious conditions without strong evidence.
    Always consider common conditions first, following medical best practices.
    `

    console.log("Calling Groq API directly with prompt:", prompt.substring(0, 200) + "...")

    try {
      // Set up a timeout for the API call
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15-second timeout

      // Call Groq API directly
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Using a model that's definitely available on Groq
          messages: [
            { role: "system", content: MEDICAL_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Groq API error:", errorData)
        throw new Error(`Groq API error: ${response.status}`)
      }

      const result = await response.json()
      const aiResponse = result.choices[0].message.content

      console.log("Groq API direct response received, length:", aiResponse.length)

      // Parse the response as JSON
      let parsedResponse
      try {
        parsedResponse = JSON.parse(aiResponse)
      } catch (error) {
        console.error("Failed to parse AI response as JSON:", error)
        console.log("Raw response:", aiResponse)

        // Fallback: If the model didn't return valid JSON, try to extract it
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0])
          } catch (e) {
            console.error("Failed to extract JSON from response:", e)
            // If we still can't parse JSON, return a fallback response
            return NextResponse.json(createFallbackResponse(patientInfo))
          }
        } else {
          console.error("No JSON object found in response")
          // If no JSON object is found, return a fallback response
          return NextResponse.json(createFallbackResponse(patientInfo))
        }
      }

      return NextResponse.json(parsedResponse)
    } catch (error) {
      console.error("Error calling Groq API directly:", error)
      // If the direct API call fails, return a fallback response
      return NextResponse.json(createFallbackResponse(patientInfo))
    }
  } catch (error) {
    console.error("Error in symptom analysis:", error)
    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}

// Helper function to format the conversation history and patient info into a prompt
function formatPromptFromConversation(conversation: any[], patientInfo: any) {
  // Create a structured representation of the conversation and patient info
  const formattedConversation = conversation
    .map((message) => {
      if (message.role === "assistant") {
        return `Medical Assistant: ${message.content}`
      } else {
        return `Patient: ${message.content}`
      }
    })
    .join("\n\n")

  // Add patient information
  let patientInfoText = "Patient Information:\n"
  for (const [key, value] of Object.entries(patientInfo)) {
    if (value && value !== "") {
      patientInfoText += `- ${key}: ${value}\n`
    }
  }

  return `
${patientInfoText}

Conversation History:
${formattedConversation}

Based on the above information, analyze the patient's symptoms and provide your assessment. If you need more information, provide the next question to ask. If you have enough information, provide a diagnosis with possible conditions, recommendations, and the appropriate level of care.
`
}

// Create a fallback response when the AI fails
function createFallbackResponse(patientInfo: any) {
  const symptoms = patientInfo.symptoms?.toLowerCase() || ""

  // Default fallback response
  let response = {
    nextQuestion:
      "Could you please provide more details about your symptoms? When did they start, and have you noticed anything that makes them better or worse?",
    conditions: [],
    recommendations: [],
    careLevel: "primary care",
    reasoning: "Not enough information to make an assessment yet.",
  }

  // If this is the first message and we don't have symptoms yet
  if (!symptoms || symptoms === "") {
    return response
  }

  // If we have some symptoms, provide a more helpful fallback
  if (symptoms.includes("headache") || symptoms.includes("head pain")) {
    response = {
      nextQuestion: null,
      conditions: [
        { name: "Tension headache", probability: 0.7 },
        { name: "Migraine", probability: 0.4 },
        { name: "Dehydration", probability: 0.3 },
      ],
      recommendations: [
        "Rest in a quiet, dark room",
        "Stay hydrated",
        "Consider over-the-counter pain relievers if appropriate",
        "Consult with a healthcare professional if symptoms persist or worsen",
      ],
      careLevel: "self-care",
      reasoning:
        "Headaches are common and often respond to self-care measures. However, persistent or severe headaches should be evaluated by a healthcare professional.",
    }
  } else if (symptoms.includes("fever") || symptoms.includes("temperature")) {
    response = {
      nextQuestion: null,
      conditions: [
        { name: "Viral infection", probability: 0.6 },
        { name: "Common cold", probability: 0.5 },
        { name: "Influenza", probability: 0.3 },
      ],
      recommendations: [
        "Rest and stay hydrated",
        "Take fever-reducing medication if appropriate",
        "Monitor your temperature",
        "Seek medical attention if fever is high or persists for more than 3 days",
      ],
      careLevel: "self-care",
      reasoning:
        "Fevers are often caused by infections and may resolve with rest and fluids. However, high or persistent fevers should be evaluated by a healthcare professional.",
    }
  } else if (symptoms.includes("cough") || symptoms.includes("congestion")) {
    response = {
      nextQuestion: null,

      conditions: [
        { name: "Common cold", probability: 0.7 },
        { name: "Allergies", probability: 0.4 },
        { name: "Bronchitis", probability: 0.2 },
      ],
      recommendations: [
        "Rest and stay hydrated",
        "Use over-the-counter cough medications if appropriate",
        "Use a humidifier to ease congestion",
        "Seek medical attention if symptoms worsen or persist beyond 10 days",
      ],
      careLevel: "self-care",
      reasoning:
        "Coughs and congestion are common symptoms of upper respiratory infections or allergies. They often resolve with self-care, but persistent symptoms should be evaluated.",
    }
  } else if (symptoms.includes("joint") || symptoms.includes("pain")) {
    response = {
      nextQuestion: null,
      conditions: [
        { name: "Muscle strain", probability: 0.6 },
        { name: "Arthritis", probability: 0.4 },
        { name: "Tendonitis", probability: 0.3 },
      ],
      recommendations: [
        "Rest the affected area",
        "Apply ice to reduce inflammation",
        "Consider over-the-counter pain relievers if appropriate",
        "Consult with a healthcare professional if pain is severe or persistent",
      ],
      careLevel: "primary care",
      reasoning:
        "Joint and muscle pain can have many causes. While mild pain may respond to self-care, persistent or severe pain should be evaluated by a healthcare professional.",
    }
  } else {
    // Generic response for other symptoms
    response = {
      nextQuestion: null,
      conditions: [
        { name: "Common condition", probability: 0.5 },
        { name: "Mild temporary condition", probability: 0.4 },
        { name: "Stress-related condition", probability: 0.3 },
      ],
      recommendations: [
        "Rest and monitor your symptoms",
        "Stay hydrated and maintain a healthy diet",
        "Consider over-the-counter remedies appropriate for your symptoms",
        "Consult with a healthcare professional if symptoms persist or worsen",
      ],
      careLevel: "primary care",
      reasoning:
        "Based on the limited information provided, it's difficult to make a specific assessment. A healthcare professional can provide a more accurate diagnosis.",
    }
  }

  return response
}
import { NextResponse } from "next/server"

// Enhanced system prompt
const MEDICAL_SYSTEM_PROMPT = `
You are a medical assistant conducting structured symptom interviews. Follow EXACTLY this protocol:

1. FIRST REQUEST:
   "To begin, please provide your age and biological sex (male/female)."

2. If age/sex missing:
   "I need your age and biological sex to proceed. For example: 'I'm 30 male'."

   3.Analyze patient symptoms and information
  4.Identify possible conditions based on the symptoms
   5.Provide a probability assessment for each condition
    6. Suggest appropriate recommendations
  7. Determine the appropriate level of care needed

5. Only proceed to analysis after:
   - Age and sex confirmed
   - At least 3 symptom details per symptom

Response MUST be JSON with this structure:
{
  "stage": "collecting_info" | "analysis",
  "missingInfo": string[],
  "nextQuestion": string,
  "collectedData": {
    "age": number | null,
    "gender": string | null,
    "symptoms": {
      "name": string,
      "duration": string | null,
      "severity": number | null,
      "description": string | null,
      "triggers": string | null
    }[]
  },
  "analysis": null | {
    "conditions": { "name": string, "probability": number }[],
    "recommendations": string[],
    "careLevel": "self-care" | "primary" | "urgent" | "emergency"
  }
}
`

export async function POST(request: Request) {
  try {
    const { conversation, patientInfo = {} } = await request.json()

    // Parse conversation to extract data
    const { age, gender, symptoms } = parseConversation(conversation)

    // Prepare prompt
    const prompt = `
Patient Information:
- Age: ${age || 'Not provided'}
- Sex: ${gender || 'Not provided'}
- Symptoms: ${symptoms.length > 0 ? symptoms.map(s => s.name).join(', ') : 'None'}

Conversation History:
${conversation.map(m => `${m.role === 'assistant' ? 'Doctor' : 'Patient'}: ${m.content}`).join('\n')}

Please continue the medical interview according to the protocol.`

    // Call Groq API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: MEDICAL_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const result = await response.json()
    const content = JSON.parse(result.choices[0].message.content)

    return NextResponse.json(content)

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({
      stage: "collecting_info",
      missingInfo: ["age", "gender"],
      nextQuestion: "To begin, please provide your age and biological sex (male/female).",
      collectedData: { age: null, gender: null, symptoms: [] },
      analysis: null
    }, { status: 500 })
  }
}

// Enhanced conversation parser
function parseConversation(conversation: any[]) {
  let age: number | null = null
  let gender: string | null = null
  const symptoms: any[] = []
  let currentSymptom: any = null

  for (const msg of conversation) {
    if (msg.role === 'user') {
      // Extract age
      if (!age) {
        const ageMatch = msg.content.match(/(\d+)\s*(year|yo|y\.o)/i)
        if (ageMatch) age = parseInt(ageMatch[1])
      }

      // Extract gender
      if (!gender) {
        if (msg.content.match(/male|man|boy|m\b/i)) gender = "male"
        if (msg.content.match(/female|woman|girl|f\b/i)) gender = "female"
      }

      // Symptom handling
      if (msg.content.match(/symptom|pain|ache|feel|experience/i)) {
        if (!currentSymptom) {
          currentSymptom = {
            name: extractSymptomName(msg.content),
            duration: null,
            severity: null,
            description: null,
            triggers: null
          }
          symptoms.push(currentSymptom)
        } else {
          // Check for answers to symptom questions
          if (msg.content.match(/day|week|month|year|hour/i)) {
            currentSymptom.duration = msg.content
          } else if (msg.content.match(/\d+\s*out of 10|\b\d+\b/i)) {
            const severityMatch = msg.content.match(/\b\d+\b/)
            if (severityMatch) currentSymptom.severity = parseInt(severityMatch[0])
          } else if (msg.content.match(/describe|feels like|nature/i)) {
            currentSymptom.description = msg.content
          } else if (msg.content.match(/better|worse|trigger|alleviate/i)) {
            currentSymptom.triggers = msg.content
          }
        }
      }
    }
  }

  return { age, gender, symptoms }
}

function extractSymptomName(text: string): string {
  const symptomKeywords = [
    'headache', 'pain', 'fever', 'cough', 'nausea',
    'dizziness', 'fatigue', 'rash', 'swelling'
  ]

  for (const keyword of symptomKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      return keyword
    }
  }

  // Fallback to first few words
  return text.split(' ').slice(0, 3).join(' ').replace(/[.,]/, '')
}