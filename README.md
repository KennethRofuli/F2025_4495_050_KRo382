# Campus Marketplace
# Kenneth Rofuli - 300392382

A React Native mobile application for students to buy, sell, and trade items within their campus community.

## 📱 Project Overview

This is a full-stack mobile marketplace application designed specifically for college students. Students can create listings for textbooks, electronics, furniture, and other items, browse available items, manage favorites, and interact with sellers through an intuitive card-based interface.

## 🚀 Tech Stack

### Frontend (React Native)
- **React Native** with Expo SDK 54
- **Expo Router** for navigation
- **expo-image-picker** for camera/gallery access
- **expo-secure-store** for secure token storage
- **Axios** for API communication
- **Cloudinary** for cloud image storage
- **StyleSheet** with organized responsive design system

### Backend (Node.js)
- **Express.js** server with RESTful APIs
- **MongoDB Atlas** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.IO** with Redis for real-time features
- **CORS** enabled for cross-origin requests

## ✨ Features Implemented

### 🔐 Authentication System
- **User Registration** with name, email, password, and campus
- **Secure Login** with JWT token-based authentication
- **Password Hashing** using bcryptjs
- **Token Management** with expo-secure-store
- **Protected Routes** with authentication middleware

### 📝 Listing Management
- **Create Listings** with title, description, price, category, and images
- **Edit Listings** with pre-populated form data
- **Delete Listings** with confirmation
- **Cloud Image Upload** using Cloudinary
- **My Listings** screen for managing user's items

### ❤️ Favorites System
- **Heart Icon Component** with real-time favorite toggling
- **Favorites Screen** with dedicated favorites management
- **Backend Favorites API** with full CRUD operations
- **Self-Favoriting Prevention** (users can't favorite own listings)

### 🎨 UI/UX Improvements
- **Responsive Design System** with scalable typography and spacing
- **FlatList Optimization** for smooth scrolling with large datasets
- **Clickable Listing Cards** with options modal
- **Consistent Styling** across all screens
- **Professional Card Design** with proper margins and spacing

### 🖼️ Image Handling
- **Camera Access** - Take photos directly in the app
- **Gallery Access** - Select existing photos from device
- **Cloud Storage** - Images stored on Cloudinary
- **Image Preview** - Preview and manage images before submission

## 🎯 Current Status

### ✅ Completed Features
- User authentication (register/login)
- JWT-based session management
- Create and edit listings
- Cloud image storage with Cloudinary
- Complete favorites system with heart icons
- FlatList optimization for performance
- Clickable listing cards with options modal
- Responsive design across all screens
- Professional UI/UX with consistent styling

### 🚧 In Progress
- Basic reporting system for listings
- Message seller functionality

### 📋 Planned Features
- Real-time messaging between users
- Advanced search and filter options
- User profiles and ratings
- Push notifications
- Content moderation system

## 🐛 Known Issues

- **Backend Connectivity**: Requires local backend server or cloud deployment
- **Network Dependencies**: School network may require tunnel mode
- **Real-time Features**: Messaging system not yet implemented

## 📚 Learning Outcomes

This project demonstrates:
- **Full-stack mobile development** with React Native and Node.js
- **Authentication and security** best practices
- **Database design** and integration
- **API development** and consumption
- **Mobile UI/UX** design principles
- **Code organization** and maintainability
- **Performance optimization** with FlatList virtualization
- **Cloud storage integration** with Cloudinary

---

*Last updated: October 12, 2025*