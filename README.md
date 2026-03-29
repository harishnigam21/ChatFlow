# 🚀 ChatFlow – Real-Time Chat Application

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)
![License](https://img.shields.io/badge/License-MIT-orange)

---

## 📌 Overview

**ChatFlow** is a full-stack real-time chat application built with a focus on performance, scalability, and modern UI/UX.

It goes beyond basic messaging by implementing:
- ⚡ Real-time communication
- 🧠 Smart message grouping & aggregation
- 🖼️ Media optimization with caching
- 👥 Social interaction system (follow/request)
- 🎯 Advanced state & performance optimizations

---

## ✨ Features

### 💬 Real-Time Chat
- Socket.io powered messaging
- Live updates for:
  - Messages
  - Seen status
  - Message deletion
- Online/offline tracking with last seen

---

### 🧠 Smart Message System
- Messages grouped by:
  - **Year → Date → Messages**
- Aggregation pipeline for:
  - Last message
  - Unread counts
- Efficient seen/unseen tracking

---

### 🗑️ Message Deletion System
- Delete messages for:
  - Sender
  - Receiver
- Real-time sync using sockets
- Multi-message selection support

---

### 🖼️ Media Handling & Optimization
- Cloudinary integration for uploads
- IndexedDB caching:
  - Stores viewed media locally
  - Reduces redundant API calls
- Thumbnail-based loading
- On-demand high-quality download
- Fullscreen preview support

---

### 👥 Social Features
- Follow / Unfollow users
- Send / Accept / Reject requests
- Real-time notifications via sockets
- Dynamic UI updates using Redux

---

### 👤 Profile Management
- Update:
  - Profile picture
  - Banner
  - Bio
- Image validation (size/type)
- Cloudinary-based storage

---

### 🔍 Search & Filtering
- Search users dynamically
- Filter chat/contact list
- Optimized rendering

---

### 🎨 Modern UI/UX
- Fully responsive (mobile + desktop)
- Emoji picker integration 😊
- Animated request panels
- Clean chat interface:
  - Date separators
  - Seen indicators
  - Message grouping

---

### ⚡ Performance Optimizations
- IndexedDB media caching
- MongoDB aggregation pipelines
- Reduced API calls
- Optimized Redux state updates
- Cursor-based cleanup for old media

---

### 🌐 Network & Error Handling
- No-internet detection UI
- JWT-based authentication
- Token refresh handling
- Robust API error management

---

### 🎆 Advanced UI Effects
- 3D Particle background using Three.js
- Smooth transitions & animations

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Socket.io-client
- IndexedDB
- React Three Fiber (Three.js)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io

### Cloud & Tools
- Cloudinary (media storage)
- JWT Authentication

---

## ⚙️ Key Technical Highlights

### 🔹 MongoDB Aggregation
Efficient queries for:
- Grouping messages
- Fetching last message & unread counts

---

### 🔹 Media Caching Strategy
- Store media in IndexedDB
- Avoid repeated Cloudinary requests
- Auto cleanup of expired media

---

### 🔹 Real-Time Architecture
- Event-based socket system
- User-specific socket mapping
- Instant UI updates

---

### 🔹 Scalable State Management
- Modular Redux slices
- Optimized updates
- Prevent unnecessary re-renders

---

## 📈 Project Evolution

This project evolved through multiple phases:

1. Basic chat functionality  
2. UI/UX improvements  
3. Social interaction system  
4. Message optimization (grouping + aggregation)  
5. Media handling & caching  
6. Advanced real-time features & deletion system  

---

## 🧪 Challenges Solved

- Handling large chat datasets efficiently  
- Reducing media load & API usage  
- Syncing real-time events across users  
- Managing complex UI state  
- Designing scalable backend queries  

---