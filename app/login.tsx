import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/ui/Themed';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { canSignIn, signIn } = useAuthStore();

  return (
    <View style={styles.container}>
      <RNView style={styles.hero}>
        <RNView style={styles.iconCircle}>
          <SymbolView
            name={{ ios: 'figure.roll', android: 'accessible', web: 'accessible' }}
            tintColor="#2f95dc"
            size={48}
          />
        </RNView>
        <Text style={styles.title}>easy-trip-gn</Text>
        <Text style={styles.subtitle}>강릉 무장애 여행 정보를 시작해보세요</Text>
      </RNView>

      <RNView style={styles.footer}>
        <Pressable style={styles.button} disabled={!canSignIn} onPress={signIn}>
          <Text style={styles.buttonIcon}>💬</Text>
          <Text style={styles.buttonText}>카카오로 로그인</Text>
        </Pressable>
        {!canSignIn && (
          <Text style={styles.hint}>카카오 로그인 설정이 필요합니다</Text>
        )}
        <Text style={styles.footerNote}>♿ 누구나 편하게 떠나는 강릉 여행</Text>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,149,220,0.12)',
    marginBottom: 8,
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
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    color: '#e0524d',
  },
  footerNote: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
});
