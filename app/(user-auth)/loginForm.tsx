import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styled } from 'styled-components/native';
import ModalTemplate from './modalTemplate';
import { TopBar } from './signUp';

const LoginForm: React.FC = () => {
    const router = useRouter();

    const handleLogin = () => {
        console.log('Login attempt');
    };

    return (
        <ModalTemplate>
            <TopBar onPress={() => router.replace('/(tabs)/profile')}>
                <X size={30} />
            </TopBar>
            <Image
                style={styles.image}
                resizeMode='contain'
                source={require('../../assets/samples/signUp.png')} 
            />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to your account</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter your username"
                autoCapitalize="none"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                />
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <View style={styles.bottomLinks}>
                <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.linkButton} onPress={() => router.navigate('/(user-auth)/signUp')}>
                    <SignUpLinkRow>
                        <Text>Don&apos;t have an account?</Text>
                        <Text style={styles.linkText}>Sign Up</Text>
                    </SignUpLinkRow>
                </TouchableOpacity>
            </View>
        </ModalTemplate>
    );
};

const SignUpLinkRow = styled.View`
    flex-direction: row;
`

const styles = StyleSheet.create({
    image: {
        width: '60%',
        height: 130,
        alignSelf: 'center',
        marginBottom: 14
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6d6f72ff',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    loginButton: {
        backgroundColor: '#2B61A6',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomLinks: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 4,
    },
    linkButton: {
        padding: 4,
    },
    linkText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 500,
        textDecorationLine: 'underline',
        marginLeft: 4
    },
});

export default LoginForm;