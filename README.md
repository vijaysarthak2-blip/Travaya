# Travaya - Travel Booking Application

A full-stack MERN travel booking application with user authentication, destination browsing, and booking management.

## Features

- **User Authentication**: Secure login/registration with JWT tokens and email verification
- **Destination Browsing**: Explore travel destinations by state
- **Booking System**: Book destinations with user-friendly interface
- **Itinerary Management**: View detailed travel itineraries
- **Admin Panel**: Complete admin dashboard with destination management
- **Image Upload**: Browse and upload images from device or use URLs
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes
- **Security**: Helmet middleware, rate limiting, input validation

## 📁 Project Structure

```
Travaya overall/
|-- travaya-next/               # Frontend (Next.js/React)
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- context/
|   |   |-- config.js
|   |-- public/
|   |-- package.json
|   |-- next.config.mjs
|   |-- tailwind.config.js
|-- travaya-backend/            # Backend (Node.js/Express/MongoDB)
|   |-- server.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Destination.js
|   |   |-- Booking.js
|   |   |-- Itinerary.js
|   |-- seedData.js
|   |-- .env
|   |-- package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Gmail account with 2-factor authentication (for email verification)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd travaya-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   ```env
   PORT=5000
   DB_URL=mongodb+srv://Travaya:Travaya@cluster0.qhy33of.mongodb.net/travaya?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   FRONTEND_URL=http://localhost:5500
   ```

5. **Important - Email Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: Google Account Settings > Security > App passwords
   - Use the 16-character app password (not your regular password)

6. Start the backend server:
   ```bash
   npm start
   ```

   Backend will run on: `http://localhost:5000`

### Frontend Setup (Next.js/React)

1. Navigate to Next.js frontend:
   ```bash
   cd travaya-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:3000`

### Quick Start

1. **Start Backend:**
   ```bash
   cd travaya-backend && npm start
   ```

2. **Start Frontend:**
   ```bash
   cd travaya-next && npm run dev
   ```

3. **Open in Chrome:**
   - Navigate to `http://localhost:3000`
   - Register a new account
   - Check your email for verification link
   - Login and start exploring!

### Database Setup

1. Make sure MongoDB is running
2. The app will automatically connect and create database
3. To seed sample destinations, visit: `http://localhost:5000/seed-data`
4. To seed sample itineraries, visit: `http://localhost:5000/seed-itineraries`

### Admin Panel Access

1. Register a new account and verify email
2. Update user role to admin in MongoDB:
   ```javascript
   db.users.updateOne({email: "your-email@gmail.com"}, {$set: {role: "admin"}})
   ```
3. Login and access admin panel at: `http://localhost:3000/admin`
4. **Image Upload Features:**
   - **Browse Device**: Click upload area to select image from device
   - **Drag & Drop**: Drag image files directly to upload area
   - **URL Input**: Paste image URL as alternative
   - **Base64 Support**: Images are converted and stored efficiently
   - **File Validation**: Supports images up to 5MB

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user (sends verification email)
- `POST /auth/login` - User login (requires email verification)
- `POST /api/auth/logout` - User logout
- `GET /verify-email/:token` - Verify email address
- `POST /resend-verification` - Resend verification email

### Destinations
- `GET /destinations` - Get all destinations
- `GET /destinations/:id` - Get specific destination
- `GET /api/itinerary/:id` - Get destination itinerary

### Bookings
- `POST /bookings` - Create new booking (requires auth)
- `GET /bookings` - Get user bookings (requires auth)
- `GET /api/bookings/all` - Get all user bookings with details (requires auth)

### User Profile
- `GET /api/user/me` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)
- `PUT /api/user/change-password` - Change password (requires auth)
- `DELETE /api/user/account` - Delete account (requires auth)

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Helmet**: Security headers for Express.js
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Server-side validation with express-validator
- **Password Hashing**: bcryptjs for secure password storage
- **CORS**: Proper cross-origin resource sharing

## 🎨 Frontend Features

- **Responsive Design**: Mobile-friendly interface
- **Theme Toggle**: Dark/light mode switching
- **Form Validation**: Client-side validation with error messages
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Graceful error handling and notifications

## 🧪 Testing

### Test Login
- Email: Use a registered email or create a new account
- Password: Minimum 8 characters

### Test Booking Flow
1. Register/login to the application
2. Browse destinations on the home page
3. Click "Book Now" on any destination
4. Fill booking form and submit

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch" error**
   - Ensure both frontend and backend servers are running
   - Check CORS configuration in server.js
   - Verify API_BASE URL in configuration files
   - Make sure you're accessing via http://localhost:3000

2. **MongoDB connection error**
   - Ensure MongoDB is running
   - Check DB_URL in .env file
   - Verify network connectivity

3. **JWT token errors**
   - Check JWT_SECRET in .env file
   - Ensure token is stored in localStorage
   - Verify token expiration (7 days)

4. **Email verification not working**
   - Check EMAIL_USER and EMAIL_PASS in .env file
   - Ensure you're using Gmail App Password (not regular password)
   - Verify 2-factor authentication is enabled on Gmail account
   - Check spam folder for verification emails
   - Ensure FRONTEND_URL matches your frontend URL

5. **Registration button stuck on "Creating account..."**
   - This issue has been fixed in the latest version
   - Ensure backend server is running and responding
   - Check browser console for specific error messages

### Port Conflicts
- Frontend uses port 3000
- Backend uses port 5000
- Change ports in configuration files if needed

### How to Open in Chrome

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd travaya-backend && npm start
   
   # Terminal 2 - Frontend
   cd travaya-next && npm run dev
   ```

2. **Open Chrome and navigate to:**
    - Frontend: `http://localhost:3000`

3. **For development, use Chrome DevTools:**
   - Press F12 to open developer tools
   - Check Console tab for errors
   - Monitor Network tab for API requests

## 📝 Development Notes

- Frontend uses Next.js (React)
- Backend uses Express.js with MongoDB
- Images are stored in the `travaya-next/public` folder
- Development server provides hot reloading

## 🚀 Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Update allowedOrigins in server.js
3. Configure production database URL
4. Use process manager like PM2

### Frontend Deployment
1. Upload frontend files to web server
2. Update API_BASE URL to production backend
3. Configure HTTPS if required

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
