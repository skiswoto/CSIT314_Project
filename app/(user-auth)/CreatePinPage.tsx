import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

export default function CreatePinPage({ setScreen }) {
  const [terms, setTerms] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [shareLoc, setShareLoc] = useState(false);
  const [sms, setSms] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => setScreen("main")} style={styles.backButton}>
        <Text style={{ color: "blue" }}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Create PIN account</Text>

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
        <Switch value={shareLoc} onValueChange={setShareLoc} />
        <Text style={styles.switchLabel}>Share location for faster matching</Text>
      </View>

      <View style={styles.switchRow}>
        <Switch value={sms} onValueChange={setSms} />
        <Text style={styles.switchLabel}>Receive SMS updates</Text>
      </View>

      <View style={styles.switchRow}>
        <Switch value={terms} onValueChange={setTerms} />
        <Text style={styles.switchLabel}>I accept the terms and conditions</Text>
      </View>

      <Pressable style={[styles.button, !terms && { opacity: 0.5 }]} disabled={!terms}>
        <Text style={styles.buttonText}>Create account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Center content
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  backButton: {
    marginBottom: 20,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
