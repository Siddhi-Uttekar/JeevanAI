import { NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

// Initialize the Hugging Face client
// Note: In production, you should use an environment variable for the API key
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "")

// Define potential conditions to check against
const potentialConditions = [
  "migraine",
  "common cold",
  "flu",
  "covid-19",
  "allergies",
  "anxiety",
  "depression",
  "hypertension",
  "diabetes",
  "arthritis",
]

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { symptoms, age, gender } = data

    if (!symptoms) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 })
    }

    // Use a zero-shot classification model to analyze symptoms
    // This is a simplified approach - in production you'd use a medical-specific model
    const results = []

    try {
      // If we have a Hugging Face API key, use the model
      if (process.env.HUGGINGFACE_API_KEY) {
        for (const condition of potentialConditions) {
          const response = await hf.textClassification({
            model: "facebook/bart-large-mnli",
            inputs: `The symptoms '${symptoms}' are related to ${condition}`,
            parameters: {
              candidateLabels: ["yes", "no"],
            },
          })

          if (response.labels[0] === "yes") {
            results.push({
              name: condition.charAt(0).toUpperCase() + condition.slice(1),
              probability: response.scores[0],
            })
          }
        }
      } else {
        // If no API key, use mock data for demonstration
        results.push(
          { name: "Migraine", probability: 0.85 },
          { name: "Stress", probability: 0.72 },
          { name: "Dehydration", probability: 0.65 },
        )
      }
    } catch (error) {
      console.error("Error with Hugging Face API:", error)
      // Fallback to mock data if the API call fails
      results.push(
        { name: "Migraine", probability: 0.85 },
        { name: "Stress", probability: 0.72 },
        { name: "Dehydration", probability: 0.65 },
      )
    }

    // Sort by probability
    const sortedResults = results.sort((a, b) => b.probability - a.probability)

    // Generate recommendations based on top condition
    const recommendations = generateRecommendations(
      sortedResults.length > 0 ? sortedResults[0].name : "Unknown",
      age,
      gender,
    )

    return NextResponse.json({
      conditions: sortedResults.slice(0, 3),
      recommendations,
    })
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}

function generateRecommendations(condition: string, age: number, gender: string): string[] {
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

