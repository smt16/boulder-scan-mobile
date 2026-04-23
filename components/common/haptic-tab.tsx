import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

interface HapticTabProps {
  children: React.ReactNode;
}

export function HapticTab({ children }: HapticTabProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable onPress={handlePress}>
      {children}
    </Pressable>
  );
}
