import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

const tabs = [
  { label: 'Chats', icon: '▤' },
  { label: 'Calls', icon: '◔' },
  { label: 'People', icon: '♙' },
  { label: 'Settings', icon: '⚙' },
];

type BottomTabBarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  bottomInset: number;
};

export function BottomTabBar({ activeTab, onTabChange, bottomInset }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { height: 66 + bottomInset, paddingBottom: Math.max(8, bottomInset) }]}>
      {tabs.map((tab) => {
        const selected = activeTab === tab.label;
        return (
          <Pressable
            key={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onTabChange(tab.label)}
            style={styles.item}
          >
            <View style={styles.iconWrap}>
              <Text style={[styles.icon, selected && styles.iconActive]}>{tab.icon}</Text>
              {tab.label === 'Chats' && <View style={styles.notificationDot} />}
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: '#EFEFEB', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 14 },
  item: { width: 68, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconWrap: { height: 25, minWidth: 26, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#A9AAA4', fontSize: 20, lineHeight: 24 },
  iconActive: { color: '#547561' },
  notificationDot: { position: 'absolute', top: 1, right: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral },
  label: { color: '#A6A8A1', fontSize: 9, fontWeight: '500' },
  labelActive: { color: '#3D5946', fontWeight: '700' },
});
