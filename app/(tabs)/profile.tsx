import { StyleSheet, ScrollView, Text } from 'react-native';
import useProfile from '@/stores/profile.store';

export default function Profile() {
  const profile = useProfile((state) => state.profile)

  return (
    <ScrollView style={{ paddingTop: 100 }} >
      <Text>
        Username
      </Text>
    </ScrollView> 
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
