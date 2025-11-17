import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';

import { COLORS, FONTS, SPACING } from '../constants';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
  style?: object;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  style,
}) => {
  const tabLayouts = useRef<{ x: number; width: number }[]>([]).current;
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryContainerWidthRef = useRef(0);
  const categoryContentWidthRef = useRef(0);

  const handleTabPress = (tabId: string, index: number) => {
    onTabPress(tabId);
    
    const layout = tabLayouts[index];
    if (layout) {
      Animated.parallel([
        Animated.timing(indicatorX, {
          toValue: layout.x,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(indicatorW, {
          toValue: layout.width,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
      
      const containerW = categoryContainerWidthRef.current || 0;
      const contentW = categoryContentWidthRef.current || 0;
      const halfGap = Math.max(0, (containerW - layout.width) / 2);
      let targetX = layout.x - halfGap;
      const maxX = Math.max(0, contentW - containerW);
      if (targetX < 0) targetX = 0;
      if (targetX > maxX) targetX = maxX;
      categoryScrollRef.current?.scrollTo({ x: targetX, animated: true });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={styles.tabsWrapper}
        onLayout={(e) => {
          categoryContainerWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <Animated.ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onContentSizeChange={(contentWidth) => {
            categoryContentWidthRef.current = contentWidth;
          }}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                tabLayouts[index] = { x, width };
                if (tab.id === activeTabId) {
                  indicatorX.setValue(x);
                  indicatorW.setValue(width);
                }
              }}
              onPress={() => handleTabPress(tab.id, index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTabId === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
        <View style={styles.baseline} />
        <Animated.View
          style={[
            styles.indicator,
            {
              left: Animated.subtract(indicatorX, scrollX),
              width: indicatorW,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.sm,
  },
  tabsWrapper: {
    position: 'relative',
  },
  tabs: {},
  tab: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    marginRight: SPACING.lg,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    fontWeight: '400',
  },
  activeTabText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.text.primary,
    borderRadius: 2,
  },
});

export default TabBar;