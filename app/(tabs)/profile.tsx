import CreateCsrRepPage from "../(user-auth)/CreateCsrRepPage"; // Correct import based on new file/component name
import CreatePinPage from "../(user-auth)/CreatePinPage"; // Same for CreatePinPage
import { Link, useRouter } from 'expo-router'
import { StatusBar, Text } from 'react-native'
import { SafeAreaView, } from 'react-native-safe-area-context'
SafeAreaView

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Profile = () => {
  const [screen, setScreen] = useState<"main" | "csr" | "pin">("main");
    const router = useRouter()
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <Text>profile</Text>
                <Link href="/(modals)/loginForm" asChild>
                    <Text style={{color: 'blue'}}>Go to Login</Text>
                </Link>
            </SafeAreaView>
            
        </>
    )
}

  if (screen === "csr") return <CreateCsrRepPage setScreen={setScreen} />;
  if (screen === "pin") return <CreatePinPage setScreen={setScreen} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Pressable style={styles.button} onPress={() => setScreen("csr")}>
        <Text style={styles.buttonText}>Create CSR Rep Account</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => setScreen("pin")}>
        <Text style={styles.buttonText}>Create PIN Account</Text>
      </Pressable>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
