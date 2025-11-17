import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface FilterOption {
  label: string;
  value: string;
  selectedCount?: number;
  showCheck?: boolean; // New prop to control check icon visibility
  selectedText?: string; // New prop to show selected items text
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filterOptions: FilterOption[];
  onFilterOptionPress: (value: string) => void;
  title?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  filterOptions,
  onFilterOptionPress,
  title = 'Filter',
}) => {
  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.stickbarContainer}>
            <View style={styles.stickbar} />
          </View>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <ScrollView style={styles.filterOptions}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.filterOption}
                    onPress={() => onFilterOptionPress(option.value)}
                  >
                    {option.showCheck ? (
                      <Ionicons name="checkmark" size={18} color={COLORS.gray[400]} />
                    ) : (
                      <View style={styles.unselectedIcon} />
                    )}
                    <View style={styles.filterOptionTextContainer}>
                      <Text style={styles.filterOptionText}>{option.label}</Text>
                      {option.selectedText ? (
                        <Text style={styles.filterOptionItemText}>
                          {option.selectedText}
                        </Text>
                      ) : option.selectedCount !== undefined ? (
                        <Text style={styles.filterOptionItemText}>
                          {option.selectedCount > 0 ? `(${option.selectedCount})` : ''}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                  <Text style={styles.clearButtonText}>Clear filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Sub-filter modal components
interface SubFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  title: string;
  children: React.ReactNode;
}

export const SubFilterModal: React.FC<SubFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  title,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.stickbarContainer}>
            <View style={styles.stickbar} />
          </View>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              {children}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                  <Text style={styles.clearButtonText}>Clear filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={() => { onApply(); onClose(); }}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
}) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={24} color={COLORS.text.primary} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[400]}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

interface FilterItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const FilterItem: React.FC<FilterItemProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.filterItem} onPress={onPress}>
      {selected ? (
        <Ionicons name="checkmark" size={18} color={COLORS.gray[400]} />
      ) : (
        <View style={styles.unselectedIcon} />
      )}
      <Text style={styles.filterItemText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  stickbarContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  filterOptions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  filterOptionTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  filterOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  filterOptionItemText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.smmd,
    gap: SPACING.md,
  },
  unselectedIcon: {
    width: 18,
  },
  filterItemText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
});

export default FilterModal;