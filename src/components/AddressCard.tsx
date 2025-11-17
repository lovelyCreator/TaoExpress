import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  style?: object;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.name}>{address.name}</Text>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.addressText}>
        {`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`}
      </Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(address)}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(address.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
        
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetDefault(address.id)}
          >
            <Ionicons name="star-outline" size={20} color={COLORS.warning} />
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  defaultText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  phoneText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
});

export default AddressCard;