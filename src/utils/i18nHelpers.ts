import { translations } from '../i18n/translations';

// Helper function to get translated text
export const getTranslation = (key: string, locale: 'en' | 'ko' | 'zh') => {
  const keys = key.split('.');
  let value: any = translations[locale as keyof typeof translations];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

// Helper function to create translation function for a specific locale
export const createTranslationFunction = (locale: 'en' | 'ko' | 'zh') => {
  return (key: string) => getTranslation(key, locale);
};

// Helper function to get localized text from multilingual object
export const getLocalizedText = (textObj: { en: string; ko: string; zh: string }, locale: 'en' | 'ko' | 'zh') => {
  return textObj[locale] || textObj.en; // Fallback to English if locale not found
};

// Helper function to format currency based on locale
export const formatCurrency = (amount: number, locale: 'en' | 'ko' | 'zh') => {
  switch (locale) {
    case 'ko':
      return `₩${amount.toLocaleString('ko-KR')}`;
    case 'zh':
      return `¥${amount.toLocaleString('zh-CN')}`;
    case 'en':
    default:
      return `$${amount.toLocaleString('en-US')}`;
  }
};

// Helper function to format numbers based on locale
export const formatNumber = (num: number, locale: 'en' | 'ko' | 'zh') => {
  switch (locale) {
    case 'ko':
      return num.toLocaleString('ko-KR');
    case 'zh':
      return num.toLocaleString('zh-CN');
    case 'en':
    default:
      return num.toLocaleString('en-US');
  }
};