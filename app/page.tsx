import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full  md:py-24 lg:py-32 bg-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Healthcare Analysis & Recommendations
                </h1>
                <p className="text-gray-600 md:text-xl">
                Describe your symptoms and receive AI-powered medical insights in minutes.

                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/symptom-checker">
                    <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Check Symptoms Now
                    </button>
                  </Link>
                  <Link href="/find-specialist">
                    <button className="w-full sm:w-auto px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Find Specialists Near You
                    </button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <img
                  src="/output (1).jpg?height=420&width=1080"
                  alt="Medical dashboard interface"
                  className="object-contain w-dvw h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full  md:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">About JeevanAI</h2>
                <p className="max-w-[900px] text-black-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Meet JeevanAI – Your AI-Powered Medical Assistant
                   JeevanAI combines advanced AI with medical expertise to provide
                     personalized symptom analysis and actionable next steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 h-fit">

              <div className="rounded-lg border bg-cyan-600 p-6 shadow-sm">
                <h3 className="mb-2 text-xl text-white font-bold">AI-Powered Symptom Analysis</h3>
                <p className="mb-4 text-white">
                  Our AI analyzes your symptoms and medical history to provide accurate predictions and potential
                  conditions to discuss with healthcare providers.
                </p>
                <img
                src="/ai-sympotoms(1).webp?height=420&width=880"
                alt="ai-symptoms checker image"
                className="w-full max-h-[200px] object-contain mt-4"
                >
                </img>

              </div>

              <div className="rounded-lg border bg-cyan-600 p-6 shadow-sm">

                <h3 className="mb-2 text-xl text-white font-bold">Instant PDF Report Card</h3>
                <p className="mb-4 text-white">
                Receive a detailed PDF report within minutes - complete with symptom analysis,
                potential conditions, and actionable recommendations to discuss with your healthcare provider.
                </p>
                <img
                src="/download pdf.webp?height=420&width=880"
                alt="pdf download image"
                className="w-full max-h-[200px] object-contain mt-4 "
                ></img>

              </div>

              <div className="rounded-lg border bg-cyan-600 p-6 shadow-sm ">
                <h3 className="mb-2 text-xl text-white font-bold">Find Specialists Near You</h3>
                <p className="mb-4 text-white">
                Get precisely matched with board-certified specialists in your area
  based on your symptoms, medical history, and location through our
  AI-powered matching system
                </p>
                <img
                src="/location.webp?height=420&width=880"
                alt="find specialist image"
                className="w-full max-h-[200px] object-contain mt-4"
                ></img>

              </div>
            </div>
          </div>
        </section>



        <section className="w-full py-12">
  <div className="container px-4 mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">About JeevanAI</h2>
      <p className="max-w-2xl mx-auto text-lg">
        Meet JeenAI – Your AI-Powered Medical Assistant that provides personalized symptom analysis.
      </p>
    </div>

    {/* Horizontal Scrolling Cards */}
    <div className="flex overflow-x-auto pb-6 gap-6 hide-scrollbar">
      {/* Card 1 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">1. Open jeevanAI when you start feeling unwell</h3>

        <img
          src="/working1.png"
          alt="Symptom analysis"
          className="w-full h-72 object-contain mt-4 mx-auto"
        />
      </div>

      {/* Card 2 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">2. select your risk factors</h3>

        <img
          src="/w2.png"
          alt="PDF report"
          className="w-full  object-contain  h-auto max-h-[350px]"
        />
      </div>

      {/* Card 3 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">3. Add your intial symptoms</h3>

        <img
          src="/w3.png"
          alt="Find specialists"
          className="w-full h-72 object-contain mt-4 mx-auto"
        />
      </div>

      {/* Card 4 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">4. answer some complementry question</h3>

        <img
          src="/w4.png"
          alt="Find specialists"
          className="w-full h-72 object-contain mt-4 mx-auto"
        />
      </div>

      {/* Card 5 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">5. get most probable conditions</h3>
        <img
          src="/w5.png"
          alt="Find specialists"
          className="w-full h-72 object-contain mt-4 mx-auto"
        />
      </div>

      {/* Card 6 */}
      <div className="flex-shrink-0 w-96 bg-cyan-600 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-white mb-3">6. Receive recommendations and which doctor to look for</h3>
        <img
          src="/w6.png"
          alt="Find specialists"
          className="w-full h-72 object-contain mt-4 mx-auto"
        />
      </div>
    </div>


  </div>
