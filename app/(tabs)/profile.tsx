import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useKakaoAuth } from '@/hooks/useKakaoAuth';

export default function ProfileScreen() {
  const { user, isLoading, canSignIn, signIn, signOut } = useKakaoAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>

      {isLoading ? (
        <Text>불러오는 중...</Text>
      ) : user ? (
        <>
          <Text style={styles.nickname}>{user.nickname ?? '카카오 사용자'}님 환영합니다</Text>
          <Pressable style={styles.button} onPress={signOut}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </Pressable>
        </>
      ) : (
        <Pressable style={styles.button} disabled={!canSignIn} onPress={signIn}>
          <Text style={styles.buttonText}>카카오로 로그인</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nickname: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});
