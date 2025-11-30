import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../hooks/useToast';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

const OrderInquiryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast, ToastComponent } = useToast();
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = 'Order number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast({ 
        message: 'Your inquiry has been submitted successfully. We will respond within 24 hours.', 
        type: 'success' 
      });
      
      // Reset form
      setFormData({
        orderNumber: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      showToast({ 
        message: 'Failed to submit inquiry. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {ToastComponent}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Inquiry</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            Have a question about your order? Fill out the form below and we'll get back to you as soon as possible.
          </Text>

          {/* Order Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Order Number *</Text>
            <RNTextInput
              style={[styles.input, errors.orderNumber && styles.inputError]}
              placeholder="Enter your order number"
              placeholderTextColor={COLORS.gray[400]}
              value={formData.orderNumber}
              onChangeText={(text) => {
                setFormData({ ...formData, orderNumber: text });
                if (errors.orderNumber) {
                  setErrors({ ...errors, orderNumber: '' });
                }
              }}
              autoCapitalize="characters"
            />
            {errors.orderNumber && (
              <Text style={styles.errorText}>{errors.orderNumber}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <RNTextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray[400]}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Subject */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject *</Text>
            <RNTextInput
              style={[styles.input, errors.subject && styles.inputError]}
              placeholder="What is your inquiry about?"
              placeholderTextColor={COLORS.gray[400]}
              value={formData.subject}
              onChangeText={(text) => {
                setFormData({ ...formData, subject: text });
                if (errors.subject) {
                  setErrors({ ...errors, subject: '' });
                }
              }}
            />
            {errors.subject && (
              <Text style={styles.errorText}>{errors.subject}</Text>
            )}
          </View>

          {/* Message */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message *</Text>
            <RNTextInput
              style={[styles.textArea, errors.message && styles.inputError]}
              placeholder="Please describe your inquiry in detail..."
              placeholderTextColor={COLORS.gray[400]}
              value={formData.message}
              onChangeText={(text) => {
                setFormData({ ...formData, message: text });
                if (errors.message) {
                  setErrors({ ...errors, message: '' });
                }
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !formData.orderNumber || !formData.email || !formData.subject || !formData.message) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !formData.orderNumber || !formData.email || !formData.subject || !formData.message}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Text>
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.helpText}>
              We typically respond to inquiries within 24 hours during business days.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes['xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl']
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 120,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.accentPinkLight,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  helpText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default OrderInquiryScreen;
