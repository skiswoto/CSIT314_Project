import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styled } from 'styled-components/native';
import ModalTemplate from './modalTemplate';

const SignUp: React.FC = () => {
    const router = useRouter();

    const handleCSRRepSignUp = () => {
        router.navigate('/(user-auth)/CreateCsrRepPage')
    };

    const handlePINSignUp = () => {
        router.navigate('/(user-auth)/CreatePinPage')
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
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Choose your account type</Text>
            <TouchableOpacity 
                style={styles.accountButton} 
                onPress={handleCSRRepSignUp}
            >
                <Text style={styles.buttonText}>&quot;I am a Volunteer Rep ...&quot;</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.accountButton}
                onPress={handlePINSignUp}
            >
                <Text style={styles.buttonText}>&quot;I am looking for some help ...&quot;</Text>
            </TouchableOpacity>
            <View style={styles.bottomLinks}>
                <Text style={styles.accountText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/(user-auth)/loginForm')}>
                    <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
            </View>
        </ModalTemplate>
    )
};

export const TopBar = styled.Pressable`
    flex-direction: row;
    justify-content: flex-start;
    margin-bottom: 40px;
    width: 10%;
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
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 38,
        textAlign: 'center',
    },
    accountButton: {
        backgroundColor: '#2B61A6',
        borderRadius: 10,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 12,
        width: "96%",
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
    },
    bottomLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    accountText: {
        color: '#6B7280',
        fontSize: 14,
    },
    linkText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginLeft: 4
    },
});

export default SignUp;