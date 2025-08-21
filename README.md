# 🧮 TallyKhata - Digital Ledger & Business Management

[![EAS Build - Android](https://github.com/{username}/TallyKhata/workflows/EAS%20Build%20-%20Android%20Only/badge.svg)](https://github.com/{username}/TallyKhata/actions/workflows/eas-build.yml)
[![Quality Check](https://github.com/{username}/TallyKhata/workflows/Quality%20Check/badge.svg)](https://github.com/{username}/TallyKhata/actions/workflows/quality-check.yml)
[![Deploy](https://github.com/{username}/TallyKhata/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/{username}/TallyKhata/actions/workflows/deploy.yml)

> Professional digital ledger and accounting app for small businesses and individuals. Track customers, transactions, and generate detailed reports with ease.

## ✨ Features

- 📱 **Cross-Platform**: Built with React Native and Expo
- 👥 **Customer Management**: Add, edit, and manage customer profiles
- 💰 **Transaction Tracking**: Credit/debit transactions with detailed notes
- 📊 **Real-time Reports**: Dashboard with business insights
- 🎨 **Modern UI**: Beautiful, responsive design with dark/light themes
- 📸 **Photo Support**: Customer photo uploads and management
- 🔒 **Secure Storage**: Local SQLite database with backup options
- 📤 **Data Export**: CSV and JSON export functionality
- 🚀 **Automated Builds**: GitHub Actions CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- EAS CLI (for builds)

### Installation
```bash
# Clone the repository
git clone https://github.com/{username}/TallyKhata.git
cd TallyKhata

# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Clear cache and restart
npm run fresh

# Lint and format code
npm run lint
npm run format

# Database management
npm run clear-db      # Clear database
npm run migrate-db    # Run migrations
npm run reset         # Clear DB and restart
```

## 🏗️ Project Structure

```
TallyKhata/
├── app/                    # Expo Router app directory
├── src/                    # Source code
│   ├── context/           # React Context providers
│   ├── lib/               # Database and utilities
│   ├── screen/            # Screen components
│   ├── theme/             # Theme configuration
│   └── utils/             # Helper functions
├── components/             # Reusable components
├── assets/                 # Images and static files
├── scripts/                # Database scripts
└── .github/workflows/      # GitHub Actions workflows
```

## 🎨 UI Components

- **SplashScreen**: Animated loading screen with progress
- **ThemeToggle**: Dark/light theme switcher
- **PhotoPicker**: Image selection and upload
- **Toast**: Notification system
- **SkeletonLoader**: Loading placeholders
- **PageTransition**: Smooth screen transitions

## 🗄️ Database Schema

### Customers Table
- `id`: Primary key
- `name`: Customer name
- `phone`: Phone number
- `type`: Customer or Supplier
- `photo`: Profile photo URI
- `total_balance`: Current balance

### Transactions Table
- `id`: Primary key
- `customer_id`: Foreign key to customers
- `type`: Credit or Debit
- `amount`: Transaction amount
- `note`: Transaction description
- `date`: Transaction timestamp

### User Profile Table
- User preferences and settings
- Business information
- Theme preferences
- Notification settings

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_APP_NAME=TallyKhata
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### EAS Build Configuration
The app is configured for EAS builds with multiple profiles:
- **Development**: Debug builds for testing
- **Preview**: Internal testing builds
- **Production**: Release builds

## 🚀 GitHub Actions

This project includes automated CI/CD workflows:

- **EAS Build**: Automated builds on push/PR
- **Quality Check**: Code quality and security validation
- **Deploy**: Production releases on git tags

See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) for detailed setup instructions.

## 📱 Supported Platforms

- ✅ **Android (APK/AAB)** - Primary platform with automated builds
- ✅ **Web (Progressive Web App)** - Cross-platform web version
- ✅ **Expo Go (Development)** - Development and testing
- 📱 **iOS** - Available for development (manual builds)

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: Expo Router
- **Database**: SQLite (expo-sqlite)
- **UI Library**: React Native Paper
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: React Context
- **Build System**: EAS Build
- **CI/CD**: GitHub Actions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Developer**: Shakil Hossain
- **Website**: [https://tallykhata.app](https://tallykhata.app)
- **Support**: support@tallykhata.app
- **Issues**: [GitHub Issues](https://github.com/{username}/TallyKhata/issues)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- UI components from [React Native Paper](https://callstack.github.io/react-native-paper/)
- Styling with [NativeWind](https://www.nativewind.dev/)
- Database with [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)

---

**Made with ❤️ for small businesses**

> Replace `{username}` with your actual GitHub username in the badges and links above.
