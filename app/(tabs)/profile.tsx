import { Image, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>

      <View style={styles.card}>
        {user.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <Text style={styles.nickname}>{user.nickname ?? '카카오 사용자'}</Text>
        <Text style={styles.userId}>카카오 회원번호 {user.id}</Text>
      </View>

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>로그아웃</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(127,127,127,0.2)',
  },
  nickname: {
    fontSize: 18,
    fontWeight: '600',
  },
  userId: {
    fontSize: 13,
    opacity: 0.6,
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
