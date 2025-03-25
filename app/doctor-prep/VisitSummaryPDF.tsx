import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Styles for PDF
const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  text: { fontSize: 12, marginBottom: 5 },
});

const VisitSummaryPDF = ({ formData }: { formData: any }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Doctor Visit Summary</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}><b>Appointment Type:</b> {formData.appointmentType}</Text>
        <Text style={styles.text}><b>Appointment Date:</b> {formData.appointmentDate}</Text>
        <Text style={styles.text}><b>Doctor's Name:</b> {formData.doctorName}</Text>
        <Text style={styles.text}><b>Specialty:</b> {formData.specialty}</Text>
        <Text style={styles.text}><b>Primary Reason for Visit:</b> {formData.reason}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Symptoms</Text>
        <Text style={styles.text}>{formData.symptoms}</Text>
        <Text style={styles.text}><b>Duration:</b> {formData.symptomDuration}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Medical History</Text>
        <Text style={styles.text}>{formData.medicalHistory}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Current Medications</Text>
        <Text style={styles.text}>{formData.medications}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Allergies</Text>
        <Text style={styles.text}>{formData.allergies}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Questions for the Doctor</Text>
        <Text style={styles.text}>{formData.questions}</Text>
      </View>

      {formData.shareMedicalRecords && (
        <View style={styles.section}>
          <Text style={styles.header}>Medical Records</Text>
          <Text style={styles.text}>Patient plans to share recent test results or records.</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default VisitSummaryPDF;
