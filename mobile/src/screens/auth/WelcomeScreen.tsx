import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { spacing } from '../../theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.surface }]}>
              <Text 
                variant="headlineLarge" 
                style={[styles.logoText, { color: theme.colors.primary }]}
              >
                FP
              </Text>
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.textContainer}>
            <Text 
              variant="headlineLarge" 
              style={[styles.title, { color: theme.colors.onPrimary }]}
            >
              FieldPro
            </Text>
            <Text 
              variant="titleMedium" 
              style={[styles.subtitle, { color: theme.colors.onPrimary }]}
            >
              Equipment & Customer Management
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.description, { color: theme.colors.onPrimary }]}
            >
              Streamline your field operations with powerful tools for managing equipment, customers, and jobs.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.colors.onPrimary }]}>🔧</Text>
              <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                Equipment Tracking
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.colors.onPrimary }]}>👥</Text>
              <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                Customer Management
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={[styles.featureIcon, { color: theme.colors.onPrimary }]}>📋</Text>
              <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                Job Scheduling
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, { backgroundColor: theme.colors.surface }]}
            labelStyle={{ color: theme.colors.primary }}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={[styles.button, styles.outlineButton]}
            labelStyle={{ color: theme.colors.onPrimary }}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    borderRadius: 12,
  },
  outlineButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});

export default WelcomeScreen;
