import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface PlatformMenuProps {
  platforms: string[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  getLabel: (platform: string) => string;
  textColor?: string;
  iconColor?: string;
}

const PlatformMenu: React.FC<PlatformMenuProps> = ({
  platforms,
  selectedPlatform,
  onSelectPlatform,
  getLabel,
  textColor = COLORS.text.primary,
  iconColor = COLORS.text.primary,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  const handleButtonPress = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setButtonLayout({ x: pageX, y: pageY, width, height });
      setShowMenu(true);
    });
  };

  return (
    <View style={styles.container} ref={buttonRef}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleButtonPress}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          {getLabel(selectedPlatform)}
        </Text>
        <Ionicons name="chevron-down" size={18} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View 
            style={[
              styles.menuContainer,
              {
                position: 'absolute',
                top: buttonLayout.y + buttonLayout.height + 8,
                left: buttonLayout.x,
              }
            ]}
          >
            <View style={styles.menu}>
              {platforms.map((platform, index) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.menuItem,
                    selectedPlatform === platform && styles.menuItemActive,
                    index === 0 && styles.menuItemFirst,
                    index === platforms.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => {
                    onSelectPlatform(platform);
                    setShowMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      selectedPlatform === platform && styles.menuItemTextActive,
                    ]}
                  >
                    {getLabel(platform)}
                  </Text>
                  {selectedPlatform === platform && (
                    <Ionicons name="checkmark" size={20} color={COLORS.accentPink} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
  },
  buttonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    alignItems: 'flex-start',
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    minWidth: 150,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemFirst: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  menuItemActive: {
    backgroundColor: COLORS.gray[50],
  },
  menuItemText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  menuItemTextActive: {
    fontWeight: '600',
    color: COLORS.accentPink,
  },
});

export default PlatformMenu;
