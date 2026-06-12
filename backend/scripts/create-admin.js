const mongoose = require('mongoose');
require('dotenv').config();
const { Admin } = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    await Admin.create({
      username: 'admin',
      email: 'admin@madamseun.com',
      password: 'adminpassword123',
      role: 'superadmin'
    });

    console.log('Admin user created successfully! Username: admin | Password: adminpassword123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
