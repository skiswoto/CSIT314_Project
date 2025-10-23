import { supabase } from '@/libs/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { styled } from 'styled-components/native';
import ModalTemplate from './modalTemplate';
import { TopBar } from "./signUp";


export default function CreateCsrRepPage({ setScreen }: any) {
    const [terms, setTerms] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const router = useRouter()
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const handleRevealPassword = () => {
        setHidePassword(!hidePassword)
    }

    const handleCSRSignUp = async() => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name,
                    }
                }
            })
            if (error) throw error
            if (data) {
                registrationSuccessful()
                router.navigate('/(user-auth)/loginForm')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const registrationSuccessful = () => {
        Alert.alert(
            'Sign Up Succesful',
            'Welcome! Your account has been created successfully.',
            [
                {
                    text: 'Continue',
                    style: 'cancel',
                },
            ],
            { cancelable: true, },
        )
    }
    
    return (
        <ModalTemplate>
            <TopBar onPress={() => router.replace('/(tabs)/profile')}>
                <ArrowLeft size={30}/>
            </TopBar>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create CSR Rep account</Text>
            </View>
            <InputTitle>Name</InputTitle>
            <Input placeholder="Enter your full name" placeholderTextColor="#BABABA" value={name} onChangeText={(text: string) => setName(text)} />
            <InputTitle>Email</InputTitle>
            <Input placeholder="Enter your email" placeholderTextColor="#BABABA" keyboardType="email-address" value={email} onChangeText={(text: string) => setEmail(text)} autoCapitalize='none' />
            <InputTitle>Password</InputTitle>
            <InputContainer>
                <Input placeholder="Password" placeholderTextColor="#BABABA" value={password} onChangeText={(text: string) => setPassword(text)} autoCapitalize='none' />
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </InputContainer>
            <InputTitle>Re-enter password</InputTitle>
            <InputContainer>
                <Input placeholder="Re-enter password" placeholderTextColor="#BABABA" autoCapitalize='none'/>
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </InputContainer>
            <View style={styles.switchRow}>
                <Switch value={terms} onValueChange={setTerms} />
                <Text style={styles.switchLabel}>I accept the terms and conditions</Text>
            </View>
            <Pressable style={[styles.button, !terms && { opacity: 0.5 }]} disabled={!terms} onPress={handleCSRSignUp}>
                <Text style={styles.buttonText}>Create account</Text>
            </Pressable>
        </ModalTemplate>
    );
}

export const InputContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
`
export const InputTitle = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
`
export const Input = styled.TextInput`
    border-width: 1px;
    border-color: #ccc;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    margin-bottom: 16px;
    width: 100%;    
`
export const RevealContainer = styled.Pressable`
    position: absolute;
    right: 14px;
    top: 10px;
`

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
        marginTop: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 32,
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
        marginVertical: 16,
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
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
