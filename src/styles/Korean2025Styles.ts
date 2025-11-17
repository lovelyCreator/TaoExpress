import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants';

// Korean 2025 Common Styles
export const Korean2025Styles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.korean.gentleBeige,
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  
  // Headers
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xl + 15,
    paddingBottom: SPACING.xl + 10,
  },
  
  headerTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.korean.charcoal,
    letterSpacing: 0.3,
  },
  
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.korean.warmGray,
    marginTop: SPACING.xs,
  },
  
  // Cards
  card: {
    backgroundColor: COLORS.korean.softWhite,
    borderRadius: 28,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.korean.softPink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: COLORS.korean.softPink + '20',
  },
  
  smallCard: {
    backgroundColor: COLORS.korean.softWhite,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.korean.babyBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.korean.babyBlue + '15',
  },
  
  // Buttons
  primaryButton: {
    borderRadius: 25,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.korean.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  secondaryButton: {
    borderRadius: 25,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.korean.softWhite,
    borderWidth: 2,
    borderColor: COLORS.korean.softPink,
  },
  
  // Text Styles
  primaryText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.korean.charcoal,
  },
  
  secondaryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.korean.warmGray,
    lineHeight: 20,
  },
  
  accentText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.korean.coral,
  },
  
  // Icons
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Lists
  listContainer: {
    paddingVertical: SPACING.md,
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.korean.softWhite,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.korean.mintGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Input Fields
  inputContainer: {
    backgroundColor: COLORS.korean.softWhite,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.korean.softPink + '30',
    marginBottom: SPACING.md,
  },
  
  inputFocused: {
    borderColor: COLORS.korean.coral,
    shadowColor: COLORS.korean.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.korean.charcoal,
  },
  
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.korean.warmGray,
    marginTop: 2,
  },
});

// Korean 2025 Color Combinations for different elements
export const Korean2025ColorCombos = {
  // For product cards
  productCard: {
    background: COLORS.korean.softWhite,
    shadow: COLORS.korean.softPink,
    border: COLORS.korean.softPink + '20',
  },
  
  // For category cards
  categoryCard: {
    background: COLORS.korean.softWhite,
    shadow: COLORS.korean.babyBlue,
    border: COLORS.korean.babyBlue + '15',
  },
  
  // For cart items
  cartItem: {
    background: COLORS.korean.softWhite,
    shadow: COLORS.korean.mintGreen,
    border: COLORS.korean.mintGreen + '15',
  },
  
  // For buttons
  primaryButton: {
    gradient: COLORS.gradients.coral,
    shadow: COLORS.korean.coral,
  },
  
  secondaryButton: {
    gradient: COLORS.gradients.sage,
    shadow: COLORS.korean.sage,
  }