"use server"

export async function analyzeSymptoms(data: {
  symptoms: string
  age: number
  gender: string
}) {
  try {
    // Use a relative URL that works in both development and production
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-symptoms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze symptoms")
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    throw error
  }
}

export async function findDoctors(data: {
  condition: string
  location: string
}) {
  try {
    // Use a relative URL that works in both development and production
    const response = await fetch("/api/find-doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to find doctors")
    }

    return await response.json()
  } catch (error) {
    console.error("Error finding doctors:", error)
    throw error
  }
}
