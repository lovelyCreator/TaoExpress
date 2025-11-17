import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

type HelpArticleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HelpArticle'>;
type HelpArticleScreenRouteProp = RouteProp<RootStackParamList, 'HelpArticle'>;

const HelpArticleScreen: React.FC = () => {
  const navigation = useNavigation<HelpArticleScreenNavigationProp>();
  const route = useRoute<HelpArticleScreenRouteProp>();
  const { articleId, title } = route.params;
  const locale = useAppSelector((state) => state.i18n.locale);
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Get article content based on articleId
  const getArticleContent = (id: string) => {
    // Map article IDs to translation keys
    const articleContentMap: { [key: string]: string } = {
      '1': 'helpCenter.articles.termsOfUseContent',
      '2': 'helpCenter.articles.serviceIntroductionContent', 
      '3': 'helpCenter.articles.privacyPolicyContent',
      '4': 'helpCenter.articles.returnRefundPolicyContent',
    };
    
    const contentKey = articleContentMap[id] || 'helpCenter.articles.defaultContent';
    
    return {
      title: title,
      content: t(contentKey),
      lastUpdated: `${t('helpCenter.lastUpdated')}: December 15, 2024`,
    };
  };

  const article = getArticleContent(articleId);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>Help Article</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.lastUpdated}>{article.lastUpdated}</Text>
      
      <View style={styles.contentSection}>
        <Text style={styles.contentText}>{article.content}</Text>
      </View>
      
      <View style={styles.helpfulSection}>
        <Text style={styles.helpfulTitle}>{t('helpCenter.wasHelpful')}</Text>
        <View style={styles.helpfulButtons}>
          <TouchableOpacity style={[styles.helpfulButton, styles.yesButton]}>
            <Ionicons name="thumbs-up" size={16} color={COLORS.white} />
            <Text style={styles.yesButtonText}>{t('helpCenter.yes')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.helpfulButton, styles.noButton]}>
            <Ionicons name="thumbs-down" size={16} color={COLORS.gray[600]} />
            <Text style={styles.noButtonText}>{t('helpCenter.no')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  articleTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  lastUpdated: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xl,
  },
  contentSection: {
    marginBottom: SPACING.xl,
  },
  contentText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  helpfulSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  helpfulTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  yesButton: {
    backgroundColor: COLORS.primary,
  },
  noButton: {
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  yesButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  noButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
});

export default HelpArticleScreen;