require('dotenv').config();
const mongoose = require('mongoose');

// Need to match exactly what is in models/User
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('UserCheck', userSchema, 'users');

mongoose.connect(process.env.DB_URL).then(async () => {
  const email = 'sarthakvijay848@gmail.com';
  const user = await User.findOne({ email: email });
  if (user) {
    if (!user.isEmailVerified) {
      console.log('User found but not verified. Deleting rogue registration so they can sign up properly.');
      await User.deleteOne({ email: email });
      console.log('Deleted successfully.');
    } else {
      console.log('User is already verified in DB.');
    }
  } else {
    console.log('User not found in DB.');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
