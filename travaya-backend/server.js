require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

const User = require("./models/User");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const adminRoutes = require("./routes/adminRoutes");

dns.setServers(["8.8.8.8"]);

const app = express();

// Serve static uploads
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // Production: set FRONTEND_URL in Render environment variables
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and all vercel.app preview deployments
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    } else {
      const newUser = new User({
        fullName: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isEmailVerified: true,
        password: "google-auth-" + Math.random().toString(36).slice(-8)
      });
      await newUser.save();
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Travaya Backend Running" });
});

// Routes
app.use("/auth", authRoutes); // handles /auth/register, /auth/login
app.use("/api/auth", authRoutes); // handles /api/auth/logout
app.use("/", authRoutes); // handles /verify-email/:token, /resend-verification

app.use("/destinations", destinationRoutes); // handles /destinations and /destinations/:id
app.get("/seed-data", require("./controllers/destinationController").seedDestinations);
app.get("/api/itinerary/:id", require("./controllers/destinationController").getItineraryByDestinationId);
app.get("/seed-itineraries", require("./controllers/destinationController").seedItineraries);

const paymentRoutes = require("./routes/paymentRoutes");

app.use("/bookings", bookingRoutes);
app.use("/api/bookings", bookingRoutes); // handles /api/bookings/all
app.use("/api/payments", paymentRoutes);
app.use("/payments", paymentRoutes);

app.use("/api/admin", adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
