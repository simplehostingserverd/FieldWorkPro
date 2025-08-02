# FieldPro Mobile App - Deployment Guide

## Overview
This guide covers the complete setup and deployment process for the FieldPro mobile application to the Google Play Store.

## Prerequisites

### Development Environment
- Node.js 16+ 
- React Native CLI
- Android Studio with Android SDK
- Java Development Kit (JDK) 11+
- Git

### Android Development Setup
1. Install Android Studio
2. Configure Android SDK (API level 33+)
3. Set up Android Virtual Device (AVD) for testing
4. Configure environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Project Setup

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Environment Configuration
Create `.env` file with your backend API URL:
```
API_BASE_URL=https://your-backend-api.com/api
APP_NAME=FieldPro
APP_VERSION=1.0.0
ENVIRONMENT=production
```

### 3. Android Setup
```bash
# Generate debug keystore (if not exists)
keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000

# Link native dependencies
npx react-native link
```

## Building for Development

### 1. Start Metro Bundler
```bash
npm start
```

### 2. Run on Android Device/Emulator
```bash
npm run android
```

## Building for Production

### 1. Generate Release Keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore fieldpro-release-key.keystore -alias fieldpro-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle Properties
Create `android/gradle.properties`:
```
FIELDPRO_UPLOAD_STORE_FILE=fieldpro-release-key.keystore
FIELDPRO_UPLOAD_KEY_ALIAS=fieldpro-key-alias
FIELDPRO_UPLOAD_STORE_PASSWORD=your_keystore_password
FIELDPRO_UPLOAD_KEY_PASSWORD=your_key_password
```

### 3. Build Release APK
```bash
cd android
./gradlew assembleRelease
```

### 4. Build Release Bundle (for Play Store)
```bash
cd android
./gradlew bundleRelease
```

## Google Play Store Deployment

### 1. Create Google Play Console Account
- Sign up at https://play.google.com/console
- Pay one-time $25 registration fee
- Complete account verification

### 2. Create New App
1. Go to Google Play Console
2. Click "Create app"
3. Fill in app details:
   - App name: FieldPro
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (or Paid if applicable)

### 3. App Content and Policies
Complete all required sections:
- Privacy Policy (required)
- App category: Business
- Content rating questionnaire
- Target audience: Adults
- Data safety form

### 4. Store Listing
- App name: FieldPro
- Short description: Equipment and customer management for field operations
- Full description: Comprehensive description of app features
- App icon: 512x512 PNG
- Screenshots: At least 2 phone screenshots (1080x1920 or 1440x2560)
- Feature graphic: 1024x500 PNG

### 5. Upload App Bundle
1. Go to "Release" > "Production"
2. Click "Create new release"
3. Upload the AAB file from `android/app/build/outputs/bundle/release/`
4. Add release notes
5. Review and rollout

## App Store Optimization (ASO)

### Keywords
- Equipment management
- Field service
- Customer management
- Business tools
- Inventory tracking

### Screenshots Requirements
- At least 2 screenshots
- Show key features: dashboard, equipment list, customer management
- Use device frames for better presentation
- Include captions explaining features

### App Description Template
```
FieldPro - Professional Equipment & Customer Management

Streamline your field operations with FieldPro, the comprehensive mobile solution for equipment tracking, customer management, and job scheduling.

KEY FEATURES:
🔧 Equipment Management
- Track equipment status and location
- Maintenance scheduling
- Serial number tracking
- Purchase and warranty information

👥 Customer Management
- Complete customer database
- Contact information and history
- Address management with auto-complete
- Customer categorization

📋 Job Management
- Schedule and track jobs
- Priority management
- Customer assignment
- Cost estimation

📊 Dashboard & Reports
- Real-time overview
- Equipment status summary
- Recent activity tracking
- Performance metrics

✨ Mobile-First Design
- Optimized for mobile use
- Offline capability
- Touch-friendly interface
- Fast and responsive

Perfect for contractors, equipment rental companies, field service businesses, and any organization that needs to track equipment and manage customers efficiently.

Download FieldPro today and take control of your field operations!
```

## Testing Checklist

### Pre-Release Testing
- [ ] Test on multiple Android devices
- [ ] Test different screen sizes
- [ ] Verify all forms work correctly
- [ ] Test offline functionality
- [ ] Verify API connectivity
- [ ] Test user authentication
- [ ] Check app permissions
- [ ] Verify app icon and splash screen
- [ ] Test app navigation
- [ ] Verify data persistence

### Performance Testing
- [ ] App startup time < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] Memory usage optimization
- [ ] Battery usage optimization
- [ ] Network request optimization

## Post-Launch

### Monitoring
- Set up crash reporting (Firebase Crashlytics)
- Monitor app performance
- Track user engagement
- Monitor reviews and ratings

### Updates
- Regular bug fixes
- Feature updates based on user feedback
- Security updates
- Performance improvements

## Troubleshooting

### Common Issues
1. **Build Errors**: Clean project and rebuild
   ```bash
   cd android && ./gradlew clean && cd .. && npm run android
   ```

2. **Metro Bundler Issues**: Reset cache
   ```bash
   npx react-native start --reset-cache
   ```

3. **Keystore Issues**: Verify keystore path and passwords

4. **Play Store Rejection**: Review policy compliance and fix issues

### Support Resources
- React Native Documentation
- Google Play Console Help
- Android Developer Documentation
- Stack Overflow community

## Security Considerations
- Use HTTPS for all API calls
- Implement proper authentication
- Secure sensitive data storage
- Regular security updates
- Code obfuscation for release builds

## Maintenance Schedule
- Weekly: Monitor crash reports and user feedback
- Monthly: Performance optimization and bug fixes
- Quarterly: Feature updates and security reviews
- Annually: Major version updates and dependency updates