</section>

<section className="w-full py-16 bg-gray-50">
  <div className="container px-2 mx-auto max-w-4xl">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Frequently Asked Questions</h2>

    <div className="space-y-3">
      {/* Question 1 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <details className="group" open>
          <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
            <h3 className="text-lg font-medium text-gray-900">How accurate is JeevanAI's symptom analysis?</h3>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600">
            <p>JeevanAI leverages cutting-edge AI models (Groq + Deepseek) trained on medical literature and anonymized case data. While our system shows promising diagnostic alignment with clinical guidelines, AI symptom checkers typically achieve 70-85% accuracy compared to physicians for common conditions.</p>
          </div>
        </details>
      </div>

      {/* Question 2 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <details className="group">
          <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
            <h3 className="text-lg font-medium text-gray-900">What information do I need to provide?</h3>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600">
            <p>You'll need to describe your symptoms, their duration and severity. For best results, provide:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Age and sex</li>
              <li>Medical history (existing conditions)</li>
              <li>Current medications</li>
              <li>Allergies</li>
              <li>Lifestyle factors (smoking, exercise, etc.)</li>
            </ul>
          </div>
        </details>
      </div>

      {/* Question 3 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <details className="group">
          <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
            <h3 className="text-lg font-medium text-gray-900">How quickly will I get my PDF report?</h3>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600">
            <p>Reports generate within 2 minutes after completing your symptom assessment.The file gets downloaded to your download storage.</p>
          </div>
        </details>
      </div>



      {/* Question 5 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <details className="group">
          <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
            <h3 className="text-lg font-medium text-gray-900">Is my health data secure?</h3>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600">
            <p>Yes, we use:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>No medical data storage - your inputs are processed in real-time</li>
<li>Session-based analysis - information isn't retained after your assessment</li>
<li>Anonymous processing - we don't collect identifiable health information</li>
<li>You control what to save - only downloaded reports are stored locally on your device</li>
            </ul>
          </div>
        </details>
      </div>

      {/* Question 6 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <details className="group">
          <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
            <h3 className="text-lg font-medium text-gray-900">What should I do in an emergency?</h3>
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600">
            <p className="font-semibold text-red-600">For life-threatening symptoms (chest pain, difficulty breathing, severe bleeding, etc.):</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Call emergency services immediately</li>
              <li>Do not wait for AI analysis</li>
              <li>Follow instructions from medical professionals</li>
            </ol>
            <p className="mt-4">JeenAI is not designed for emergency medical situations.</p>
          </div>
        </details>
      </div>
    </div>
  </div>
</section>

<section className="w-full py-12 bg-gray-100">
  <div className="container px-4 mx-auto max-w-4xl">
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Important Disclaimer</h3>

      <div className="space-y-4 text-gray-600">
        <p>
          <strong>JeevanAI is an informational tool only</strong> - it does not provide medical diagnosis,
          treatment, or emergency services. Our AI analysis is based on pattern recognition
          and cannot replace professional medical evaluation.
        </p>

        <div className="border-l-4 border-amber-400 pl-4 py-1 bg-amber-50">
          <p>
            <strong>For medical emergencies:</strong> Call your local emergency number immediately.
            Do not rely on AI assessment for life-threatening conditions.
          </p>
        </div>

        <ul className="list-disc pl-5 space-y-2">
          <li>All symptom analysis results are preliminary and require physician confirmation</li>
          <li>We do not store your health data - inputs are processed in real-time and not retained</li>
          <li>Recommendations are algorithm-generated and not individually reviewed by doctors</li>
          <li>Accuracy may vary based on information provided and medical condition complexity</li>
        </ul>

        <p className="text-sm border-t pt-4">
          By using JeenAI, you acknowledge this is not a medical service and agree to our
          <a href="/terms" className="text-cyan-600 hover:underline ml-1">Terms of Use</a>.
        </p>
      </div>
    </div>
  </div>
</section>

      </main>
    </div>
  )
}
