"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Star, Phone, Mail, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { findDoctors } from "@/lib/actions"

export default function FindDoctor() {
  const [condition, setCondition] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try to call the server action to find doctors
      try {
        const results = await findDoctors({
          condition,
          location,
        })

        setDoctors(results)
      } catch (err) {
        console.error("API call failed, using mock data:", err)
        // Mock data for development/demo purposes
        setDoctors(mockDoctors)
      }
    } catch (err) {
      console.error(err)
      // Fallback to mock data
      setDoctors(mockDoctors)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Neurologist",
      rating: 4.8,
      reviews: 124,
      address: "123 Medical Center, New York, NY",
      distance: 2.3,
      distance_text: "2.3 miles",
      availability: "Next available: Tomorrow",
      image: "/placeholder.svg?height=200&width=200",
      phone: "212-555-1234",
      email: "dr.johnson@example.com",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 98,
      address: "456 Health Plaza, New York, NY",
      distance: 3.1,
      distance_text: "3.1 miles",
      availability: "Next available: Friday",
      image: "/placeholder.svg?height=200&width=200",
      phone: "212-555-5678",
      email: "dr.chen@example.com",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Rheumatologist",
      rating: 4.7,
      reviews: 86,
      address: "789 Care Boulevard, New York, NY",
      distance: 1.8,
      distance_text: "1.8 miles",
      availability: "Next available: Monday",
      image: "/placeholder.svg?height=200&width=200",
      phone: "212-555-9012",
      email: "dr.rodriguez@example.com",
    },
  ]

  const displayDoctors = doctors.length > 0 ? doctors : []

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Find Specialists Near You</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search for Specialists</CardTitle>
          <CardDescription>Find doctors based on your condition and location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <Input
                  id="condition"
                  placeholder="E.g., Migraine, Diabetes, Arthritis"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    className="pl-10"
                    placeholder="City, State or Zip Code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching..." : "Find Specialists"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          {displayDoctors.length > 0
            ? "Recommended Specialists"
            : "Enter your condition and location to find specialists"}
        </h2>

        {displayDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/4 bg-muted">
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-full h-full object-cover aspect-square"
                />
              </div>
              <div className="w-full md:w-3/4 p-6">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium mr-1">{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{doctor.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="font-normal">
                      {doctor.distance_text}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{doctor.availability}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Office
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

