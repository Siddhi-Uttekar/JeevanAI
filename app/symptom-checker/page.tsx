"use client"

import type React from "react"

import { useState } from "react"

type Message = {
  role: "assistant" | "user"
  content: string
}

type PatientInfo = {
  age?: string
  gender?: string
  [key: string]: any
}

type DiagnosisResult = {
  conditions: Array<{ name: string; probability: number }>
  recommendations: string[]
  careLevel: "self-care" | "primary care" | "specialist" | "urgent care" | "emergency"
  reasoning: string
  nextQuestion: string | null
}

export default function SymptomChecker() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! What symptoms concern you today?" },
  ])
  const [userInput, setUserInput] = useState("")
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null)
  const [diagnosisComplete, setDiagnosisComplete] = useState(false)

  // Toggle between AI SDK and direct API implementation
  const [useDirectAPI, setUseDirectAPI] = useState(false)

  // Function to handle user input
  const handleUserInput = async () => {
    if (!userInput.trim()) return

    // Add user message to conversation
    const newMessages = [...messages, { role: "user", content: userInput }]
    setMessages(newMessages)

    // Clear input and set loading state
    setUserInput("")
    setLoading(true)
    setError(null)

    try {
      // Call the appropriate API endpoint based on the toggle
      const endpoint = useDirectAPI ? "/api/direct-groq" : "/api/analyze-symptoms"

      console.log(`Calling ${endpoint} with ${newMessages.length} messages`)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: newMessages,
          patientInfo,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`API error (${response.status}):`, errorText)
        throw new Error(`Failed to analyze symptoms: ${response.status}`)
      }

      const result = await response.json()
      console.log("API response:", result)

      // Extract age and gender from conversation if available
      if (!patientInfo.age || !patientInfo.gender) {
        const lastUserMessage = userInput.toLowerCase()

        // Try to extract age
        const ageMatch = lastUserMessage.match(/\b(\d+)\s*(years?|yrs?|y\/o)?\b/i)
        if (ageMatch && !patientInfo.age) {
          setPatientInfo((prev) => ({ ...prev, age: ageMatch[1] }))
        }

        // Try to extract gender
        if (!patientInfo.gender) {
          if (
            lastUserMessage.includes("female") ||
            lastUserMessage.includes("woman") ||
            lastUserMessage.match(/\bf\b/i)
          ) {
            setPatientInfo((prev) => ({ ...prev, gender: "female" }))
          } else if (
            lastUserMessage.includes("male") ||
            lastUserMessage.includes("man") ||
            lastUserMessage.match(/\bm\b/i)
          ) {
            setPatientInfo((prev) => ({ ...prev, gender: "male" }))
          }
        }
      }

      // Check if diagnosis is complete
      if (result.nextQuestion === null) {
        setDiagnosisComplete(true)
        setDiagnosisResult(result)

        // Add final assistant message
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Based on the information you've provided, I've completed my assessment. Please review the results below.",
          },
        ])
      } else {
        // Add assistant response to conversation
        setMessages([...newMessages, { role: "assistant", content: result.nextQuestion }])
      }
    } catch (err) {
      console.error("Error analyzing symptoms:", err)
      setError("An error occurred while analyzing your symptoms. Please try again.")

      // Add a message to the conversation to inform the user
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error while analyzing your symptoms. Could you please try again or rephrase your description?",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleUserInput()
    }
  }

  // Render care level badge
  const renderCareLevelBadge = (careLevel: string) => {
    const getBadgeColor = () => {
      switch (careLevel) {
        case "emergency":
          return "bg-red-500 text-white"
        case "urgent care":
          return "bg-orange-500 text-white"
        case "specialist":
          return "bg-yellow-500 text-black"
        case "primary care":
          return "bg-blue-500 text-white"
        case "self-care":
          return "bg-green-500 text-white"
        default:
          return "bg-gray-500 text-white"
      }
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor()}`}>
        {careLevel.charAt(0).toUpperCase() + careLevel.slice(1)}
      </span>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">AI Symptom Checker (Groq + DeepSeek)</h1>
              <p className="text-gray-500 mt-1">
                Have a conversation with our AI to help understand your symptoms and get recommendations.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">API Mode:</span>
              <button
                onClick={() => setUseDirectAPI(!useDirectAPI)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  useDirectAPI
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {useDirectAPI ? "Direct API" : "AI SDK"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-2 border rounded-md">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "assistant" ? "bg-blue-50 text-gray-800" : "bg-blue-600 text-white"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {!diagnosisComplete ? (
            <div className="flex gap-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your symptoms..."
                className="flex-1 min-h-[80px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleUserInput}
                className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !userInput.trim()}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ) : null}

          {/* Diagnosis Results */}
          {diagnosisComplete && diagnosisResult && (
            <div className="space-y-6 mt-8 border-t pt-6">
              {/* Assessment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Assessment</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Recommended Care Level:</h4>
                    {renderCareLevelBadge(diagnosisResult.careLevel)}
                  </div>
                  <p className="text-sm">{diagnosisResult.reasoning}</p>
                </div>
              </div>

              {/* Possible Conditions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
                <div className="space-y-3">
                  {diagnosisResult.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{condition.name}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          index === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {Math.round(condition.probability * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-800">Next Steps</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-green-700">
                        {diagnosisResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Next steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md text-left ${
                      diagnosisResult.careLevel === "self-care"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Self-care
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md text-left ${
                      ["primary care", "specialist"].includes(diagnosisResult.careLevel)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Schedule a consultation
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md text-left ${
                      ["urgent care", "emergency"].includes(diagnosisResult.careLevel)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Seek immediate care
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setMessages([{ role: "assistant", content: "Hello! What symptoms concern you today?" }])
                  setDiagnosisComplete(false)
                  setDiagnosisResult(null)
                  setPatientInfo({})
                }}
                className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start New Assessment
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 md:p-6 flex justify-between">
          <div className="text-sm text-gray-500">
            <p>This is not a substitute for professional medical advice.</p>
            <p>If you're experiencing a medical emergency, call emergency services immediately.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

