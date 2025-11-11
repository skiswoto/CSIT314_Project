import { supabase } from '@/libs/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from "react-native";
import { Input, InputContainer, InputTitle, RevealContainer } from './CreateCsrRepPage';
import { styles } from './CreatePinPage';
import ModalTemplate from './modalTemplate';
import { TopBar } from "./signUp";


export default function CreateUAForm () {
    const [hidePassword, setHidePassword] = useState(true);
    const router = useRouter()
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')

    const handleRevealPassword = () => {
        setHidePassword(!hidePassword)
    }

    const handleUASignUp = async() => {
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
                        role: 'user_admin'
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
            'Welcome! Your UA account has been created successfully.',
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
                <Text style={styles.title}>Create UA account</Text>
            </View>
            <InputTitle>Name</InputTitle>
            <Input placeholder="Enter your full name" placeholderTextColor="#BABABA" value={name} onChangeText={(text: string) => setName(text)} />
            <InputTitle>Email</InputTitle>
            <Input placeholder="Enter your email" placeholderTextColor="#BABABA" keyboardType="email-address" value={email} onChangeText={(text: string) => setEmail(text)} autoCapitalize='none' />
            <InputTitle>Password</InputTitle>
            <InputContainer>
                <Input 
                    placeholder="Password" 
                    placeholderTextColor="#BABABA" 
                    autoCapitalize='none'
                    onChangeText={(text: string) => setPassword(text)}
                    secureTextEntry={hidePassword}
                />
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
                    secureTextEntry={hidePassword}
                />
                <RevealContainer onPress={handleRevealPassword}>
                    {!hidePassword ? <Eye /> : <EyeOff />}
                </RevealContainer>
            </InputContainer>

            <Pressable style={styles.button} onPress={handleUASignUp}>
                <Text style={styles.buttonText}>Create account</Text>
            </Pressable>
        </ModalTemplate>
    );
}



