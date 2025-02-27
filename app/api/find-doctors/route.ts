import { NextResponse } from "next/server"
import doctorsData from "@/data/doctors.json"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { condition, location } = data

    if (!condition || !location) {
      return NextResponse.json({ error: "Condition and location are required" }, { status: 400 })
    }

    // Get specialties for the condition
    const specialties = getSpecialtiesForCondition(condition.toLowerCase())

    // Filter doctors by specialty
    let matchingDoctors = doctorsData.filter((doctor) => specialties.includes(doctor.specialty.toLowerCase()))

    // In a real app, you would use a geocoding service to get coordinates
    // and calculate actual distances. For this demo, we'll use mock distances.
    matchingDoctors = matchingDoctors.map((doctor) => ({
      ...doctor,
      distance: calculateMockDistance(location, doctor.address),
      distance_text: `${calculateMockDistance(location, doctor.address).toFixed(1)} miles`,
    }))

    // Sort by distance
    matchingDoctors.sort((a, b) => a.distance - b.distance)

    // Return top 5 closest doctors
    return NextResponse.json(matchingDoctors.slice(0, 5))
  } catch (error) {
    console.error("Error finding doctors:", error)
    return NextResponse.json({ error: "Failed to find doctors" }, { status: 500 })
  }
}

function getSpecialtiesForCondition(condition: string): string[] {
  const conditionMap: Record<string, string[]> = {
    headache: ["neurologist", "primary care"],
    migraine: ["neurologist", "pain management"],
    "back pain": ["orthopedist", "physical therapist", "pain management"],
    "joint pain": ["rheumatologist", "orthopedist"],
    heart: ["cardiologist"],
    skin: ["dermatologist"],
    allergy: ["allergist", "immunologist"],
    breathing: ["pulmonologist", "allergist"],
    stomach: ["gastroenterologist"],
    diabetes: ["endocrinologist", "primary care"],
    anxiety: ["psychiatrist", "psychologist"],
    depression: ["psychiatrist", "psychologist"],
    cancer: ["oncologist"],
    pregnancy: ["obstetrician", "gynecologist"],
    child: ["pediatrician"],
  }

  // Find matching specialties
  const specialties = new Set<string>()
  for (const [key, values] of Object.entries(conditionMap)) {
    if (condition.includes(key)) {
      values.forEach((value) => specialties.add(value))
    }
  }

  // Default to primary care if no matches
  if (specialties.size === 0) {
    specialties.add("primary care")
  }

  return Array.from(specialties)
}

function calculateMockDistance(userLocation: string, doctorAddress: string): number {
  // In a real app, you would use a geocoding service and calculate actual distances
  // For this demo, we'll generate a random distance between 0.5 and 10 miles
  return Math.random() * 9.5 + 0.5
}

