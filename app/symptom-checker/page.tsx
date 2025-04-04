
// "use client"
// import { useState, KeyboardEvent } from "react";
// import { generateMedicalReport } from "../api/analyze-symptoms/generateReport";

// type Message = {
//   role: "assistant" | "user";
//   content: string;
// };

// type PatientInfo = {
//   age?: string;
//   gender?: string;
//   location?: string;
//   [key: string]: any;
// };

// type MedicalHistory = {
//   conditions: string[];
//   medications: string[];
//   allergies: string[];
//   smoker: boolean;
//   alcoholUse: string;
//   familyHistory: string[];
// };

// type SymptomDetails = {
//   name: string;
//   duration: string;
//   severity: number;
//   description: string;
// };

// type MedicalSpecialty =
//   | 'Primary Care Physician'
//   | 'Cardiologist'
//   | 'Neurologist'
//   | 'Pulmonologist'
//   | 'Endocrinologist'
//   | 'Gastroenterologist'
//   | 'Dermatologist'
//   | 'Emergency Room';

// type DoctorRecommendation = {
//   specialty: MedicalSpecialty;
//   reason: string;
//   urgency: 'routine' | 'urgent' | 'emergency';
// };

// type DiagnosisResult = {
//   conditions: Array<{ name: string; probability: number }>;
//   recommendations: string[];
//   careLevel: "self-care" | "primary care" | "specialist" | "urgent care" | "emergency";
//   reasoning: string;
//   nextQuestion: string | null;
// };

// type MedicalReport = {
//   patientInfo: {
//     age: number;
//     gender: string;
//     location?: string;
//   };
//   medicalHistory: MedicalHistory;
//   symptoms: SymptomDetails[];
//   assessment: {
//     conditions: Array<{ name: string; probability: number }>;
//     recommendations: string[];
//     careLevel: string;
//     reasoning: string;
//   };
//   generatedAt: string;
// };

