import { supabase } from '@/libs/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Input, InputContainer, InputTitle, RevealContainer } from './CreateCsrRepPage';
import ModalTemplate from './modalTemplate';
import { TopBar } from "./signUp";


export default function CreatePinPage({ setScreen }: any) {
    const [terms, setTerms] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const [shareLoc, setShareLoc] = useState(false);
    const [sms, setSms] = useState(false);
    const router = useRouter()
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')

    const handleRevealPassword = () => {
        setHidePassword(!hidePassword)
    }

    const handlePINSignUp = async() => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name')
            return
        }
        if (!email.trim()) {
            Alert.alert('Validation Error', 'Please enter your email')
            return
        }
        if (!password.trim()) {
            Alert.alert('Validation Error', 'Please enter a password')
            return
        }
        if (password.length < 6) {
            Alert.alert('Validation Error', 'Password must be at least 6 characters long')
            return
        }
        if (password !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match')
            return
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name,
                        role: 'pin'
                    }
                }
            })
            if (error) {
                console.error('Signup error:', error)
                Alert.alert(
                    'Sign Up Failed', 
                    error.message || 'An error occurred during signup. Please try again.'
                )
                return
            }
            if (data) {
                registrationSuccessful()
                router.navigate('/(user-auth)/loginForm')
            }
        } catch (error) {
            console.error('Unexpected error:', error)
            Alert.alert(
                'Sign Up Failed', 
                'An unexpected error occurred. Please try again.'
            )
        }
    }

    const registrationSuccessful = () => {
        Alert.alert(
            'Sign Up Succesful',
            'Welcome! Your PIN account has been created successfully.',
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
                <Text style={styles.title}>Create PIN account</Text>
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
                <Input 
                    placeholder="Re-enter password" 
                    placeholderTextColor="#BABABA" 
                    autoCapitalize='none'
                    onChangeText={(text: string) => setConfirmPassword(text)}
                />
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </InputContainer>


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
            <Pressable style={[styles.button, !terms && { opacity: 0.5 }]} disabled={!terms} onPress={handlePINSignUp}>
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




