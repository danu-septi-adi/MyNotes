# MyNotes - Personal Finance Manager

A modern **Personal Finance Manager** mobile application built with **React Native (Expo)**. Track your expenses, manage budgets, monitor investments, and take control of your financial life.

## Features

- 💰 **Finance Tracker** - Record and categorize daily transactions
- 📊 **Budget Management** - Set and monitor monthly budgets
- 📈 **Investment Tracking** - Monitor your investment portfolio
- 💳 **Debt Manager** - Track loans and debts
- 💱 **Multi-Currency Support** - Support for various currencies
- 📋 **Wishlist** - Plan and save for future purchases
- 📁 **Data Export** - Export your financial data for backup
- 🔒 **Secure** - Local SQLite database with encryption support
- 🎨 **Customizable** - Personalizable themes and categories

## Tech Stack

- **Framework:** React Native with Expo SDK 56
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Database:** SQLite (expo-sqlite)
- **UI Components:** React Native Paper
- **Charts:** react-native-chart-kit
- **Authentication:** expo-local-authentication (biometric support)

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/danu-septi-adi/MyNotes.git
   cd MyNotes/mynotes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on Android:
   ```bash
   npm run android
   ```

5. Run on iOS:
   ```bash
   npm run ios
   ```

## Project Structure

```
mynotes/
├── app/                  # App screens (Expo Router)
│   ├── (tabs)/          # Tab navigation screens
│   ├── _layout.tsx      # Root layout
│   ├── budget.tsx       # Budget screen
│   ├── categories.tsx   # Categories screen
│   ├── data.tsx         # Data management screen
│   ├── debts.tsx        # Debts screen
│   ├── investing.tsx    # Investment screen
│   ├── reports.tsx      # Reports screen
│   ├── settings.tsx     # Settings screen
│   └── trading.tsx      # Trading screen
├── components/          # Reusable UI components
├── constants/           # App constants and themes
├── contexts/            # React contexts
├── database/            # SQLite database layer
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── assets/              # Images and icons
```

## License

This project is licensed under the MIT License - see the [LICENSE](mynotes/LICENSE) file for details.

## Author

**Danu Septi Adi**
- GitHub: [@danu-septi-adi](https://github.com/danu-septi-adi)