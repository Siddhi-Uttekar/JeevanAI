// @ts-ignore
import nlp from "compromise";
import {
  SymptomDetails,
  DiagnosisResult,
  DoctorRecommendation,
  Message,
} from "@/app/api/analyze-symptoms/type";

export const extractSymptoms = (
  messages: Message[]
): SymptomDetails[] => {
  const symptoms: SymptomDetails[] = [];
  let currentSymptom: SymptomDetails | null = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg.content?.trim()) continue;

    if (msg.role === "user") {
      // Check if this is a response to a duration question
      if (
        currentSymptom &&
        currentSymptom.duration === "Unknown" &&
        i > 0 &&
        messages[i - 1].content?.includes("How long")
      ) {
        currentSymptom.duration = msg.content;
        continue;
      }

      // Check if this is a response to a severity question
      if (
        currentSymptom &&
        currentSymptom.severity === 5 &&
        i > 0 &&
        messages[i - 1].content?.includes("scale of 1-10")
      ) {
        const severityMatch = msg.content.match(/\b([1-9]|10)\b/);
        currentSymptom.severity = severityMatch
          ? parseInt(severityMatch[1])
          : 5;
        continue;
      }

      // Detect new symptoms using NLP
      const doc = nlp(msg.content);
      const potentialSymptoms = doc.nouns().out("array") as string[];
      // Filter out common non-symptom words
      const stopWords = new Set(["day", "week", "month", "year", "doctor", "scale", "user", "patient", "response"]);
      const foundSymptom = potentialSymptoms.find(p => !stopWords.has(p.toLowerCase()));


      if (foundSymptom) {
        // Finalize previous symptom if exists
        if (currentSymptom) {
          symptoms.push(currentSymptom);
        }

        currentSymptom = {
          name: foundSymptom,
          duration: "Unknown",
          severity: 5, // Default value
          description:
            msg.content.length > 100
              ? `${msg.content.substring(0, 100)}...`
              : msg.content,
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

export const getDoctorRecommendation = (
  conditions: { name: string; probability: number }[],
  careLevel: DiagnosisResult["careLevel"]
): DoctorRecommendation => {
  const lowerConditions = conditions.map((c) => c.name.toLowerCase());

  // Emergency override
  if (careLevel === "emergency") {
    return {
      specialty: "Emergency Room",
      reason: "Immediate medical attention required",
      urgency: "emergency",
    };
  }

  // Cardiac conditions
  const cardiacKeywords = ["heart", "chest pain", "angina", "arrhythmia"];
  if (
    cardiacKeywords.some((keyword) =>
      lowerConditions.some((c) => c.includes(keyword))
    )
  ) {
    return {
      specialty: "Cardiologist",
      reason: "Cardiac evaluation recommended",
      urgency: careLevel === "urgent care" ? "urgent" : "routine",
    };
  }

  // Neurological conditions
  const neuroKeywords = ["migraine", "seizure", "stroke", "neuropathy"];
  if (
    neuroKeywords.some((keyword) =>
      lowerConditions.some((c) => c.includes(keyword))
    )
  ) {
    return {
      specialty: "Neurologist",
      reason: "Neurological evaluation suggested",
      urgency: lowerConditions.some((c) => c.includes("stroke"))
        ? "urgent"
        : "routine",
    };
  }

  // Respiratory conditions
  const respiratoryKeywords = [
    "asthma",
    "copd",
    "pneumonia",
    "shortness of breath",
  ];
  if (
    respiratoryKeywords.some((keyword) =>
      lowerConditions.some((c) => c.includes(keyword))
    )
  ) {
    return {
      specialty: "Pulmonologist",
      reason: "Respiratory evaluation recommended",
      urgency: lowerConditions.some((c) => c.includes("pneumonia"))
        ? "urgent"
        : "routine",
    };
  }

  // Endocrine conditions
  if (
    lowerConditions.some(
      (c) => c.includes("diabetes") || c.includes("thyroid")
    )
  ) {
    return {
      specialty: "Endocrinologist",
      reason: "Metabolic/hormonal evaluation needed",
      urgency: "routine",
    };
  }

  // Default to primary care
  return {
    specialty: "Primary Care Physician",
    reason: "Initial evaluation and referral if needed",
    urgency: "routine",
  };
};
