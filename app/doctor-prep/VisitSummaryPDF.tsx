import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: { padding: 20 },
  headerContainer: { alignItems: "center", marginBottom: 20 },
  header: { fontSize: 18, fontWeight: "bold" },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  text: { fontSize: 12 },
  boldText: { fontSize: 12, fontWeight: "bold" },
  line: { borderBottomWidth: 1, borderBottomColor: "#000", marginVertical: 5 },
});

const VisitSummaryPDF = ({ formData }: { formData: any }) => (
  <Document>
    <Page style={styles.page}>
      {/* Centered Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Doctor Visit Summary</Text>
      </View>

      {/* Appointment Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.boldText}>Appointment Type:</Text>
          <Text style={styles.text}>{formData.appointmentType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.boldText}>Appointment Date:</Text>
          <Text style={styles.text}>{formData.appointmentDate}</Text>
        </View>
      </View>

      {/* Horizontal Line */}
      <View style={styles.line} />

      {/* Symptoms Section */}
      <View style={styles.section}>
        <Text style={styles.boldText}>Symptoms</Text>
        <View style={styles.line} />
        <Text style={styles.text}>{formData.symptoms}</Text>
      </View>

      {/* Medical History Section */}
      <View style={styles.section}>
        <Text style={styles.boldText}>Medical History</Text>
        <View style={styles.line} />
        <Text style={styles.text}>{formData.medicalHistory}</Text>
      </View>

      {/* Current Medications Section */}
      <View style={styles.section}>
        <Text style={styles.boldText}>Current Medications</Text>
        <View style={styles.line} />
        <Text style={styles.text}>{formData.medications}</Text>
      </View>

      {/* Allergies Section */}
      <View style={styles.section}>
        <Text style={styles.boldText}>Allergies</Text>
        <View style={styles.line} />
        <Text style={styles.text}>{formData.allergies}</Text>
      </View>

      {/* Questions for Doctor */}
      <View style={styles.section}>
        <Text style={styles.boldText}>Questions for the Doctor</Text>
        <View style={styles.line} />
        <Text style={styles.text}>{formData.questions}</Text>
      </View>
    </Page>
  </Document>
);

export default VisitSummaryPDF;
