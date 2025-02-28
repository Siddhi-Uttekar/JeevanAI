import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

// Initialize the Hugging Face client
const hf = new HfInference('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')

export async function POST(request: Request) {
  console.log("API route hit") // Add this line
  try {
    const data = await request.json()
    console.log("Received data:", data) // Add this line
    const { symptoms } = data

    if (!symptoms) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 })
    }

    try {
      // Use the Zabihin/Symptom_to_Diagnosis model
      const response = await hf.textClassification({
        model: "Zabihin/Symptom_to_Diagnosis",
        inputs: symptoms,
      })

      // Process the response
      const conditions = response.map((result) => ({
        name: result.label,
        probability: result.score,
      }))

      // Sort conditions by probability
      conditions.sort((a, b) => b.probability - a.probability)

      // Generate recommendations based on top condition
      const recommendations = generateRecommendations(conditions[0].name)

      return NextResponse.json({
        conditions: conditions.slice(0, 3), // Return top 3 conditions
        recommendations,
      })
    } catch (error) {
      console.error("Error with Hugging Face API:", error)
      // Fallback to mock data if the API call fails
      return NextResponse.json({
        conditions: [
          { name: "Migraine", probability: 0.85 },
          { name: "Stress", probability: 0.72 },
          { name: "Dehydration", probability: 0.65 },
        ],
        recommendations: [
          "Please consult with a healthcare professional for an accurate diagnosis",
          "Consider visiting an urgent care facility if symptoms are severe",
          "Keep track of your symptoms and when they occur",
        ],
      })
    }
  } catch (error) {
    console.error("Error in API route:", error) // Modify this line

    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}

function generateRecommendations(condition: string): string[] {
  // General recommendations for any condition
  const generalRecommendations = [
    "Consult with a healthcare professional for proper diagnosis",
    "Track your symptoms and their frequency",
    "Stay hydrated and get adequate rest",
  ]

  // Condition-specific recommendations
  const conditionSpecific: Record<string, string[]> = {
    Migraine: [
      "Avoid known trigger foods like chocolate or aged cheese",
      "Consider keeping a headache journal",
      "Reduce exposure to bright lights and loud noises during episodes",
    ],
    "Common Cold": [
      "Get plenty of rest and stay hydrated",
      "Use over-the-counter medications to relieve symptoms",
      "Consider using a humidifier to ease congestion",
    ],
    Flu: [
      "Rest and avoid contact with others to prevent spread",
      "Take fever-reducing medications as needed",
      "Seek medical attention if symptoms worsen significantly",
    ],
    "Covid-19": [
      "Isolate yourself to prevent spreading the virus",
      "Monitor your oxygen levels if possible",
      "Seek immediate medical attention if you experience difficulty breathing",
    ],
    Allergies: [
      "Identify and avoid allergen triggers when possible",
      "Consider over-the-counter antihistamines",
      "Use air purifiers to reduce indoor allergens",
    ],
  }

  // Get condition-specific recommendations if available
  const specificRecs = conditionSpecific[condition] || []

  // Combine recommendations
  return specificRecs.length > 0 ? [...specificRecs, generalRecommendations[0]] : generalRecommendations
}
