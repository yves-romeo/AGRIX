# Agri X

<div align="center">

![Agri X](https://img.shields.io/badge/Agri-X-Precision%20Agriculture-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-cyan)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**AI-Powered Precision Agriculture Platform for East African Farmers**

[Website](https://agrix.rw) • [Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 🌱 About Agri X

Agri X is a comprehensive agricultural technology platform designed specifically for Rwandan and East African smallholder farmers. It combines cutting-edge AI, IoT sensor networks, satellite imagery, and a verified marketplace to empower farmers with real-time insights and direct market access.

### 🎯 Mission

To equip Rwandan smallholder farmers, youth entrepreneurs, and local agri-cooperatives with accessible AI and precision agri-tech tools that boost productivity, transparency, and income.

---

## ✨ Key Features

### 🔬 AI Disease Diagnosis
- **Multispectral Leaf Analysis**: Instant plant pathogen and nutrient deficiency diagnostic with AI confidence scoring
- Upload leaf images for real-time disease detection
- Verified agronomy guidance and treatment recommendations
- Support for common East African crop diseases

### 📡 IoT Quantum Monitoring
- Live NPK (Nitrogen, Phosphorus, Potassium) sensor monitoring
- Real-time pH, moisture, and temperature tracking
- Multi-field sensor network management
- Automated alerts for critical soil conditions

### 🛰️ Satellite Field Analytics
- Field boundary detection and mapping
- Crop health scoring using satellite imagery
- Vegetation index analysis (NDVI, EVI)
- Historical growth tracking and trend analysis

### 🛒 Verified Buyer Marketplace
- Direct connection between farmers and premium buyers
- Real-time MINAGRI market price transparency
- Verified supply chain network
- Support for 6+ Rwandan market hubs

### 🌍 Localization
- Full bilingual support: English and Kinyarwanda
- Context-aware translations for agricultural terminology
- Cultural relevance in UI/UX design

### 🔐 Authentication & Security
- Firebase-based user authentication
- Secure user profile management
- Multi-device session support

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend & Services
- **Authentication**: Firebase 12.17
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: Google Generative AI SDK
- **Real-time Database**: Firebase Realtime Database
- **Hosting**: Firebase Hosting

### Development Tools
- **Type Checking**: TypeScript 5.5
- **Linting**: ESLint 9.9
- **Package Manager**: npm

---

## 📸 Screenshots

<div align="center">
  <h3>Welcome Screen</h3>
  <img src="docs/screenshots/welcome.png" alt="Welcome Screen" width="800"/>
  
  <h3>AI Center - Leaf Disease Scanner</h3>
  <img src="docs/screenshots/ai-center.png" alt="AI Center" width="800"/>
  
  <h3>Satellite Field Analysis</h3>
  <img src="docs/screenshots/satellite.png" alt="Satellite View" width="800"/>
  
  <h3>IoT Telemetry Dashboard</h3>
  <img src="docs/screenshots/telemetry.png" alt="Telemetry View" width="800"/>
  
  <h3>Agricultural Marketplace</h3>
  <img src="docs/screenshots/marketplace.png" alt="Marketplace View" width="800"/>
</div>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase account with project configured
- Supabase account with project configured
- Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yves-romeo/AGRIX.git
   cd AGRIX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Configure Firebase**
   
   Ensure your Firebase project has:
   - Authentication enabled (Email/Password)
   - Realtime Database configured with appropriate rules
   - Storage configured for image uploads

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 📖 Usage

### For Farmers

1. **Sign Up/Create Account**: Create your profile with farm details
2. **AI Disease Scan**: Navigate to AI Center, upload leaf images for diagnosis
3. **Monitor Fields**: Use Satellite view to track field health and boundaries
4. **Check Sensors**: View real-time IoT telemetry in Telemetry dashboard
5. **Market Access**: Browse AgriMarket for buyer connections and pricing

### For Buyers

1. **Register as Buyer**: Create verified buyer profile
2. **Browse Listings**: View available produce from verified farmers
3. **Direct Contact**: Connect directly with farmers for purchases
4. **Price Transparency**: Access real-time MINAGRI market prices

---

## 🗺️ Project Structure

```
AGRIX/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, videos, static files
│   ├── components/        # Reusable React components
│   │   ├── AuthModal.tsx
│   │   └── ...
│   ├── lib/               # Utilities and configurations
│   │   ├── AuthContext.tsx
│   │   ├── i18n.ts
│   │   └── nav.ts
│   ├── types/             # TypeScript type definitions
│   ├── views/             # Main application views
│   │   ├── AICenterView.tsx
│   │   ├── SatelliteView.tsx
│   │   ├── TelemetryView.tsx
│   │   ├── AgriMarketView.tsx
│   │   └── WelcomeView.tsx
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── supabase/              # Supabase migrations
│   └── migrations/
├── .firebase/             # Firebase configuration
├── firebase.json          # Firebase deployment config
├── eslint.config.js       # ESLint configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Project dependencies
```

---

## 🔧 Configuration

### Firebase Rules

Ensure your Firebase Realtime Database rules are properly configured for security:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Supabase Setup

Run migrations from the `supabase/migrations/` directory to set up the database schema.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👥 Authors

**Yves Romeo** - *Initial work* - [yves-romeo](https://github.com/yves-romeo)

---

## 🙏 Acknowledgments

- MINAGRI Rwanda for market data support
- Google Generative AI for disease diagnosis capabilities
- Firebase and Supabase for infrastructure support
- The Rwandan agricultural community for inspiration and feedback

---

## 📞 Contact

**Agri X Support Team**
- Email: support@agrix.rw
- WhatsApp/Phone: +250 790 145 253
- Address: NG 7 Ave, Nyagatare, Rwanda

---

## 🗺️ Roadmap

- [ ] Mobile app (iOS and Android)
- [ ] Additional language support (Swahili, French)
- [ ] Advanced crop yield prediction models
- [ ] Integration with drone imagery
- [ ] Offline mode support for remote areas
- [ ] Farmer training modules and resources

---

<div align="center">

**Built with ❤️ for Rwandan Farmers**

[⬆ Back to Top](#agri-x)

</div>
