
"use client"
import { useState, KeyboardEvent, useMemo } from "react";
import { generateMedicalReport } from "../api/analyze-symptoms/generateReport";
import { DoctorRecommendationCard } from "./components/DoctorRecommendationCard";
import {
  extractSymptoms,
  getDoctorRecommendation,
} from "./utils/symptomUtils";
import {
  Message,
  PatientInfo,
  MedicalHistory,
  SymptomDetails,
  DiagnosisResult,
  MedicalReport,
  DoctorRecommendation
} from "@/app/api/analyze-symptoms/type";

export default function SymptomChecker() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: "",
    gender: ""
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    conditions: [],
    medications: [],
    allergies: [],
    smoker: false,
    alcoholUse: 'none',
    familyHistory: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult>({
    conditions: [],
    recommendations: [],
    careLevel: "self-care",
    reasoning: "",
    nextQuestion: null
  });
  const [diagnosisComplete, setDiagnosisComplete] = useState(false);
  const [useDirectAPI, setUseDirectAPI] = useState(false);
  const [step, setStep] = useState<"demographics" | "medicalHistory" | "conversation">("demographics");

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);
    setError(null);

    try {
      const endpoint = useDirectAPI ? "/api/direct-groq" : "/api/analyze-symptoms";
      console.log(`Calling ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: newMessages,
          patientInfo,
          medicalHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);

      const analysis = result.analysis || {
        conditions: result.conditions || [],
        recommendations: result.recommendations || ["No specific recommendations available"],
        careLevel: result.careLevel || "self-care",
        reasoning: result.reasoning || "No detailed reasoning provided"
      };

      if (result.nextQuestion === null) {
        setDiagnosisComplete(true);
        setDiagnosisResult({
          ...analysis,
          nextQuestion: null
        });
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Assessment complete. Please review your results below."
          },
        ]);
      } else {
        setDiagnosisResult({
          ...analysis,
          nextQuestion: result.nextQuestion
        });
        setMessages([...newMessages, { role: "assistant", content: result.nextQuestion ?? "Sorry, I am unable to provide a response at this time." }]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I encountered an error. Could you please rephrase your response?"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDemographics = () => {
    if (!patientInfo.age || !patientInfo.gender) {
      setError("Please provide both age and gender");
      return;
    }
    setStep("medicalHistory");
    setError(null);
  };

  const handleSubmitMedicalHistory = () => {
    setStep("conversation");
    setMessages([
      {
        role: "assistant",
        content: "Thank you for providing your medical history. Please describe your current symptoms in detail, including how long you've had them and their severity."
      }
    ]);
  };

  const doctorRecommendation = useMemo(() => {
    if (!diagnosisComplete) return null;
    return getDoctorRecommendation(
      diagnosisResult.conditions,
      diagnosisResult.careLevel
    );
  }, [diagnosisComplete, diagnosisResult.conditions, diagnosisResult.careLevel]);


  const resetState = () => {
    setMessages([]);
    setDiagnosisComplete(false);
    setDiagnosisResult({
      conditions: [],
      recommendations: [],
      careLevel: "self-care",
      reasoning: "",
      nextQuestion: null,
    });
    setPatientInfo({ age: "", gender: "" });
    setMedicalHistory({
      conditions: [],
      medications: [],
      allergies: [],
      smoker: false,
      alcoholUse: "none",
      familyHistory: [],
    });
    setStep("demographics");
  };

  const handleGenerateReport = () => {
    if (!diagnosisResult) return;

    const reportData: MedicalReport = {
      patientInfo: {
        age: parseInt(patientInfo.age || '0'),
        gender: patientInfo.gender || 'Not specified',
        location: patientInfo.location || 'Not specified'
      },
      medicalHistory,
      symptoms: extractSymptoms(messages),
      assessment: {
        conditions: diagnosisResult.conditions,
        recommendations: diagnosisResult.recommendations,
        careLevel: diagnosisResult.careLevel,
        reasoning: diagnosisResult.reasoning,
      },
      doctorRecommendation: doctorRecommendation || undefined,
      generatedAt: new Date().toISOString(),
    };

    try {
      generateMedicalReport(reportData);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setError("Failed to generate report. Please try again.");
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "conversation") {
        handleUserInput();
      }
    }
  };

  const renderCareLevelBadge = (careLevel: string) => {
    const colors = {
      "self-care": "bg-green-500 text-white",
      "primary care": "bg-blue-500 text-white",
      "specialist": "bg-yellow-500 text-black",
      "urgent care": "bg-orange-500 text-white",
      "emergency": "bg-red-500 text-white"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[careLevel as keyof typeof colors] || "bg-gray-500 text-white"}`}>
        {careLevel ? careLevel.charAt(0).toUpperCase() + careLevel.slice(1) : ''}
      </span>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">AI Symptom Checker</h1>
              <p className="text-gray-500 mt-1">
                Answer questions to get a medical assessment and report.
              </p>
            </div>
            
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {step === "demographics" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value=""> select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">prefer not to say</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                  <input
                    type="text"
                    value={patientInfo.location || ""}
                    onChange={(e) => setPatientInfo({...patientInfo, location: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="City, State/Province"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmitDemographics}
                disabled={!patientInfo.age || !patientInfo.gender}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Continue to Medical History
              </button>
            </div>
          )}

          {step === "medicalHistory" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical History</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    value={medicalHistory.conditions.join(", ")}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      conditions: e.target.value.split(",").map(item => item.trim()).filter(item => item)
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. diabetes, hypertension"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications (comma separated)
                  </label>
                  <input
                    type="text"
                    value={medicalHistory.medications.join(", ")}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      medications: e.target.value.split(",").map(item => item.trim()).filter(item => item)
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. ibuprofen, insulin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={medicalHistory.allergies.join(", ")}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      allergies: e.target.value.split(",").map(item => item.trim()).filter(item => item)
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. penicillin, nuts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family History (comma separated)
                  </label>
                  <input
                    type="text"
                    value={medicalHistory.familyHistory.join(", ")}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      familyHistory: e.target.value.split(",").map(item => item.trim()).filter(item => item)
                    })}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g. heart disease, diabetes"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Smoking Status
                    </label>
                    <select
                      value={medicalHistory.smoker ? "yes" : "no"}
                      onChange={(e) => setMedicalHistory({
                        ...medicalHistory,
                        smoker: e.target.value === "yes"
                      })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="no">Non-smoker</option>
                      <option value="yes">Smoker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alcohol Use
                    </label>
                    <select
                      value={medicalHistory.alcoholUse}
                      onChange={(e) => setMedicalHistory({
                        ...medicalHistory,
                        alcoholUse: e.target.value
                      })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="none">None</option>
                      <option value="sometimes">Occasional</option>
                      <option value="regular">Regular</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep("demographics")}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitMedicalHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Symptom Assessment
                </button>
              </div>
            </div>
          )}

          {step === "conversation" && (
            <>
              {/* Conversation */}
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-2 border rounded-md">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "assistant" ? "bg-blue-50" : "bg-blue-600 text-white"
                    }`}>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span>Analyzing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              {!diagnosisComplete ? (
                <div className="flex gap-2">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1 min-h-[80px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleUserInput}
                    disabled={loading || !userInput.trim()}
                    className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              ) : null}

              {/* Results */}
              {diagnosisComplete && (
                <div className="mt-8 space-y-6 border-t pt-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Assessment</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Recommended Care Level:</h4>
                        {renderCareLevelBadge(diagnosisResult.careLevel)}
                      </div>
                      <p className="text-sm">{diagnosisResult.reasoning}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
                    <div className="space-y-3">
                      {diagnosisResult.conditions.length > 0 ? (
                        diagnosisResult.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{condition.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              index === 0 ? "bg-blue-600 text-white" : "bg-gray-200"
                            }`}>
                              {Math.round(condition.probability * 100)}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No conditions identified</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-2 bg-green-50 p-4 rounded-lg">
                      {diagnosisResult.recommendations.length > 0 ? (
                        diagnosisResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))
                      ) : (
                        <li className="text-gray-500">No specific recommendations available</li>
                      )}
                    </ul>
                  </div>

                  {/* Doctor Recommendation Section */}
                  {doctorRecommendation && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommended Specialist</h3>
                      <DoctorRecommendationCard recommendation={doctorRecommendation} />
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={resetState}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Start New Assessment
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Download Full Report
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 text-sm text-gray-500">
          <p>This tool provides general health information and is not a substitute for professional medical advice.</p>
        </div>
      </div>
    </div>
  );
}