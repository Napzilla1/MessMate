const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Waste = require('./models/Waste');
const Menu = require('./models/Menu');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for advanced seeding');

    const hostel = 'Limbdi Hostel';
    
    const admin = await mongoose.model('User').findOne({ role: 'admin' });
    const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

    // 1. Seed 7 days of Waste Data
    const wastes = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const prepared = 120 + Math.floor(Math.random() * 40); // 120-160
      const wasted = 5 + Math.floor(Math.random() * 20); // 5-25
      const consumed = prepared - wasted;
      const percentage = (wasted / prepared) * 100;
      
      wastes.push({
        hostel,
        date: dateStr,
        meal: 'lunch',
        preparedKg: prepared,
        consumedKg: consumed,
        wastedKg: wasted,
        wastePercentage: percentage,
        recordedBy: adminId
      });
    }
    await Waste.deleteMany({ hostel });
    await Waste.insertMany(wastes);
    console.log('Seeded 7 days of waste data.');

    // 2. Seed a Menu for today
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = dayNames[new Date().getDay()];
    await Menu.findOneAndUpdate(
      { hostel, day: currentDayName },
      {
        breakfast: { items: ['Aloo Paratha', 'Curd', 'Tea'], special: null },
        lunch: { items: ['Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Roti'], special: 'Ice Cream' },
        dinner: { items: ['Veg Biryani', 'Raita', 'Gulab Jamun'], special: null },
      },
      { upsert: true }
    );
    console.log('Seeded menu for today.');

    // 3. Seed Attendance (Today and Tomorrow)
    const todayStr = new Date().toISOString().split('T')[0];
    const tomDate = new Date();
    tomDate.setDate(tomDate.getDate() + 1);
    const tomorrowStr = tomDate.toISOString().split('T')[0];

    await Attendance.deleteMany({ hostel });

    const attendanceRecords = [];
    // Generate 50 mock students
    for (let i = 1; i <= 50; i++) {
      const mockUserId = new mongoose.Types.ObjectId();
      
      // Today (some declared, some checked in)
      attendanceRecords.push({
        user: mockUserId,
        hostel,
        date: todayStr,
        breakfast: { declared: true, checkedIn: Math.random() > 0.2 },
        lunch: { declared: Math.random() > 0.1, checkedIn: Math.random() > 0.3 },
        dinner: { declared: true, checkedIn: false },
      });

      // Tomorrow (RSVPs only)
      attendanceRecords.push({
        user: mockUserId,
        hostel,
        date: tomorrowStr,
        breakfast: { declared: Math.random() > 0.3, checkedIn: false },
        lunch: { declared: Math.random() > 0.1, checkedIn: false },
        dinner: { declared: Math.random() > 0.2, checkedIn: false },
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Seeded attendance for today and tomorrow (50 students).');

    console.log('Seeding complete! You can now use the AI Assistant.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
