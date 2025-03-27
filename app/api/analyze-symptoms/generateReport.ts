
  import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MedicalReport, MedicalSpecialty } from "./type";

// Add this at the top of your generateReport.ts file
const getLastTablePosition = (doc: jsPDF) => {
  return (doc as any).lastAutoTable?.finalY || 20;
};

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
      ["Age", data.patientInfo.age.toString()],
      ["Gender", data.patientInfo.gender || "Not specified"],
      ["Location", data.patientInfo.location || "Not specified"],
    ],
    theme: "grid",
    styles: { cellPadding: 4 }
  });

  // Medical History - Improved Layout
  doc.setFontSize(14);
  doc.text("Medical History", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Category", "Details"]],
    body: [
      ["Chronic Conditions", data.medicalHistory.conditions.join(", ") || "None"],
      ["Medications", data.medicalHistory.medications.join(", ") || "None"],
      ["Allergies", data.medicalHistory.allergies.join(", ") || "None"],
      [
        "Lifestyle",
        `• Smoking: ${data.medicalHistory.smoker ? "Yes" : "No"}\n` +
        `• Alcohol: ${data.medicalHistory.alcoholUse || "Not specified"}` +
        (data.medicalHistory.smokingDetails ?
          `\n• Smoking Details: ${data.medicalHistory.smokingDetails.frequency}, ${data.medicalHistory.smokingDetails.years} years` : "")
      ],
      ["Family History", data.medicalHistory.familyHistory.join(", ") || "None"]
    ],
    theme: "grid",
    styles: {
      cellPadding: 4,
      minCellHeight: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });

  // Symptoms
  doc.setFontSize(14);
  doc.text("Reported Symptoms", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Symptom", "Duration", "Severity", "Description"]],
    body: data.symptoms.length > 0
      ? data.symptoms.map(s => [
          s.name,
          s.duration,
          `${s.severity}/10`,
          s.description || "Not specified"
        ])
      : [["No symptoms reported", "", "", ""]],
    theme: "grid",
    styles: { fontSize: 10 }
  });

  // Assessment
  doc.setFontSize(14);
  doc.text("Medical Assessment", 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Condition", "Probability", "Notes"]],
    body: data.assessment.conditions.length > 0
      ? data.assessment.conditions.map(c => [
          c.name,
          `${Math.round(c.probability * 100)}%`,
          data.assessment.reasoning.substring(0, 100) + (data.assessment.reasoning.length > 100 ? "..." : "")
        ])
      : [["No conditions identified", "", ""]],
    theme: "grid",
    columnStyles: {
      2: { cellWidth: 80, fontStyle: 'italic' }
    }
  });

  // Recommendations
  doc.setFontSize(14);
  doc.text("Recommendations", 14, (doc as any).lastAutoTable.finalY + 15);
  const recommendations = data.assessment.recommendations.length > 0
    ? data.assessment.recommendations
    : ["No specific recommendations provided"];

  // Create a numbered list
  const formattedRecs = recommendations.map((rec, i) => `${i+1}. ${rec}`).join("\n");

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    body: [[formattedRecs]],
    theme: "plain",
    styles: {
      cellPadding: 6,
      fontSize: 11,
      lineColor: [255, 255, 255] // Hide cell borders
    }
  });

  // Add this after the Recommendations section in generateReport.ts
// In generateReport.ts - after Recommendations section
if (data.doctorRecommendation) {
  const startY = getLastTablePosition(doc) + 15;
  doc.setFontSize(14);
  doc.text("Recommended Specialist", 14, startY);

  // Urgency colors
  const urgency = {
    emergency: [255, 0, 0],    // red
    urgent: [255, 165, 0],     // orange
    routine: [0, 128, 0]       // green
  }[data.doctorRecommendation.urgency] || [0, 0, 0];

  // Complete icon mapping


  autoTable(doc, {
    startY: startY + 10,
    body: [
      [
        {
          content: data.doctorRecommendation.specialty,
          styles: { fontSize: 13, cellPadding: { top: 5, bottom: 5, left: 5 }, textColor: [0, 0, 255] }
        },
        {
          content: [
            `\n${data.doctorRecommendation.reason}\nPriority.urgency : ${data.doctorRecommendation.urgency.toUpperCase()}`
          ],
          styles: {
            cellPadding: { left: 10 },
            textColor:
              data.doctorRecommendation.urgency.toUpperCase() === "EMERGENCY"
                ? [255, 0, 0] // Red for emergency
                : data.doctorRecommendation.urgency.toUpperCase() === "URGENT"
                ? [255, 165, 0] // Orange for urgent
                : [0, 128, 0] // Green for routine
          }
        }
      ]
    ],
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' }
    }
  });
}
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Disclaimer: This report is for informational purposes only and does not constitute medical advice.",
    14,
    doc.internal.pageSize.height - 15,
    { maxWidth: 180 }
  );

  // Save PDF
doc.save(`Medical_Report_${data.patientInfo.gender || 'Patient'}_${new Date().toISOString().slice(0,10)}.pdf`);


  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Disclaimer: This report is for informational purposes only and does not constitute medical advice.",
    14,
    doc.internal.pageSize.height - 15,
    { maxWidth: 180 }
  );

  // Save PDF
  doc.save(`Medical_Report_${data.patientInfo.gender || 'Patient'}_${new Date().toISOString().slice(0,10)}.pdf`);
};
