import { View, ScrollView, ViewStyle } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function ThemedScreen({
  children,
  scroll = false,
  style,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}) {
  const { styles } = useThemedStyles();
  if (scroll) {
    return (
      <ScrollView style={[styles.container, style]} contentContainerStyle={[styles.scroll, contentStyle]}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
}
