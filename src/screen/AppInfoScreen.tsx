import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert, TouchableOpacity } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '~/context/ThemeContext';
import PageTransition from '../../components/PageTransition';

const AppInfoScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const handleLink = (url: string, title: string) => {
    if (url.startsWith('https://')) {
      Linking.openURL(url).catch(() => {
        Alert.alert('ত্রুটি', `${title} খুলতে ব্যর্থ`);
      });
    } else {
      Alert.alert('তথ্য', `${title}: ${url}`);
    }
  };

  const appInfo = {
    name: 'টালিখাতা - ডিজিটাল খাতা',
    version: '১.০.০',
    description:
      'ছোট ব্যবসা এবং ব্যক্তিদের জন্য পেশাদার ডিজিটাল খাতা এবং হিসাবরক্ষণ অ্যাপ। সহজে গ্রাহক, লেনদেন ট্র্যাক করুন এবং বিস্তারিত রিপোর্ট তৈরি করুন।',
    company: 'শাকিল হোসেন',
    website: 'https://tallykhata.app',
    support: 'support@tallykhata.app',
    privacy: 'https://tallykhata.app/privacy',
    terms: 'https://tallykhata.app/terms',
  };

  const features = [
    'গ্রাহক ব্যবস্থাপনা',
    'লেনদেন রেকর্ডিং',
    'ডিজিটাল খাতা',
    'রিপোর্ট তৈরি',
    'ডেটা এক্সপোর্ট (CSV, JSON, PDF)',
    'নিরাপদ স্টোরেজ',
    'ডেমো প্রমাণীকরণ',
    'অফলাইন মোড',
    'ক্রস প্ল্যাটফর্ম সমর্থন',
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <View style={styles.headerContent}>
        <MaterialIcons name="info" size={48} color={colors.textInverse} />
        <Text style={[styles.appName, { color: colors.textInverse }]}>
          {appInfo.name}
        </Text>
        <Text style={[styles.version, { color: colors.textInverse }]}>
          সংস্করণ {appInfo.version}
        </Text>
      </View>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        টালিখাতা সম্পর্কে
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.description, { color: colors.text }]}>
          {appInfo.description}
        </Text>
      </View>
    </View>
  );

  const renderFeaturesSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        মূল বৈশিষ্ট্য
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCompanySection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        কোম্পানির তথ্য
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {appInfo.company}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="web" size={20} color={colors.primary} />
          <TouchableOpacity
            onPress={() => handleLink(appInfo.website, 'ওয়েবসাইট')}
            activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {appInfo.website}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="support-agent" size={20} color={colors.primary} />
          <TouchableOpacity
            onPress={() => handleLink(`mailto:${appInfo.support}`, 'সহায়তা ইমেইল')}
            activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {appInfo.support}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLegalSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        আইনি ও সহায়তা
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.legalButton, { borderColor: colors.border }]}
          onPress={() => handleLink(appInfo.privacy, 'গোপনীয়তা নীতি')}
          activeOpacity={0.7}>
          <Text style={[styles.legalButtonText, { color: colors.text }]}>
            গোপনীয়তা নীতি
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.legalButton, { borderColor: colors.border }]}
          onPress={() => handleLink(appInfo.terms, 'ব্যবহারের শর্তাবলী')}
          activeOpacity={0.7}>
          <Text style={[styles.legalButtonText, { color: colors.text }]}>
            ব্যবহারের শর্তাবলী
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        যোগাযোগ
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.contactText, { color: colors.textSecondary }]}>
          আপনার কোন প্রশ্ন বা পরামর্শ থাকলে আমাদের সাথে যোগাযোগ করুন
        </Text>
        
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => handleLink(`mailto:${appInfo.support}`, 'ইমেইল পাঠান')}
          activeOpacity={0.7}>
          <Text style={[styles.contactButtonText, { color: colors.textInverse }]}>
            ইমেইল পাঠান
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderAboutSection()}
          {renderFeaturesSection()}
          {renderCompanySection()}
          {renderLegalSection()}
          {renderContactSection()}
        </ScrollView>
      </View>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  linkText: {
    fontSize: 16,
    marginLeft: 12,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    gap: 12,
  },
  legalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  legalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppInfoScreen;
