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
          <header className="border-b">
            <div className="container flex h-16 items-center px-4 md:px-6 mx-auto">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xl font-bold"> JeevanAI</span>
              </Link>
              <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
                  Home
                </Link>
                <Link href="/symptom-checker" className="text-sm font-medium hover:underline underline-offset-4">
                  Symptom Checker
                </Link>
                <Link href="/find-specialist" className="text-sm font-medium hover:underline underline-offset-4">
                  Find Specialist
                </Link>
                <Link href="/find-doctor" className="text-sm font-medium hover:underline underline-offset-4">
                  Find Doctor
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 bg-gray-50">{children}</main>
          <footer className="border-t bg-white">
            <div className="container mx-auto px-4 py-6">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} MediScan AI. This is not a substitute for professional medical advice.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
