import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SignUp: React.FC = () => {
    const router = useRouter();

    const handleCSRRepSignUp = () => {
        console.log('Sign Up as a CSR Rep');
    };

    const handlePINSignUp = () => {
        console.log('Sign Up as a PIN');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ marginLeft: 4}}
                        >
                            <ChevronLeft size={28} color="#1F2937" fill="#F0F4FF" />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: '#F0F4FF',
                    },
                    headerShadowVisible: false,
                }}
        />
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Sign Up</Text>
                <Text style={styles.subtitle}>Choose your account type</Text>

                <TouchableOpacity 
                style={styles.accountButton} 
                onPress={handleCSRRepSignUp}>
                    <Text style={styles.buttonText}>Create CSR Rep Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.accountButton}
                onPress={handlePINSignUp}>
                    <Text style={styles.buttonText}>Create PIN Account</Text>
                </TouchableOpacity>

                <View style={styles.bottomLinks}>
                    <Text style={styles.accountText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.linkText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        </>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  accountButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#828282ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  accountText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignUp;