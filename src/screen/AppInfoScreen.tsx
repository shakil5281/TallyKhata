import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const AppInfoScreen = () => {
  const handleLink = (url: string, title: string) => {
    if (url.startsWith('https://')) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Could not open ${title}`);
      });
    } else {
      Alert.alert('Info', `${title}: ${url}`);
    }
  };

  const appInfo = {
    name: 'TallyKhata - Digital Ledger',
    version: '1.0.0',
    description:
      'Professional digital ledger and accounting app for small businesses and individuals. Track customers, transactions, and generate detailed reports with ease.',
    company: 'Shakil Hossain',
    website: 'https://tallykhata.app',
    support: 'support@tallykhata.app',
    privacy: 'https://tallykhata.app/privacy',
    terms: 'https://tallykhata.app/terms',
  };

  const features = [
    'Customer Management',
    'Transaction Recording',
    'Digital Ledger',
    'Report Generation',
    'Data Export (CSV, JSON, PDF)',
    'Secure Storage',
    'Demo Authentication',
    'Offline Mode',
    'Cross Platform Support',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="info" size={48} color="#fe4c24" />
        <Title style={styles.appName}>{appInfo.name}</Title>
        <Text style={styles.version}>Version {appInfo.version}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>About TallyKhata</Title>
          <Paragraph style={styles.description}>{appInfo.description}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Key Features</Title>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Company Information</Title>
          <View style={styles.infoRow}>
            <MaterialIcons name="business" size={20} color="#fe4c24" />
            <Text style={styles.infoText}>{appInfo.company}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="web" size={20} color="#fe4c24" />
            <Button
              mode="text"
              onPress={() => handleLink(appInfo.website, 'Website')}
              style={styles.linkButton}>
              {appInfo.website}
            </Button>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="support-agent" size={20} color="#fe4c24" />
            <Button
              mode="text"
              onPress={() => handleLink(`mailto:${appInfo.support}`, 'Support Email')}
              style={styles.linkButton}>
              {appInfo.support}
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Legal & Support</Title>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => handleLink(appInfo.privacy, 'Privacy Policy')}
              style={styles.legalButton}
              icon="shield-account">
              Privacy Policy
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleLink(appInfo.terms, 'Terms of Service')}
              style={styles.legalButton}
              icon="file-document">
              Terms of Service
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Technical Information</Title>
          <View style={styles.techInfo}>
            <Text style={styles.techText}>Platform: React Native + Expo</Text>
            <Text style={styles.techText}>Database: SQLite with Encryption</Text>
            <Text style={styles.techText}>Authentication: Demo Mode</Text>
            <Text style={styles.techText}>Storage: Secure Local Storage</Text>
            <Text style={styles.techText}>Export: CSV, JSON, PDF</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 {appInfo.company}. All rights reserved.</Text>
        <Text style={styles.footerText}>Made with ❤️ for small businesses</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fe4c24',
    textAlign: 'center',
    marginTop: 16,
  },
  version: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
    flex: 1,
  },
  linkButton: {
    marginLeft: 12,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    gap: 12,
  },
  legalButton: {
    marginVertical: 4,
  },
  techInfo: {
    marginTop: 8,
  },
  techText: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default AppInfoScreen;
