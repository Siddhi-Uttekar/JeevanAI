"use client";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import VisitSummaryPDF from "./VisitSummaryPDF";

export default function DoctorPrep() {
  const [formData, setFormData] = useState({
    appointmentType: "",
    appointmentDate: "",
    doctorName: "",
    specialty: "",
    reason: "",
    symptoms: "",
    symptomDuration: "",
    medicalHistory: "",
    medications: "",
    allergies: "",
    questions: "",
    shareMedicalRecords: false,
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Doctor Visit Preparation</h2>
      <form className="space-y-4">
        <input type="text" name="appointmentType" placeholder="Appointment Type" onChange={handleChange} className="input-field" />
        <input type="date" name="appointmentDate" onChange={handleChange} className="input-field" />
        <input type="text" name="doctorName" placeholder="Doctor's Name" onChange={handleChange} className="input-field" />
        <input type="text" name="specialty" placeholder="Specialty" onChange={handleChange} className="input-field" />
        <textarea name="reason" placeholder="Primary Reason for Visit" onChange={handleChange} className="input-field" />
        <textarea name="symptoms" placeholder="Describe your symptoms" onChange={handleChange} className="input-field" />
        <input type="text" name="symptomDuration" placeholder="How long have you had these symptoms?" onChange={handleChange} className="input-field" />
        <textarea name="medicalHistory" placeholder="Medical History" onChange={handleChange} className="input-field" />
        <textarea name="medications" placeholder="Current Medications" onChange={handleChange} className="input-field" />
        <textarea name="allergies" placeholder="Allergies" onChange={handleChange} className="input-field" />
        <textarea name="questions" placeholder="Questions for the Doctor" onChange={handleChange} className="input-field" />

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="shareMedicalRecords" onChange={handleChange} />
          <span>Share Medical Records</span>
        </label>
      </form>

      <div className="mt-6">
        <PDFDownloadLink document={<VisitSummaryPDF formData={formData} />} fileName="Visit_Summary.pdf" className="bg-blue-600 text-white px-4 py-2 rounded-md">
          {({ loading }) => (loading ? "Generating PDF..." : "Download Visit Summary")}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
