import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const ModalLayout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="testModal" />

      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 12 }}
            >
              <ChevronLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="signUp"
        options={{
          title: 'Sign Up',
            headerShown: false,
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginLeft: 12 }}
                >
                    <ChevronLeft size={24} color="#1F2937" />
                </TouchableOpacity>
            ),
        }}
      />

    </Stack>
  );
};

export default ModalLayout;
