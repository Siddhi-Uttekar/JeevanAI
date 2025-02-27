import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Stethoscope, Users, MapPin } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MediScan AI</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
          </nav>
          <div className="ml-4">
            <Link href="/login">
              <Button variant="outline" className="mr-2">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Healthcare Analysis & Recommendations
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Analyze symptoms, monitor patient records, and get matched with the right specialists using our
                  advanced AI technology.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/symptom-checker">
                    <Button size="lg" className="w-full sm:w-auto">
                      Check Symptoms Now
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <img
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Medical dashboard interface"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines AI technology with healthcare expertise to provide you with accurate analysis
                  and personalized recommendations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AI-Powered Symptom Analysis</CardTitle>
                  <CardDescription>Advanced symptom prediction using Hugging Face models</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our AI analyzes your symptoms and medical history to provide accurate predictions and potential
                    conditions to discuss with healthcare providers.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/symptom-checker">
                    <Button variant="outline" className="w-full">
                      Try Symptom Checker
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Patient Record Analysis</CardTitle>
                  <CardDescription>Comprehensive monitoring and trend detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Securely store and analyze your medical records over time to identify patterns, track progress, and
                    receive personalized health insights.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/records">
                    <Button variant="outline" className="w-full">
                      Manage Records
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <MapPin className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Doctor Recommendation</CardTitle>
                  <CardDescription>Find specialists based on your condition and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Get matched with qualified specialists in your area based on your symptoms, condition, and doctor
                    availability using our intelligent matching system.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/find-doctor">
                    <Button variant="outline" className="w-full">
                      Find Specialists
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <Link href="/" className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">MediScan AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered healthcare analysis and recommendations.
              <br />© {new Date().getFullYear()} MediScan AI. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex-1">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Platform</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Features
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Pricing
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                FAQ
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Company</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                About
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Careers
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                HIPAA
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

