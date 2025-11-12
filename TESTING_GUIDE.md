# 📱 Student Marketplace - Testing Guide

## Quick Start for Testers

### Method 1: Expo Go (Recommended - 2 minutes setup)

1. **Download Expo Go:**
   - iOS: [App Store Link](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store Link](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Access the App:**
   - **Option A (Same WiFi):** Scan QR code from developer's terminal when they run `npx expo start`
   - **Option B (Any Network):** Scan QR code when developer runs `npx expo start --tunnel`
   - **Option C (Future):** EAS Update QR code (works without developer online)

3. **Start Testing!**
   - App loads automatically
   - No installation needed
   - Updates happen automatically

### Method 2: Download APK (Android Only)

1. **Download APK:** [LINK TO APK FILE]
2. **Enable Unknown Sources** in Android settings
3. **Install the APK** by tapping the downloaded file

### Method 3: Web Version (Any Device)

- **Visit:** [WEB APP URL]
- **Works on:** Any browser (Chrome, Safari, Firefox)
- **Devices:** Phone, tablet, laptop, desktop

## 🧪 What to Test

### Core Features
- [ ] **Sign Up** - Create a new account
- [ ] **Sign In** - Log into your account
- [ ] **Create Listing** - Add a new item for sale
- [ ] **Browse Listings** - View available items
- [ ] **Favorites** - Heart items you like
- [ ] **Edit Listings** - Modify your own listings
- [ ] **Messaging** - Contact sellers about items

### 🤖 AI Features (Showcase Items)
- [ ] **AI Price Suggestions** - Try creating listings with these titles:
  - "MacBook Pro 2023" (should detect premium item)
  - "Chemistry Textbook" (should use textbook pricing)
  - "Gaming Chair" (should analyze furniture market)
- [ ] **Market Intelligence** - Check the 🤖 Market Intelligence section
- [ ] **Deal Scores** - Look for colored badges on listing cards

### Test Scenarios
1. **Create Account** → **Add Listing** → **Check AI Suggestion**
2. **Browse Items** → **Add to Favorites** → **Message Seller**
3. **View Market Intelligence** → **Check Category Analysis**

## 📝 Feedback Areas

Please test and provide feedback on:

### Usability
- Is the app intuitive to navigate?
- Are the AI suggestions helpful?
- How's the overall user experience?

### Performance  
- Does the app load quickly?
- Are there any crashes or errors?
- How's the responsiveness on your device?

### Features
- Do all features work as expected?
- Any missing functionality you'd expect?
- How accurate are the AI price suggestions?

### UI/UX
- Is the design appealing?
- Are buttons and text readable?
- Any layout issues on your screen size?

## �️ Troubleshooting

### QR Code Won't Scan?
- ✅ Make sure you're using **Expo Go** (not other QR apps)
- ✅ Check you're on the same WiFi as developer (for Option A)
- ✅ Ask developer to restart server and generate new QR
- ✅ Try clearing Expo Go cache: Go to Profile → Settings → Clear Cache

### App Won't Load?
- ✅ Check your internet connection
- ✅ Wait a minute - first load can be slow
- ✅ Force close Expo Go and try again
- ✅ Ask developer if the backend is running

### Features Not Working?
- ✅ This is a development version - some bugs are expected
- ✅ Try refreshing the app (pull down on main screen)
- ✅ Report the specific issue to developer

## �🐛 Bug Reporting

If you encounter issues:
1. **Take a screenshot** if possible
2. **Note your device** (iPhone 12, Samsung Galaxy S21, etc.)
3. **Describe the steps** that led to the problem
4. **Share feedback** via [EMAIL/FORM/GITHUB ISSUES]

## 🎯 Focus Areas for Testing

### High Priority
- [ ] AI pricing suggestions accuracy
- [ ] Listing creation and editing
- [ ] User authentication
- [ ] Image upload functionality

### Medium Priority  
- [ ] Market intelligence insights
- [ ] Messaging system
- [ ] Favorites management
- [ ] Navigation flow

### Low Priority
- [ ] Visual design feedback
- [ ] Performance optimization
- [ ] Additional feature requests

## 📞 Contact & Support

- **Developer:** Kenneth Rofuli
- **Email:** [YOUR EMAIL]
- **GitHub:** [REPO LINK]
- **Issues:** [GITHUB ISSUES LINK]

Thank you for testing the Student Marketplace! 🙏

---

*Built with React Native, Node.js, and AI-powered pricing intelligence*