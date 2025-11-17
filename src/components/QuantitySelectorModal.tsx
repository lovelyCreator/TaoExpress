import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface QuantitySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (quantity: number) => void;
  currentQuantity: number;
  maxQuantity?: number;
}

const QuantitySelectorModal: React.FC<QuantitySelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentQuantity,
  maxQuantity = 10,
}) => {
  const quantities = Array.from({ length: maxQuantity }, (_, i) => i + 1);

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
            <View style={styles.stickbar} />
          </View>
          <View style={styles.sheet}>
            <Text style={styles.title}>Quantity</Text>
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {quantities.map((quantity) => (
                <TouchableOpacity 
                  key={quantity} 
                  style={currentQuantity === quantity ? styles.rowActive : styles.row}
                  onPress={() => {
                    onSelect(quantity);
                    onClose();
                  }}
                >
                  <Text style={currentQuantity === quantity ? styles.valueActive : styles.value}>
                    {quantity}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  list: {
    paddingVertical: SPACING.sm,
  },
  row: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rowActive: {
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[400],
  },
  valueActive: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  applyBtn: {
    marginTop: SPACING.md,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
});

export default QuantitySelectorModal;