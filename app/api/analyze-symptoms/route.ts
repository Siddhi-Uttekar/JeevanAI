
import { NextResponse } from "next/server"
import { Message, PatientInfo, MedicalHistory } from "@/app/api/analyze-symptoms/type";

// Define the system prompt for the medical assistant
const MEDICAL_SYSTEM_PROMPT = `
You are a medical symptom analysis assistant. Your job is to:
1. ask patient their age ans sex - "what is your age and sex(male, female, other)?"
2. ask patient about medical history  - "do you have any medical history or conditions listed
- (Recent physical injury ,Smoking cigarettes,History of allergies (self/family), Pregnancy (if applicable),Overweight/obesity, Diagnosed diabetes, Diagnosed hypertension ?"
3. Analyze patient symptoms and information ask them questions based on their symptoms in detail
4. Identify possible conditions based on the symptoms, medical history and age and sex
5. Provide a probability assessment for each condition
6. Suggest appropriate recommendations
7. Determine the appropriate level of care needed

Response format (STRICT JSON):
{
  "stage": "history" | "symptoms" | "analysis",
  "nextQuestion": string,
  "collectedData": {
    "demographics": { "age": number, "gender": string },
    "medicalHistory": {
      "conditions": string[],
      "medications": string[],
      "allergies": string[],
      "lifestyle": { "smokes": bool, "alcohol": string }
    },
    "symptoms": {
      "description": string,
      "duration": string,
      "severity": number,
      "triggers": string
    }[]
  },
  "analysis": null | {
    "conditions": { "name": string, "probability": number }[],
    "recommendations": string[],
    "careLevel": "self-care"|"primary"|"urgent"|"emergency",
    "reasoning": string
  }
}
IMPORTANT: Your response MUST be a valid JSON object with the exact structure specified above.
Do not include any text before or after the JSON object.

Be medically accurate but cautious. When in doubt, recommend seeking professional medical advice.
Do not diagnose rare or extremely serious conditions without strong evidence.
Always consider common conditions first, following medical best practices.
`

export async function POST(request: Request) {
  try {
    const { conversation, patientInfo, medicalHistory } = await request.json();

    // Format the prompt
    const prompt = formatPrompt(conversation, patientInfo, medicalHistory);

    // Call Groq API
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
      })
    });

    if (!response.ok) throw new Error("API request failed");

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}

