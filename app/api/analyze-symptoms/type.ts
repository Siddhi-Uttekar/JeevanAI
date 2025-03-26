export type Message = {
    role: "assistant" | "user";
    content: string;
  };

  export type PatientInfo = {
    age?: string;
    gender?: string;
    location?: string;
    [key: string]: any;
  };

  export type MedicalHistory = {
    conditions: string[];
    medications: string[];
    allergies: string[];
    smoker: boolean;
    alcoholUse: string;
    familyHistory: string[];
  };

  export type SymptomDetails = {
    name: string;
    duration: string;
    severity: number;
    description: string;
  };

  export type DiagnosisResult = {
    conditions: Array<{ name: string; probability: number }>;
    recommendations: string[];
    careLevel: "self-care" | "primary care" | "specialist" | "urgent care" | "emergency";
    reasoning: string;
    nextQuestion: string | null;
  };

  export type MedicalReport = {
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
    generatedAt: string;
  };