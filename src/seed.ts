import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Activity, ActivitySchema } from './modules/activities/schemas/activity.schema';
import { User, UserSchema } from './modules/auth/schemas/user.schema';

const UserModel = mongoose.model(User.name, UserSchema);
const ActivityModel = mongoose.model(Activity.name, ActivitySchema);

async function seed() {
  await mongoose.connect('mongodb+srv://user1:SfrAS1RAa2JHD8Ln@cluster0.3uvoybs.mongodb.net/ActiMate');

  console.log('Connected to MongoDB');

  await UserModel.deleteMany({});
  await ActivityModel.deleteMany({});

  // 🔐 hash password once and reuse
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await UserModel.insertMany([
    {
      name: 'Vivek Joshi',
      email: 'vivek@example.com',
      phone: '9990001111',
      password: hashedPassword,
      interests: ['Cricket', 'Travel', 'Gym'],
      joinedCount: 5,
      hostedCount: 2,
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9990001112',
      password: hashedPassword,
      interests: ['Badminton', 'Cycling'],
    },
    {
      name: 'Priya Mehta',
      email: 'priya@example.com',
      phone: '9990001113',
      password: hashedPassword,
      interests: ['Trekking', 'Yoga'],
    },
    {
      name: 'Arjun Verma',
      email: 'arjun@example.com',
      phone: '9990001114',
      password: hashedPassword,
      interests: ['Football', 'Gym'],
    },
    {
      name: 'Neha Kapoor',
      email: 'neha@example.com',
      phone: '9990001115',
      password: hashedPassword,
      interests: ['Travel', 'Photography'],
    },
  ]);

  const activities = [
    {
      title: 'Morning Cricket Match',
      category: 'Sports',
      location: 'Indirapuram Cricket Ground',
      time: 'Today 6:30 AM',
      participantsJoined: 3,
      maxParticipants: 6,
      price: 'Free',
      host: users[0]._id,
    },
    {
      title: 'Badminton Doubles',
      category: 'Sports',
      location: 'Noida Indoor Stadium',
      time: 'Today 7:30 PM',
      participantsJoined: 2,
      maxParticipants: 4,
      price: '₹100',
      host: users[1]._id,
    },
    {
      title: 'Weekend Trek',
      category: 'Adventure',
      location: 'Aravalli Hills',
      time: 'Sat 5:00 AM',
      participantsJoined: 4,
      maxParticipants: 8,
      price: 'Free',
      host: users[2]._id,
    },
    {
      title: 'Gym Partner Needed',
      category: 'Fitness',
      location: 'Anytime Fitness Noida',
      time: 'Tomorrow 6:00 AM',
      participantsJoined: 1,
      maxParticipants: 2,
      price: 'Free',
      host: users[3]._id,
    },
    {
      title: 'Football Practice',
      category: 'Sports',
      location: 'Sector 62 Football Ground',
      time: 'Today 8:00 PM',
      participantsJoined: 5,
      maxParticipants: 10,
      price: 'Free',
      host: users[3]._id,
    },
    {
      title: 'Sunrise Photography Walk',
      category: 'Travel',
      location: 'India Gate',
      time: 'Tomorrow 6:00 AM',
      participantsJoined: 2,
      maxParticipants: 6,
      price: 'Free',
      host: users[4]._id,
    },
    {
      title: 'Cycling Group Ride',
      category: 'Fitness',
      location: 'Yamuna Expressway',
      time: 'Sunday 5:30 AM',
      participantsJoined: 6,
      maxParticipants: 10,
      price: 'Free',
      host: users[1]._id,
    },
    {
      title: 'Study Group',
      category: 'Study',
      location: 'Noida Library',
      time: 'Today 4:00 PM',
      participantsJoined: 3,
      maxParticipants: 6,
      price: 'Free',
      host: users[0]._id,
    },
    {
      title: 'Evening Run',
      category: 'Fitness',
      location: 'City Park',
      time: 'Today 7:00 PM',
      participantsJoined: 2,
      maxParticipants: 5,
      price: 'Free',
      host: users[3]._id,
    },
    {
      title: 'Street Food Walk',
      category: 'Food',
      location: 'Chandni Chowk',
      time: 'Tonight 8:30 PM',
      participantsJoined: 4,
      maxParticipants: 8,
      price: '₹200',
      host: users[4]._id,
    },
  ];

  await ActivityModel.insertMany(activities);

  console.log('✅ Sample users and activities created!');
  process.exit();
}

seed();
