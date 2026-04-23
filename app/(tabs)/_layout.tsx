import { HapticTab } from '@/components/common/haptic-tab';
import { IconSymbol } from '@/components/common/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: (props) => <HapticTab>{props.children}</HapticTab>,
      }}>
      <Tabs.Screen
        name='scan'
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='qrcode' color={color} />,
        }}
      />
      <Tabs.Screen
        name='coach'
        options={{
          title: 'Coach',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='magnifyingglass' color={color} />,
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'Gym',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='building' color={color} />,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name='person' color={color} />,
        }}
      />
    </Tabs>
  );
}
