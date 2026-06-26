const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        name: 'Manager Ramesh',
        email: 'manager@iitbhu.ac.in',
        password: 'password123',
        role: 'manager',
        hostel: 'Limbdi Hostel'
      },
      {
        name: 'Admin Priya',
        email: 'admin@iitbhu.ac.in',
        password: 'password123',
        role: 'admin'
      }
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        // password hashing is handled by pre-save hook in User model
        await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        console.log(`${u.role} already exists: ${u.email}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
