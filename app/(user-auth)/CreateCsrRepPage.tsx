import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

export default function CreateCsrRepPage({ setScreen }) {
  const [terms, setTerms] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button at the top-left */}
      <Pressable onPress={() => setScreen("main")} style={styles.backButton}>
        <Text style={{ color: "blue" }}>← Back</Text>
      </Pressable>

      {/* Wrapper for Title and Form content */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create CSR Rep account</Text>

        <TextInput placeholder="Username" style={styles.input} />
        <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} />
        
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Password"
            secureTextEntry={hidePassword}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable onPress={() => setHidePassword(!hidePassword)}>
            <Text style={styles.showHide}>{hidePassword ? "Show" : "Hide"}</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <Switch value={terms} onValueChange={setTerms} />
          <Text style={styles.switchLabel}>I accept the terms and conditions</Text>
        </View>

        <Pressable style={[styles.button, !terms && { opacity: 0.5 }]} disabled={!terms}>
          <Text style={styles.buttonText}>Create account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allow scrolling
    backgroundColor: "#fff",
    padding: 24,
  },
  // Back button in the top-left
  backButton: {
    position: "absolute",  // Absolute positioning
    top: 40,               // Margin from the top
    left: 20,              // Margin from the left edge
    padding: 8,
  },
  // Form container that centers everything
  formContainer: {
    flex: 1,               // Allow the form to fill available space
    justifyContent: "center",  // Vertically center the form
    alignItems: "center",     // Horizontally center the form
    marginTop: 80,          // Give space from the top (after the Back button)
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",  // Ensures title is centered
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    width: "100%",  // Ensures inputs take up full width
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  showHide: { marginLeft: 8, color: "#007AFF", fontWeight: "600" },
  switchRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  switchLabel: { marginLeft: 10 },
  button: {
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",  // Button takes up the full width
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
