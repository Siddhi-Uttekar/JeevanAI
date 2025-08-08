import type React from "react"
import Link from "next/link"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-cyan-700">
            <div className="container flex h-16 items-center  md:px-6 bg-cyan-700 text-white">
              <Link href="/" className="flex items-center gap-2">

                <span className="text-3xl font-bold font-sans">🛡️ JeevanAI</span>
              </Link>
              <nav className="ml-auto flex gap-4 sm:gap-6 ">
                <Link href="/" className="text-lg font-sans font-semibold hover:underline underline-offset-4">
                  Home
                </Link>
                <Link href="/symptom-checker" className="text-lg font-sans font-semibold hover:underline underline-offset-4">
                  Symptom Checker
                </Link>
                <Link href="/find-specialist" className="text-lg font-sans font-semibold hover:underline underline-offset-4">
                  Find Specialist
                </Link>

              </nav>
            </div>
          </header>
          <main className="flex-1 bg-gray-50">{children}</main>
          <footer className="border-t bg-white">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} jeevanAI. This is not a substitute for professional medical advice.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
