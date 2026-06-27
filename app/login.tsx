import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/ui/Themed';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { canSignIn, signIn } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>easy-trip-gn</Text>
      <Text style={styles.subtitle}>강릉 무장애 여행 정보를 시작해보세요</Text>
      <Pressable style={styles.button} disabled={!canSignIn} onPress={signIn}>
        <Text style={styles.buttonText}>카카오로 로그인</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});
