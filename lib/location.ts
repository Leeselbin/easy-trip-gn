import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

export async function ensureLocationPermission(): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return true;
  }

  if (!current.canAskAgain) {
    Alert.alert('위치 권한이 필요해요', '설정에서 위치 권한을 허용해주세요.', [
      { text: '취소', style: 'cancel' },
      { text: '설정으로 이동', onPress: () => Linking.openSettings() },
    ]);
    return false;
  }

  const requested = await Location.requestForegroundPermissionsAsync();
  return requested.granted;
}
