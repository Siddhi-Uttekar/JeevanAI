"use server"

import { revalidatePath } from "next/cache"

// This is a server action that will call our API for symptom analysis
export async function analyzeSymptoms(data: {
  symptoms: string
  age: number
  gender: string
}) {
  try {
    // Call the API endpoint directly (no need for NEXT_PUBLIC_API_URL)
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/api/analyze-symptoms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to analyze symptoms")
    }

    return await response.json()
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    throw error
  }
}

// This is a server action that will call our API for doctor recommendations
export async function findDoctors(data: {
  condition: string
  location: string
}) {
  try {
    // Call the API endpoint directly
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/api/find-doctors`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to find doctors")
    }

    return await response.json()
  } catch (error) {
    console.error("Error finding doctors:", error)
    throw error
  }
}

// Save patient record
export async function savePatientRecord(data: any) {
  try {
    // Call the API endpoint directly
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/api/patient-records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to save patient record")
    }

    revalidatePath("/records")
    return await response.json()
  } catch (error) {
    console.error("Error saving patient record:", error)
    throw error
  }
}

