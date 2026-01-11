import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from './database.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@grovyn.io' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const admin = new User({
      name: 'Principal Architect',
      email: 'admin@grovyn.io',
      password: 'admin123', // Change this in production!
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@grovyn.io');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password in production!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
