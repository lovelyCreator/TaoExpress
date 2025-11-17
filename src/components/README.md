# Reusable Components

This directory contains all the reusable UI components for the Glowmify marketplace application. These components are designed to be modular, consistent, and easily maintainable.

## Component Categories

### 1. Layout & Structure
- **Header**: Consistent header with back button, title, and action icons
- **TabBar**: Category tabs with animated indicators
- **SectionTitle**: Consistent section titles throughout the app

### 2. Product Components
- **ProductCard**: Standard product display with image, name, price, and ratings
- **ProductPreviewRow**: Horizontal product preview row
- **ProductImageGallery**: Image gallery with pagination for product details
- **PriceDisplay**: Shows original and discounted prices with consistent styling
- **VariantSelector**: Size and color selection component
- **YouMayLike**: "You May Like" product recommendations section

### 3. Store Components
- **StoreCard**: Store information display card
- **StoreProfile**: Detailed store profile component
- **SellerInfo**: Seller information section

### 4. User Interaction
- **Button**: Primary and secondary button styles
- **ActionButton**: Consistent action button styling
- **IconButton**: Icon-only button component
- **Checkbox**: Item selection checkbox
- **QuantitySelector**: Increment/decrement quantity selector
- **QuantitySelectorModal**: Modal version of quantity selector
- **SearchInput**: Standardized search input field
- **FormInput**: Form input with icons and validation

### 5. Modals & Overlays
- **SortModal**: Consistent sorting functionality
- **FilterModal**: Comprehensive filtering with nested modals
- **ShareModal**: Share functionality modal
- **EmptyState**: Consistent empty state views
- **LoadingSpinner**: Standard loading indicator

### 6. Lists & Cards
- **OrderItem**: Individual order item display with all relevant details
- **OrderStatusCard**: Order status display with color coding
- **StatCard**: Numerical statistics display
- **ActivityItem**: Menu items with icons
- **NotificationItem**: Notification list items
- **AddressCard**: Address information card
- **ChatMessage**: Chat message bubbles

### 7. Forms & Inputs
- **CategoryCard**: Category display cards
- **QuickCategoryCard**: Smaller category cards
- **CategorySelector**: Category selection component
- **ImageUpload**: Product image upload component
- **RatingDisplay**: Star rating display
- **ReviewsBlock**: Product reviews section
- **SummaryRow**: Order summary rows
- **NotificationBadge**: Notification indicator badges

## Usage

To use any of these components, simply import them from the components directory:

```javascript
import { ProductCard, Header, Button } from '../components';
```

## Design System

All components follow the Glowmify design system with consistent:
- Colors (defined in `constants/COLORS.ts`)
- Typography (defined in `constants/FONTS.ts`)
- Spacing (defined in `constants/SPACING.ts`)
- Border radii (defined in `constants/BORDER_RADIUS.ts`)
- Shadows (defined in `constants/SHADOWS.ts`)

## Contributing

When adding new components:
1. Ensure they follow the existing design system
2. Make them customizable through props
3. Add them to the index.ts export file
4. Update this README with the new component

## Benefits

1. **Consistency**: All components follow the same design language and styling conventions
2. **Maintainability**: Changes to UI elements only need to be made in one place
3. **Reusability**: Components can be used across multiple screens and features
4. **Performance**: Reduced code duplication leads to smaller bundle sizes
5. **Developer Experience**: Standardized components make development faster and easier

## Usage Guidelines

1. Import components from the index file: `import { Header, ProductCard } from '../components';`
2. Always use the provided props for customization rather than wrapping components
3. If a component doesn't meet your needs, consider extending it rather than creating a new one
4. Update this README when adding new components
