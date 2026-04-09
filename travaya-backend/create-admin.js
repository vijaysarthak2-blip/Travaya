require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const dns = require("dns");
dns.setServers(['8.8.8.8']);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB.");

    const email = "vijaysarthak2@gmail.com";
    const password = "Spiderweb@250";

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log("User found. Promoting to Admin...");
      user.role = "admin";
      user.isEmailVerified = true;
      user.password = bcrypt.hashSync(password, 12);
      await user.save();
      console.log("User updated successfully to Admin!");
    } else {
      console.log("User not found. Creating new Admin user...");
      user = new User({
        fullName: "System Admin",
        email: email,
        password: bcrypt.hashSync(password, 12),
        role: "admin",
        isEmailVerified: true
      });
      await user.save();
      console.log("Admin User created successfully!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating/updating admin:", error);
    process.exit(1);
  }
};

createAdmin();
