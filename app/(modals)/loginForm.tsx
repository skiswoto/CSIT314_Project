import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login with:', username, password);
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
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
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
            
            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(modals)/signUp')}>
              <Text style={styles.linkText}>Sign Up</Text>
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#353535ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  linkButton: {
    padding: 4,
  },
  linkText: {
    color: '#000',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginForm;