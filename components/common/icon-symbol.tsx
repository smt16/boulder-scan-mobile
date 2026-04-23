import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleSheet } from 'react-native';

type IconSymbolProps = {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  weight?: SymbolWeight;
};

export function IconSymbol({ name, size = 24, color, weight = 'regular' }: IconSymbolProps) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode='scaleAspectFit'
      name={name}
      style={[styles.icon, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    overflow: 'hidden',
  },
});
