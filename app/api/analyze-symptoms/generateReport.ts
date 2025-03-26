import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MedicalReport } from "./type";

export const generateMedicalReport = (data: MedicalReport) => {
  const doc = new jsPDF();

  // Report Header
  doc.setFontSize(18);
  doc.text("Medical Symptom Assessment Report", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 105, 30, { align: "center" });

  // Patient Information
  doc.setFontSize(14);
  doc.text("Patient Information", 14, 45);
  autoTable(doc, {
    startY: 50,
    head: [["Category", "Details"]],
    body: [
      ["Age", data.patientInfo.age],
      ["Gender", data.patientInfo.gender],
      ["Location", data.patientInfo.location || "Not specified"],
    ],
    theme: "grid"
  });

  // Medical History
  doc.setFontSize(14);
  doc.text("Medical History", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Condition", "Details"]],
    body: [
      ["Chronic Conditions", data.medicalHistory.conditions.join(", ") || "None"],
      ["Medications", data.medicalHistory.medications.join(", ") || "None"],
      ["Allergies", data.medicalHistory.allergies.join(", ") || "None"],
      ["Lifestyle", `Smoker: ${data.medicalHistory.smoker ? "Yes" : "No"} | Alcohol: ${data.medicalHistory.alcoholUse}`],
      ["Family History", data.medicalHistory.familyHistory.join(", ") || "None"],
    ],
    theme: "grid"
  });

  // Symptoms
  doc.setFontSize(14);
  doc.text("Reported Symptoms", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Symptom", "Duration", "Severity", "Description"]],
    body: data.symptoms.map(s => [
      s.name,
      s.duration,
      `${s.severity}/10`,
      s.description || "Not specified"
    ]),
    theme: "grid"
  });

  // Assessment
  doc.setFontSize(14);
  doc.text("Medical Assessment", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Condition", "Probability", "Notes"]],
    body: data.assessment.conditions.map(c => [
      c.name,
      `${Math.round(c.probability * 100)}%`,
      data.assessment.reasoning
    ]),
    theme: "grid"
  });

  // Recommendations
  doc.setFontSize(14);
  doc.text("Recommendations", 14, (doc as any).lastAutoTable.finalY + 15);
  doc.setFontSize(11);
  doc.text(data.assessment.recommendations.join("\n"), 16, (doc as any).lastAutoTable.finalY + 22);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Disclaimer: This report is for informational purposes only and does not constitute medical advice.",
    14, doc.internal.pageSize.height - 20, { maxWidth: 180 });

  // Save PDF
  doc.save(`Medical_Report_${new Date().toISOString().slice(0,10)}.pdf`);
};