import { NextResponse } from "next/server"
import doctorsData from "@/data/doctors.json"

// Add coordinates to the doctors data
const doctorsWithCoordinates = doctorsData.map((doctor) => ({
  ...doctor,
  // These are mock coordinates - in a real app, you would have actual coordinates
  coordinates: {
    latitude: 40.7128 + (Math.random() * 0.1 - 0.05), // Random coordinates near NYC
    longitude: -74.006 + (Math.random() * 0.1 - 0.05),
  },
}))

type Coordinates = {
  latitude: number
  longitude: number
}

// First, let's add more logging to diagnose the issue
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { condition, location, radius = 10 } = data

    console.log("Search request:", { condition, location, radius })

    if (!condition) {
      return NextResponse.json({ error: "Condition is required" }, { status: 400 })
    }

    if (!location || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
      return NextResponse.json({ error: "Valid location coordinates are required" }, { status: 400 })
    }

    // Get specialties for the condition
    const specialties = getSpecialtiesForCondition(condition.toLowerCase())
    console.log("Matching specialties:", specialties)

    // Filter doctors by specialty - make this case insensitive
    let matchingDoctors = doctorsWithCoordinates.filter((doctor) =>
      specialties.includes(doctor.specialty.toLowerCase()),
    )

    console.log("Initial matching doctors count:", matchingDoctors.length)

    // If no doctors match the specialty, return all doctors as a fallback
    if (matchingDoctors.length === 0) {
      console.log("No specialty matches, using all doctors as fallback")
      matchingDoctors = doctorsWithCoordinates
    }

    // Calculate distance for each doctor
    matchingDoctors = matchingDoctors.map((doctor) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        doctor.coordinates.latitude,
        doctor.coordinates.longitude,
      )

      return {
        ...doctor,
        distance,
        distance_text: `${distance.toFixed(1)} miles away`,
      }
    })

    // Filter by radius
    const withinRadius = matchingDoctors.filter((doctor) => doctor.distance <= radius)
    console.log("Doctors within radius:", withinRadius.length)

    // If no doctors within radius, return the closest ones anyway
    if (withinRadius.length === 0 && matchingDoctors.length > 0) {
      console.log("No doctors within radius, returning closest ones")
      matchingDoctors.sort((a, b) => a.distance - b.distance)
      return NextResponse.json(matchingDoctors.slice(0, 5))
    }

    // Sort by distance
    withinRadius.sort((a, b) => a.distance - b.distance)

    return NextResponse.json(withinRadius)
  } catch (error) {
    console.error("Error finding specialists:", error)
    return NextResponse.json({ error: "Failed to find specialists" }, { status: 500 })
  }
}

// Calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Update the specialties mapping to ensure diabetes is properly handled
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
    diabetic: ["endocrinologist", "primary care"],
    sugar: ["endocrinologist", "primary care"],
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

