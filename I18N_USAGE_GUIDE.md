# Internationalization (i18n) Usage Guide

This guide explains how to use the internationalization system in the TaoExpress app, which supports English, Korean, and Chinese languages.

## Overview

The app now has comprehensive i18n support with:
- **Language Selection**: Users can switch between English (en), Korean (ko), and Chinese (zh)
- **Translated UI**: All interface text is translated
- **Localized Mock Data**: Product names, descriptions, categories, and other content support multiple languages
- **Currency Formatting**: Prices display in appropriate currency format for each locale
- **Number Formatting**: Numbers format according to locale conventions

## Language Selection

Users can change the app language by:
1. Going to Profile screen
2. Tapping "Language" (언어/语言) menu item
3. Selecting their preferred language from the Language Settings screen

The language change takes effect immediately throughout the app.

## Using Translations in Components

### Basic Translation Function

```typescript
import { useAppSelector } from '../store/hooks';
import { translations } from '../i18n/translations';

const MyComponent = () => {
  const locale = useAppSelector((state) => state.i18n.locale);
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <Text>{t('profile.myPage')}</Text> // Shows: "My Page" / "마이 페이지" / "我的页面"
  );
};
```

### Using Helper Functions

```typescript
import { createTranslationFunction, formatCurrency } from '../utils/i18nHelpers';

const MyComponent = () => {
  const locale = useAppSelector((state) => state.i18n.locale);
  const t = createTranslationFunction(locale);

  return (
    <View>
      <Text>{t('profile.deposit')}</Text>
      <Text>{formatCurrency(100, locale)}</Text> // Shows: $100 / ₩100 / ¥100
    </View>
  );
};
```

## Working with Localized Mock Data

### Products

```typescript
import { mockProductsI18n, getLocalizedProducts } from '../data/mockProductsI18n';

const ProductList = () => {
  const locale = useAppSelector((state) => state.i18n.locale);
  
  // Get localized products for current language
  const products = getLocalizedProducts('newIn', locale);
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text> // Already localized
          <Text>{item.description}</Text> // Already localized
        </View>
      )}
    />
  );
};
```

### Categories/Companies

```typescript
import { mockCompaniesI18n, getLocalizedCompanies } from '../data/mockCompaniesI18n';

const CategoryList = () => {
  const locale = useAppSelector((state) => state.i18n.locale);
  
  const companies = getLocalizedCompanies(locale);
  
  return (
    <FlatList
      data={companies}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          {item.categories.map(category => (
            <Text key={category.id}>{category.name}</Text> // Already localized
          ))}
        </View>
      )}
    />
  );
};
```

## Available Translation Keys

### Profile Section
- `profile.myPage` - "My Page" / "마이 페이지" / "我的页面"
- `profile.language` - "Language" / "언어" / "语言"
- `profile.deposit` - "Deposit" / "예치금" / "押金"
- `profile.point` - "Point" / "포인트" / "积分"
- `profile.wishList` - "WishList" / "위시리스트" / "愿望清单"
- `profile.coupon` - "Coupon" / "쿠폰" / "优惠券"
- `profile.logout` - "Logout" / "로그아웃" / "退出登录"

### Authentication
- `auth.login` - "Login" / "로그인" / "登录"
- `auth.signup` - "Sign Up" / "회원가입" / "注册"
- `auth.email` - "Email" / "이메일" / "邮箱"
- `auth.password` - "Password" / "비밀번호" / "密码"

### Help Center
- `helpCenter.title` - "Help Center" / "고객센터" / "帮助中心"
- `helpCenter.faq` - "FAQ" / "자주 묻는 질문" / "常见问题"
- `helpCenter.faqItems.purchaseRelated` - "Purchase Related" / "구매관련" / "购买相关"
- `helpCenter.faqItems.timeRelated` - "Time Related" / "시간관련" / "时间相关"
- `helpCenter.faqItems.shippingRelated` - "Shipping Related" / "배송관련" / "配送相关"
- `helpCenter.faqItems.paymentRelated` - "Payment Related" / "결제관련" / "支付相关"

## Adding New Translations

### 1. Add to translations.ts

```typescript
// In src/i18n/translations.ts
export const translations = {
  en: {
    // ... existing translations
    newSection: {
      newKey: 'English Text',
    },
  },
  ko: {
    // ... existing translations
    newSection: {
      newKey: '한국어 텍스트',
    },
  },
  zh: {
    // ... existing translations
    newSection: {
      newKey: '中文文本',
    },
  },
};
```

### 2. Use in Components

```typescript
const text = t('newSection.newKey');
```

## Adding Localized Mock Data

### 1. For Products

```typescript
// In src/data/mockProductsI18n.ts
{
  id: "new_product",
  name: {
    en: "English Product Name",
    ko: "한국어 제품명",
    zh: "中文产品名"
  },
  description: {
    en: "English description",
    ko: "한국어 설명",
    zh: "中文描述"
  },
  // ... other fields
}
```

### 2. For Categories

```typescript
// In src/data/mockCompaniesI18n.ts
{
  id: "category_id",
  name: {
    en: "English Category",
    ko: "한국어 카테고리",
    zh: "中文分类"
  }
}
```

## Best Practices

1. **Always use translation keys**: Never hardcode text strings in components
2. **Provide fallbacks**: Use `|| key` to show the key if translation is missing
3. **Keep keys organized**: Use nested objects to group related translations
4. **Test all languages**: Verify text displays correctly in all supported languages
5. **Consider text length**: Some languages may be longer/shorter than others
6. **Use semantic keys**: Make translation keys descriptive of their purpose

## Currency and Number Formatting

```typescript
import { formatCurrency, formatNumber } from '../utils/i18nHelpers';

// Currency formatting
formatCurrency(99.99, 'en'); // "$99.99"
formatCurrency(99.99, 'ko'); // "₩99.99"
formatCurrency(99.99, 'zh'); // "¥99.99"

// Number formatting
formatNumber(1234567, 'en'); // "1,234,567"
formatNumber(1234567, 'ko'); // "1,234,567"
formatNumber(1234567, 'zh'); // "1,234,567"
```

## Example: Complete Localized Component

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { createTranslationFunction, formatCurrency } from '../utils/i18nHelpers';
import { getLocalizedProducts } from '../data/mockProductsI18n';

const LocalizedProductScreen = () => {
  const locale = useAppSelector((state) => state.i18n.locale);
  const t = createTranslationFunction(locale);
  const products = getLocalizedProducts('newIn', locale);

  return (
    <View>
      <Text>{t('home.newIn')}</Text>
      {products.map(product => (
        <View key={product.id}>
          <Text>{product.name}</Text>
          <Text>{product.description}</Text>
          <Text>{formatCurrency(product.price, locale)}</Text>
        </View>
      ))}
    </View>
  );
};
```

This comprehensive i18n system ensures that the entire app can be easily localized and provides a great user experience for users speaking different languages.