function formatPrompt(conversation: Message[], patientInfo: PatientInfo, medicalHistory: MedicalHistory) {
  const formattedConv = conversation.map(m =>
    `${m.role === 'assistant' ? 'Doctor' : 'Patient'}: ${m.content}`
  ).join('\n\n');

  return `Patient Information:
- Age: ${patientInfo.age || 'Not provided'}
- Sex: ${patientInfo.gender || 'Not provided'}

Medical History:
- Conditions: ${medicalHistory.conditions.join(', ') || 'None'}
- Medications: ${medicalHistory.medications.join(', ') || 'None'}
- Allergies: ${medicalHistory.allergies.join(', ') || 'None'}
- Lifestyle: ${medicalHistory.smoker ? 'Smoker' : 'Non-smoker'}, Alcohol: ${medicalHistory.alcoholUse}

Conversation History:
${formattedConv}

Please continue the medical interview according to the protocol.`;
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
// function createFallbackResponse(patientInfo: any) {
//   const symptoms = patientInfo.symptoms?.toLowerCase() || ""

//   // Default fallback response
//   let response = {
//     nextQuestion:
//       "Could you please provide more details about your symptoms? When did they start, and have you noticed anything that makes them better or worse?",
//     conditions: [],
//     recommendations: [],
//     careLevel: "primary care",
//     reasoning: "Not enough information to make an assessment yet.",
//   }

//   // If this is the first message and we don't have symptoms yet
//   if (!symptoms || symptoms === "") {
//     return response
//   }

//   // If we have some symptoms, provide a more helpful fallback
//   if (symptoms.includes("headache") || symptoms.includes("head pain")) {
//     response = {
//       nextQuestion: null,
//       conditions: [
//         { name: "Tension headache", probability: 0.7 },
//         { name: "Migraine", probability: 0.4 },
//         { name: "Dehydration", probability: 0.3 },
//       ],
//       recommendations: [
//         "Rest in a quiet, dark room",
//         "Stay hydrated",
//         "Consider over-the-counter pain relievers if appropriate",
//         "Consult with a healthcare professional if symptoms persist or worsen",
//       ],
//       careLevel: "self-care",
//       reasoning:
//         "Headaches are common and often respond to self-care measures. However, persistent or severe headaches should be evaluated by a healthcare professional.",
//     }
//   } else if (symptoms.includes("fever") || symptoms.includes("temperature")) {
//     response = {
//       nextQuestion: null,
//       conditions: [
//         { name: "Viral infection", probability: 0.6 },
//         { name: "Common cold", probability: 0.5 },
//         { name: "Influenza", probability: 0.3 },
//       ],
//       recommendations: [
//         "Rest and stay hydrated",
//         "Take fever-reducing medication if appropriate",
//         "Monitor your temperature",
//         "Seek medical attention if fever is high or persists for more than 3 days",
//       ],
//       careLevel: "self-care",
//       reasoning:
//         "Fevers are often caused by infections and may resolve with rest and fluids. However, high or persistent fevers should be evaluated by a healthcare professional.",
//     }
//   } else if (symptoms.includes("cough") || symptoms.includes("congestion")) {
//     response = {
//       nextQuestion: null,
//       conditions: [
//         { name: "Common cold", probability: 0.7 },
//         { name: "Allergies", probability: 0.4 },
//         { name: "Bronchitis", probability: 0.2 },
//       ],
//       recommendations: [
//         "Rest and stay hydrated",
//         "Use over-the-counter cough medications if appropriate",
//         "Use a humidifier to ease congestion",
//         "Seek medical attention if symptoms worsen or persist beyond 10 days",
//       ],
//       careLevel: "self-care",
//       reasoning:
//         "Coughs and congestion are common symptoms of upper respiratory infections or allergies. They often resolve with self-care, but persistent symptoms should be evaluated.",
//     }
//   } else if (symptoms.includes("joint") || symptoms.includes("pain")) {
//     response = {
//       nextQuestion: null,
//       conditions: [
//         { name: "Muscle strain", probability: 0.6 },
//         { name: "Arthritis", probability: 0.4 },
//         { name: "Tendonitis", probability: 0.3 },
//       ],
//       recommendations: [
//         "Rest the affected area",
//         "Apply ice to reduce inflammation",
//         "Consider over-the-counter pain relievers if appropriate",
//         "Consult with a healthcare professional if pain is severe or persistent",
//       ],
//       careLevel: "primary care",
//       reasoning:
//         "Joint and muscle pain can have many causes. While mild pain may respond to self-care, persistent or severe pain should be evaluated by a healthcare professional.",
//     }
//   } else {
//     // Generic response for other symptoms
//     response = {
//       nextQuestion: null,
//       conditions: [
//         { name: "Common condition", probability: 0.5 },
//         { name: "Mild temporary condition", probability: 0.4 },
//         { name: "Stress-related condition", probability: 0.3 },
//       ],
//       recommendations: [
//         "Rest and monitor your symptoms",
//         "Stay hydrated and maintain a healthy diet",
//         "Consider over-the-counter remedies appropriate for your symptoms",
//         "Consult with a healthcare professional if symptoms persist or worsen",
//       ],
//       careLevel: "primary care",
//       reasoning:
//         "Based on the limited information provided, it's difficult to make a specific assessment. A healthcare professional can provide a more accurate diagnosis.",
//     }
//   }

//   return response
// }
