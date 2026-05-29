require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

const PANDIT_SERVICES = [
  'Wedding Puja', 'Griha Pravesh', 'Satyanarayan Katha', 'Havan',
  'Naamkaran', 'Janeu', 'Shradh', 'Temple Puja',
];
const NAU_SERVICES = ['Mundan', 'Wedding Ritual Grooming', 'Traditional Ceremony Support'];

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Provider.deleteMany({}), Booking.deleteMany({})]);

  const admin = await User.create({
    mobile: '9999999999',
    name: 'PujaSetu Admin',
    role: 'admin',
    isVerified: true,
  });

  const customer = await User.create({
    mobile: '9876543210',
    name: 'Rahul Sharma',
    role: 'customer',
    location: { state: 'Maharashtra', district: 'Mumbai City', city: 'Mumbai' },
  });

  const panditUser = await User.create({
    mobile: '9123456780',
    name: 'Pandit Ram Shastri',
    role: 'pandit',
    isVerified: true,
  });

  const nauUser = await User.create({
    mobile: '9123456781',
    name: 'Nau Krishna Das',
    role: 'nau',
    isVerified: true,
  });

  const pandit = await Provider.create({
    user: panditUser._id,
    providerType: 'pandit',
    fullName: 'Pandit Ram Shastri',
    mobile: panditUser.mobile,
    experienceYears: 15,
    languages: ['Hindi', 'Sanskrit', 'Marathi'],
    services: PANDIT_SERVICES,
    charges: { hourly: 1500, halfDay: 5000, fullDay: 8000, multiDay: 7000 },
    servicePricing: [
      { serviceName: 'Wedding Puja', hourly: 2000, halfDay: 6000, fullDay: 12000, multiDay: 10000 },
      { serviceName: 'Satyanarayan Katha', hourly: 1500, halfDay: 5000, fullDay: 8000, multiDay: 7000 },
    ],
    location: {
      state: 'Maharashtra',
      district: 'Mumbai City',
      city: 'Mumbai',
      coordinates: { type: 'Point', coordinates: [72.8777, 19.076] },
    },
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    verificationStatus: 'approved',
    bio: 'Vedic scholar with 15+ years experience in wedding and griha pravesh ceremonies.',
    availability: [
      { date: new Date(), isAvailable: true, slots: [{ start: '06:00', end: '20:00' }] },
    ],
  });

  const nau = await Provider.create({
    user: nauUser._id,
    providerType: 'nau',
    fullName: 'Nau Krishna Das',
    mobile: nauUser.mobile,
    experienceYears: 12,
    languages: ['Hindi', 'Marathi'],
    services: NAU_SERVICES,
    charges: { hourly: 800, halfDay: 2500, fullDay: 4000, multiDay: 3500 },
    location: {
      state: 'Maharashtra',
      district: 'Pune',
      city: 'Pune',
      coordinates: { type: 'Point', coordinates: [73.8567, 18.5204] },
    },
    rating: 4.6,
    reviewCount: 89,
    isVerified: true,
    verificationStatus: 'approved',
    bio: 'Traditional ceremony grooming specialist for mundan and weddings.',
  });

  await Booking.create({
    customer: customer._id,
    provider: pandit._id,
    bookingType: 'full_day',
    eventType: 'Satyanarayan Katha',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: '09:00',
    address: {
      line1: 'Flat 12, Shanti Apartments',
      city: 'Mumbai',
      state: 'Maharashtra',
      district: 'Mumbai City',
      pincode: '400001',
    },
    amount: 8000,
    advancePercent: 15,
    advanceAmount: 1200,
    remainingAmount: 6800,
    status: 'confirmed',
    payment: { advancePaid: true, receiptNumber: 'PS-SAMPLE-001' },
  });

  console.log('Seed complete!');
  console.log('Admin mobile: 9999999999 (OTP: 123456 in dev)');
  console.log('Customer: 9876543210');
  console.log('Pandit provider login: 9123456780');
  console.log('Nau provider login: 9123456781');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