// export default function SymptomChecker() {
//   const [messages, setMessages] = useState<Message[]>([
//     { role: "assistant", content: "Hello! To begin, please provide your age and biological sex (male/female/other)." },
//   ]);
//   const [userInput, setUserInput] = useState("");
//   const [patientInfo, setPatientInfo] = useState<PatientInfo>({});
//   const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
//     conditions: [],
//     medications: [],
//     allergies: [],
//     smoker: false,
//     alcoholUse: 'none',
//     familyHistory: []
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult>({
//     conditions: [],
//     recommendations: [],
//     careLevel: "self-care",
//     reasoning: "",
//     nextQuestion: null
//   });
//   const [diagnosisComplete, setDiagnosisComplete] = useState(false);
//   const [useDirectAPI, setUseDirectAPI] = useState(false);

//   const handleUserInput = async () => {
//     if (!userInput.trim()) return;

//     const newMessages = [...messages, { role: "user", content: userInput }];
//     setMessages(newMessages);
//     setUserInput("");
//     setLoading(true);
//     setError(null);

//     try {
//       const endpoint = useDirectAPI ? "/api/direct-groq" : "/api/analyze-symptoms";
//       console.log(`Calling ${endpoint}`);

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           conversation: newMessages,
//           patientInfo,
//           medicalHistory
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("API response:", result);

//       updatePatientInfo(newMessages);
//       updateMedicalHistory(newMessages);

//       const analysis = result.analysis || {
//         conditions: result.conditions || [],
//         recommendations: result.recommendations || ["No specific recommendations available"],
//         careLevel: result.careLevel || "self-care",
//         reasoning: result.reasoning || "No detailed reasoning provided"
//       };

//       if (result.nextQuestion === null) {
//         setDiagnosisComplete(true);
//         setDiagnosisResult({
//           ...analysis,
//           nextQuestion: null
//         });
//         setMessages([
//           ...newMessages,
//           {
//             role: "assistant",
//             content: "Assessment complete. Please review your results below."
//           },
//         ]);
//       } else {
//         setDiagnosisResult({
//           ...analysis,
//           nextQuestion: result.nextQuestion
//         });
//         setMessages([...newMessages, { role: "assistant", content: result.nextQuestion }]);
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       setError("An error occurred. Please try again.");
//       setMessages([
//         ...newMessages,
//         {
//           role: "assistant",
//           content: "I encountered an error. Could you please rephrase your response?"
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePatientInfo = (conversation: Message[]) => {
//     const lastUserMessage = conversation.filter(m => m.role === "user").pop()?.content.toLowerCase() || "";

//     const ageMatch = lastUserMessage.match(/\b(\d+)\s*(years?|yrs?|y\/o)?\b/i);
//     if (ageMatch && !patientInfo.age) {
//       setPatientInfo(prev => ({ ...prev, age: ageMatch[1] }));
//     }

//     if (!patientInfo.gender) {
//       if (/female|woman|girl|f\b/i.test(lastUserMessage)) {
//         setPatientInfo(prev => ({ ...prev, gender: "female" }));
//       } else if (/male|man|boy|m\b/i.test(lastUserMessage)) {
//         setPatientInfo(prev => ({ ...prev, gender: "male" }));
//       } else if (/other|non-binary|nb\b/i.test(lastUserMessage)) {
//         setPatientInfo(prev => ({ ...prev, gender: "other" }));
//       }
//     }
//   };

//   const updateMedicalHistory = (conversation: Message[]) => {
//     const lastUserMessage = conversation.filter(m => m.role === "user").pop()?.content.toLowerCase() || "";
//     const lastAssistantMessage = conversation.filter(m => m.role === "assistant").pop()?.content || "";

//     if (lastAssistantMessage.includes("chronic conditions")) {
//       const conditions = ["diabetes", "hypertension", "heart disease", "asthma", "copd", "thyroid"];
//       const mentionedConditions = conditions.filter(c => lastUserMessage.includes(c));
//       if (mentionedConditions.length > 0) {
//         setMedicalHistory(prev => ({
//           ...prev,
//           conditions: [...new Set([...prev.conditions, ...mentionedConditions])]
//         }));
//       }
//     }

//     if (lastAssistantMessage.includes("medications")) {
//       const meds = ["ibuprofen", "aspirin", "paracetamol", "insulin", "statins"];
//       const mentionedMeds = meds.filter(m => lastUserMessage.includes(m));
//       if (mentionedMeds.length > 0) {
//         setMedicalHistory(prev => ({
//           ...prev,
//           medications: [...new Set([...prev.medications, ...mentionedMeds])]
//         }));
//       }
//     }

//     if (lastAssistantMessage.includes("allergies")) {
//       const allergies = ["penicillin", "nuts", "shellfish", "latex"];
//       const mentionedAllergies = allergies.filter(a => lastUserMessage.includes(a));
//       if (mentionedAllergies.length > 0) {
//         setMedicalHistory(prev => ({
//           ...prev,
//           allergies: [...new Set([...prev.allergies, ...mentionedAllergies])]
//         }));
//       }
//     }

//     if (lastAssistantMessage.includes("smoke")) {
//       setMedicalHistory(prev => ({
//         ...prev,
//         smoker: lastUserMessage.includes("yes") || lastUserMessage.includes("smoke")
//       }));
//     }

//     if (lastAssistantMessage.includes("alcohol")) {
//       setMedicalHistory(prev => ({
//         ...prev,
//         alcoholUse: lastUserMessage.includes("regular") ? "regular" :
//                    lastUserMessage.includes("sometimes") ? "sometimes" : "none"
//       }));
//     }

//     if (lastAssistantMessage.includes("family history")) {
//       const familyConditions = ["cancer", "heart disease", "diabetes", "alzheimer"];
//       const mentionedFamily = familyConditions.filter(f => lastUserMessage.includes(f));
//       if (mentionedFamily.length > 0) {
//         setMedicalHistory(prev => ({
//           ...prev,
//           familyHistory: [...new Set([...prev.familyHistory, ...mentionedFamily])]
//         }));
//       }
//     }
//   };

//   const extractSymptoms = (): SymptomDetails[] => {
//     const symptoms: SymptomDetails[] = [];
//     let currentSymptom: Partial<SymptomDetails> = {};
//     let expectingDuration = false;
//     let expectingSeverity = false;

//     messages.forEach((msg, i) => {
//       if (msg.role === 'user') {
//         if (expectingDuration) {
//           currentSymptom.duration = msg.content;
//           expectingDuration = false;
//         } else if (expectingSeverity) {
//           const severityMatch = msg.content.match(/\b([1-9]|10)\b/);
//           currentSymptom.severity = severityMatch ? parseInt(severityMatch[1]) : 5;
//           expectingSeverity = false;
//         } else if (msg.content.toLowerCase().match(/\b(pain|ache|discomfort|nausea|dizziness|fever|cough|shortness of breath)\b/i)) {
//           currentSymptom = {
//             name: msg.content.split(' ').slice(0, 3).join(' '),
//             duration: 'Unknown',
//             severity: 5,
//             description: msg.content
//           };
//           symptoms.push(currentSymptom as SymptomDetails);
//         }
//       } else if (msg.role === 'assistant') {
//         if (msg.content.includes('How long')) {
//           expectingDuration = true;
//         } else if (msg.content.includes('scale of 1-10')) {
//           expectingSeverity = true;
//         }
//       }
//     });

//     return symptoms;
//   };

//   const getDoctorRecommendation = (
//     conditions: {name: string, probability: number}[],
//     careLevel: DiagnosisResult['careLevel']
//   ): DoctorRecommendation => {
//     const lowerConditions = conditions.map(c => c.name.toLowerCase());

//     // Emergency override
//     if (careLevel === 'emergency') {
//       return {
//         specialty: 'Emergency Room',
//         reason: 'Immediate medical attention required',
//         urgency: 'emergency'
//       };
//     }

//     // Cardiac conditions
//     const cardiacKeywords = ['heart', 'chest pain', 'angina', 'arrhythmia'];
//     if (cardiacKeywords.some(keyword =>
//       lowerConditions.some(c => c.includes(keyword)))
//     ) {
//       return {
//         specialty: 'Cardiologist',
//         reason: 'Cardiac evaluation recommended',
//         urgency: careLevel === 'urgent care' ? 'urgent' : 'routine'
//       };
//     }

//     // Neurological conditions
//     const neuroKeywords = ['migraine', 'seizure', 'stroke', 'neuropathy'];
//     if (neuroKeywords.some(keyword =>
//       lowerConditions.some(c => c.includes(keyword)))
//     ) {
//       return {
//         specialty: 'Neurologist',
//         reason: 'Neurological evaluation suggested',
//         urgency: lowerConditions.some(c => c.includes('stroke')) ? 'urgent' : 'routine'
//       };
//     }

//     // Respiratory conditions
//     const respiratoryKeywords = ['asthma', 'copd', 'pneumonia', 'shortness of breath'];
//     if (respiratoryKeywords.some(keyword =>
//       lowerConditions.some(c => c.includes(keyword)))
//     ) {
//       return {
//         specialty: 'Pulmonologist',
//         reason: 'Respiratory evaluation recommended',
//         urgency: lowerConditions.some(c => c.includes('pneumonia')) ? 'urgent' : 'routine'
//       };
//     }

//     // Endocrine conditions
//     if (lowerConditions.some(c => c.includes('diabetes') || c.includes('thyroid'))) {
//       return {
//         specialty: 'Endocrinologist',
//         reason: 'Metabolic/hormonal evaluation needed',
//         urgency: 'routine'
//       };
//     }

//     // Default to primary care
//     return {
//       specialty: 'Primary Care Physician',
//       reason: 'Initial evaluation and referral if needed',
//       urgency: 'routine'
//     };
//   };

//   const DoctorRecommendationCard = ({
//     recommendation
//   }: {
//     recommendation: DoctorRecommendation
//   }) => {
//     const urgencyClasses = {
//       emergency: 'bg-red-100 text-red-800 border-red-200',
//       urgent: 'bg-orange-100 text-orange-800 border-orange-200',
//       routine: 'bg-green-100 text-green-800 border-green-200'
//     };

//     const specialtyIcons = {
//       'Cardiologist': '❤️',
//       'Neurologist': '🧠',
//       'Pulmonologist': '🫁',
//       'Endocrinologist': '🦋',
//       'Primary Care Physician': '👨‍⚕️',
//       'Emergency Room': '🚨',
//       'default': '🏥'
//     };

//     return (
//       <div className={`border rounded-lg p-4 ${urgencyClasses[recommendation.urgency]} mt-4`}>
//         <div className="flex items-start gap-3">
//           <span className="text-2xl" role="img">
//             {specialtyIcons[recommendation.specialty as keyof typeof specialtyIcons] || specialtyIcons.default}
//           </span>
//           <div>
//             <h3 className="font-bold text-lg mb-1">
//               {recommendation.specialty}
//             </h3>
//             <p className="mb-2">{recommendation.reason}</p>
//             <div className="flex items-center">
//               <span className="font-medium mr-2">Priority:</span>
//               <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
//                 urgencyClasses[recommendation.urgency]
//               }`}>
//                 {recommendation.urgency.toUpperCase()}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const handleGenerateReport = () => {
//     if (!diagnosisResult) return;

//     const reportData: MedicalReport = {
//       patientInfo: {
//         age: parseInt(patientInfo.age || '0'),
//         gender: patientInfo.gender || 'Not specified',
//         location: patientInfo.location || 'Not specified'
//       },
//       medicalHistory,
//       symptoms: extractSymptoms(),
//       assessment: {
//         conditions: diagnosisResult.conditions,
//         recommendations: diagnosisResult.recommendations,
//         careLevel: diagnosisResult.careLevel,
//         reasoning: diagnosisResult.reasoning
//       },
//       generatedAt: new Date().toISOString()
//     };

//     try {
//       generateMedicalReport(reportData);
//     } catch (error) {
//       console.error("Failed to generate report:", error);
//       setError("Failed to generate report. Please try again.");
//     }
//   };

//   const handleKeyPress = (e: KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleUserInput();
//     }
//   };

//   const renderCareLevelBadge = (careLevel: string) => {
//     const colors = {
//       "self-care": "bg-green-500 text-white",
//       "primary care": "bg-blue-500 text-white",
//       "specialist": "bg-yellow-500 text-black",
//       "urgent care": "bg-orange-500 text-white",
//       "emergency": "bg-red-500 text-white"
//     };

//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[careLevel as keyof typeof colors] || "bg-gray-500 text-white"}`}>
//         {careLevel ? careLevel.charAt(0).toUpperCase() + careLevel.slice(1) : ''}
//       </span>
//     );
//   };

//   return (
//     <div className="container max-w-4xl mx-auto py-10 px-4">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="border-b p-4 md:p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold">AI Symptom Checker</h1>
//               <p className="text-gray-500 mt-1">
//                 Answer questions to get a medical assessment and report.
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-500">API Mode:</span>
//               <button
//                 onClick={() => setUseDirectAPI(!useDirectAPI)}
//                 className={`px-3 py-1 text-sm rounded-md border ${
//                   useDirectAPI ? "bg-blue-600 text-white" : "bg-white text-gray-700"
//                 }`}
//               >
//                 {useDirectAPI ? "Direct API" : "AI SDK"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 md:p-6">
//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//               <p>{error}</p>
//             </div>
//           )}

//           {/* Conversation */}
//           <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto p-2 border rounded-md">
//             {messages.map((message, index) => (
//               <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
//                 <div className={`max-w-[80%] p-3 rounded-lg ${
//                   message.role === "assistant" ? "bg-blue-50" : "bg-blue-600 text-white"
//                 }`}>
//                   <p>{message.content}</p>
//                 </div>
//               </div>
//             ))}
//             {loading && (
//               <div className="flex justify-start">
//                 <div className="bg-blue-50 p-3 rounded-lg flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
//                   <span>Analyzing...</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Input */}
//           {!diagnosisComplete ? (
//             <div className="flex gap-2">
//               <textarea
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder="Type your response..."
//                 className="flex-1 min-h-[80px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loading}
//               />
//               <button
//                 onClick={handleUserInput}
//                 disabled={loading || !userInput.trim()}
//                 className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading ? "Sending..." : "Send"}
//               </button>
//             </div>
//           ) : null}

//           {/* Results */}
//           {diagnosisComplete && (
//             <div className="mt-8 space-y-6 border-t pt-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Assessment</h3>
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="flex justify-between items-center mb-2">
//                     <h4 className="font-medium">Recommended Care Level:</h4>
//                     {renderCareLevelBadge(diagnosisResult.careLevel)}
//                   </div>
//                   <p className="text-sm">{diagnosisResult.reasoning}</p>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
//                 <div className="space-y-3">
//                   {diagnosisResult.conditions.length > 0 ? (
//                     diagnosisResult.conditions.map((condition, index) => (
//                       <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                         <span>{condition.name}</span>
//                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                           index === 0 ? "bg-blue-600 text-white" : "bg-gray-200"
//                         }`}>
//                           {Math.round(condition.probability * 100)}%
//                         </span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-center py-4">No conditions identified</p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
//                 <ul className="list-disc pl-5 space-y-2 bg-green-50 p-4 rounded-lg">
//                   {diagnosisResult.recommendations.length > 0 ? (
//                     diagnosisResult.recommendations.map((rec, index) => (
//                       <li key={index}>{rec}</li>
//                     ))
//                   ) : (
//                     <li className="text-gray-500">No specific recommendations available</li>
//                   )}
//                 </ul>
//               </div>

//               {/* Doctor Recommendation Section */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Recommended Specialist</h3>
//                 <DoctorRecommendationCard
//                   recommendation={getDoctorRecommendation(
//                     diagnosisResult.conditions,
//                     diagnosisResult.careLevel
//                   )}
//                 />
//                 <button
//                   className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   onClick={() => {
//                     // Implement doctor search functionality
//                     console.log('Find doctors clicked');
//                   }}
//                 >
//                   Find {getDoctorRecommendation(diagnosisResult.conditions, diagnosisResult.careLevel).specialty} Near Me
//                 </button>
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => {
//                     setMessages([{ role: "assistant", content: "Hello! To begin, please provide your age and biological sex (male/female/other)." }]);
//                     setDiagnosisComplete(false);
//                     setDiagnosisResult({
//                       conditions: [],
//                       recommendations: [],
//                       careLevel: "self-care",
//                       reasoning: "",
//                       nextQuestion: null
//                     });
//                     setPatientInfo({});
//                     setMedicalHistory({
//                       conditions: [],
//                       medications: [],
//                       allergies: [],
//                       smoker: false,
//                       alcoholUse: 'none',
//                       familyHistory: []
//                     });
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//                 >
//                   Start New Assessment
//                 </button>
//                 <button
//                   onClick={handleGenerateReport}
//                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                 >
//                   Download Full Report
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="border-t p-4 text-sm text-gray-500">
//           <p>This tool provides general health information and is not a substitute for professional medical advice.</p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client"
import { useState, KeyboardEvent } from "react";
import { generateMedicalReport } from "../api/analyze-symptoms/generateReport";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type PatientInfo = {
  age: string;
  gender: string;
  location?: string;
  [key: string]: any;
};

type MedicalHistory = {
  conditions: string[];
  medications: string[];
  allergies: string[];
  smoker: boolean;
  alcoholUse: string;
  familyHistory: string[];
};

type SymptomDetails = {
  name: string;
  duration: string;
  severity: number;
  description: string;
};

type MedicalSpecialty =
  | 'Primary Care Physician'
  | 'Cardiologist'
  | 'Neurologist'
  | 'Pulmonologist'
  | 'Endocrinologist'
  | 'Gastroenterologist'
  | 'Dermatologist'
  | 'Emergency Room';

type DoctorRecommendation = {
  specialty: MedicalSpecialty;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
};

type DiagnosisResult = {
  conditions: Array<{ name: string; probability: number }>;
  recommendations: string[];
  careLevel: "self-care" | "primary care" | "specialist" | "urgent care" | "emergency";
  reasoning: string;
  nextQuestion: string | null;
};

// type MedicalReport = {
//   patientInfo: {
//     age: number;
//     gender: string;
//     location?: string;
//   };
//   medicalHistory: MedicalHistory;
//   symptoms: SymptomDetails[];
//   assessment: {
//     conditions: Array<{ name: string; probability: number }>;
//     recommendations: string[];
//     careLevel: string;
//     reasoning: string;
//   };
//   generatedAt: string;
// };
type MedicalReport = {
  patientInfo: {
    age: number;
    gender: string;
    location?: string;
  };
  medicalHistory: MedicalHistory;
  symptoms: SymptomDetails[];
  assessment: {
    conditions: Array<{ name: string; probability: number }>;
    recommendations: string[];
    careLevel: string;
    reasoning: string;
  };
  doctorRecommendation?: DoctorRecommendation; // Add this line
  generatedAt: string;
};

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
        setMessages([...newMessages, { role: "assistant", content: result.nextQuestion }]);
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
  const extractSymptoms = (): SymptomDetails[] => {
    const symptoms: SymptomDetails[] = [];
    const symptomPattern = /\b(pain|ache|discomfort|nausea|dizziness|fever|cough|shortness of breath|headache|fatigue|rash|swelling|bleeding)\b/i;
    let currentSymptom: SymptomDetails | null = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.content?.trim()) continue;

      if (msg.role === 'user') {
        // Check if this is a response to a duration question
        if (currentSymptom && !currentSymptom.duration &&
            i > 0 && messages[i-1].content.includes('How long')) {
          currentSymptom.duration = msg.content;
          continue;
        }

        // Check if this is a response to a severity question
        if (currentSymptom && currentSymptom.severity === undefined &&
            i > 0 && messages[i-1].content.includes('scale of 1-10')) {
          const severityMatch = msg.content.match(/\b([1-9]|10)\b/);
          currentSymptom.severity = severityMatch ? parseInt(severityMatch[1]) : 5;
          continue;
        }

        // Detect new symptoms
        const symptomMatch = msg.content.match(symptomPattern);
        if (symptomMatch) {
          // Finalize previous symptom if exists
          if (currentSymptom) {
            symptoms.push(currentSymptom);
          }

          currentSymptom = {
            name: symptomMatch[0],
            duration: 'Unknown',
            severity: 5, // Default value
            description: msg.content.length > 100
              ? `${msg.content.substring(0, 100)}...`
              : msg.content
          };
        }
      }
    }

    // Add the last symptom if it exists
    if (currentSymptom) {
      symptoms.push(currentSymptom);
    }

    return symptoms;
  };
  const getDoctorRecommendation = (
    conditions: {name: string, probability: number}[],
    careLevel: DiagnosisResult['careLevel']
  ): DoctorRecommendation => {
    const lowerConditions = conditions.map(c => c.name.toLowerCase());

    // Emergency override
    if (careLevel === 'emergency') {
      return {
        specialty: 'Emergency Room',
        reason: 'Immediate medical attention required',
        urgency: 'emergency'
      };
    }

    // Cardiac conditions
    const cardiacKeywords = ['heart', 'chest pain', 'angina', 'arrhythmia'];
    if (cardiacKeywords.some(keyword =>
      lowerConditions.some(c => c.includes(keyword)))
    ) {
      return {
        specialty: 'Cardiologist',
        reason: 'Cardiac evaluation recommended',
        urgency: careLevel === 'urgent care' ? 'urgent' : 'routine'
      };
    }

    // Neurological conditions
    const neuroKeywords = ['migraine', 'seizure', 'stroke', 'neuropathy'];
    if (neuroKeywords.some(keyword =>
      lowerConditions.some(c => c.includes(keyword)))
    ) {
      return {
        specialty: 'Neurologist',
        reason: 'Neurological evaluation suggested',
        urgency: lowerConditions.some(c => c.includes('stroke')) ? 'urgent' : 'routine'
      };
    }

    // Respiratory conditions
    const respiratoryKeywords = ['asthma', 'copd', 'pneumonia', 'shortness of breath'];
    if (respiratoryKeywords.some(keyword =>
      lowerConditions.some(c => c.includes(keyword)))
    ) {
      return {
        specialty: 'Pulmonologist',
        reason: 'Respiratory evaluation recommended',
        urgency: lowerConditions.some(c => c.includes('pneumonia')) ? 'urgent' : 'routine'
      };
    }

    // Endocrine conditions
    if (lowerConditions.some(c => c.includes('diabetes') || c.includes('thyroid'))) {
      return {
        specialty: 'Endocrinologist',
        reason: 'Metabolic/hormonal evaluation needed',
        urgency: 'routine'
      };
    }

    // Default to primary care
    return {
      specialty: 'Primary Care Physician',
      reason: 'Initial evaluation and referral if needed',
      urgency: 'routine'
    };
  };

  const DoctorRecommendationCard = ({
    recommendation
  }: {
    recommendation: DoctorRecommendation
  }) => {
    const urgencyClasses = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      routine: 'bg-green-100 text-green-800 border-green-200'
    };

    const specialtyIcons = {
      'Cardiologist': '❤️',
      'Neurologist': '🧠',
      'Pulmonologist': '🫁',
      'Endocrinologist': '🦋',
      'Primary Care Physician': '👨‍⚕️',
      'Emergency Room': '🚨',
      'default': '🏥'
    };

    return (
      <div className={`border rounded-lg p-4 ${urgencyClasses[recommendation.urgency]} mt-4`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img">
            {specialtyIcons[recommendation.specialty as keyof typeof specialtyIcons] || specialtyIcons.default}
          </span>
          <div>
            <h3 className="font-bold text-lg mb-1">
              {recommendation.specialty}
            </h3>
            <p className="mb-2">{recommendation.reason}</p>
            <div className="flex items-center">
              <span className="font-medium mr-2">Priority:</span>
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                urgencyClasses[recommendation.urgency]
              }`}>
                {recommendation.urgency.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
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
      symptoms: extractSymptoms(),
      assessment: {
        conditions: diagnosisResult.conditions,
        recommendations: diagnosisResult.recommendations,
        careLevel: diagnosisResult.careLevel,
        reasoning: diagnosisResult.reasoning
      },
      doctorRecommendation: getDoctorRecommendation( // Add this
        diagnosisResult.conditions,
        diagnosisResult.careLevel
      ),
      generatedAt: new Date().toISOString()
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">API Mode:</span>
              <button
                onClick={() => setUseDirectAPI(!useDirectAPI)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  useDirectAPI ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                }`}
              >
                {useDirectAPI ? "Direct API" : "AI SDK"}
              </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value=""> select you sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
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
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommended Specialist</h3>
                    <DoctorRecommendationCard
                      recommendation={getDoctorRecommendation(
                        diagnosisResult.conditions,
                        diagnosisResult.careLevel
                      )}
                    />
                    <button
                      className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => {
                        window.location.href = `http://localhost:3000/find-specialist?specialty=${encodeURIComponent(getDoctorRecommendation(diagnosisResult.conditions, diagnosisResult.careLevel).specialty)}`;
                      }}
                    >
                      Find {getDoctorRecommendation(diagnosisResult.conditions, diagnosisResult.careLevel).specialty} Near Me
                    </button>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setMessages([]);
                        setDiagnosisComplete(false);
                        setDiagnosisResult({
                          conditions: [],
                          recommendations: [],
                          careLevel: "self-care",
                          reasoning: "",
                          nextQuestion: null
                        });
                        setPatientInfo({ age: "", gender: "" });
                        setMedicalHistory({
                          conditions: [],
                          medications: [],
                          allergies: [],
                          smoker: false,
                          alcoholUse: 'none',
                          familyHistory: []
                        });
                        setStep("demographics");
                      }}
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