import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Input, RevealContainer } from './CreateCsrRepPage';
import ModalTemplate from './modalTemplate';
import { TopBar } from "./signUp";


export default function CreatePinPage({ setScreen }: any) {
    const [terms, setTerms] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const [shareLoc, setShareLoc] = useState(false);
    const [sms, setSms] = useState(false);
    const router = useRouter()

    const handleRevealPassword = () => {
        setHidePassword(!hidePassword)
    }
    return (
        <ModalTemplate>
            <TopBar onPress={() => router.back()}>
                <ArrowLeft size={30}/>
            </TopBar>

            <View style={styles.formContainer}>
                <Text style={styles.title}>Create PIN account</Text>
            </View>
            <Text style={styles.label}>Username</Text>
            <TextInput placeholder="Username" placeholderTextColor="#BABABA" style={styles.input} />
            <Text style={styles.label}>Email</Text>
            <TextInput placeholder="Email" placeholderTextColor="#BABABA" keyboardType="email-address" style={styles.input} />

            <Text style={styles.label}>Password</Text>
            <Input>
                <TextInput placeholder="Password" placeholderTextColor="#BABABA" keyboardType="default" style={styles.input} />
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </Input>
            <Text style={styles.label}>Re-enter password</Text>
            <Input>
                <TextInput placeholder="Re-enter password" placeholderTextColor="#BABABA" keyboardType="default" style={styles.input} />
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </Input>
            <View style={{ marginTop: 14}} />
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
        </ModalTemplate>
    );
}

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        padding: 24,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        padding: 8,
    },
    formContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        width: "100%",    
    },
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    showHide: {
        marginLeft: 8,
            color: "#007AFF",
            fontWeight: "600",
        },
        switchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    switchLabel: {
        marginLeft: 10,
    },
    button: {
        backgroundColor: "#2B61A6",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
});




