import { NextResponse } from "next/server"

// In a real app, this would connect to a database like MongoDB
// For this demo, we'll use an in-memory store
const patientRecords: any[] = []

export async function GET(request: Request) {
  // In a real app, you would authenticate the user and only return their records
  return NextResponse.json(patientRecords)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.patientId || !data.symptoms) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add timestamp and ID
    const record = {
      ...data,
      id: `record_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    // Save to our "database"
    patientRecords.push(record)

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error saving patient record:", error)
    return NextResponse.json({ error: "Failed to save patient record" }, { status: 500 })
  }
}

