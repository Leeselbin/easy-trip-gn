import { SymbolView } from 'expo-symbols';
import { Image, Pressable, ScrollView, StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/ui/Themed';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
  { key: 'favorites', label: '즐겨찾기', icon: { ios: 'star', android: 'star', web: 'star' } },
  { key: 'notice', label: '공지사항', icon: { ios: 'megaphone', android: 'campaign', web: 'campaign' } },
  { key: 'inquiry', label: '문의하기', icon: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' } },
  { key: 'about', label: '앱 정보', icon: { ios: 'info.circle', android: 'info', web: 'info' } },
] as const;

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RNView style={styles.profileHeader}>
        {user.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderIcon}>👤</Text>
          </View>
        )}
        <RNView style={styles.profileInfo}>
          <Text style={styles.nickname}>{user.nickname ?? '카카오 사용자'}</Text>
          <Text style={styles.userId}>회원번호 {user.id}</Text>
        </RNView>
      </RNView>

      <RNView style={styles.menuSection}>
        {MENU_ITEMS.map((item, index) => (
          <RNView
            key={item.key}
            style={[
              styles.menuRow,
              index === MENU_ITEMS.length - 1 && styles.menuRowLast,
            ]}
          >
            <SymbolView name={item.icon} tintColor="#999" size={20} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <RNView style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>준비중</Text>
            </RNView>
          </RNView>
        ))}
      </RNView>

      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileInfo: {
    gap: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(127,127,127,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 26,
    opacity: 0.5,
  },
  nickname: {
    fontSize: 17,
    fontWeight: '600',
  },
  userId: {
    fontSize: 13,
    opacity: 0.6,
  },
  menuSection: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127,127,127,0.12)',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    opacity: 0.5,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(127,127,127,0.15)',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.5,
  },
  button: {
    alignItems: 'center',
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
