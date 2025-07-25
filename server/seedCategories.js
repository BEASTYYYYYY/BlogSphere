// seedCategories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
    { name: 'Technology', popularity: 98 },
    { name: 'Health', popularity: 86 },
    { name: 'Finance', popularity: 73 },
    { name: 'Education', popularity: 64 },
    { name: 'Lifestyle', popularity: 88 },
    { name: 'Travel', popularity: 75 },
    { name: 'Food', popularity: 80 },
    { name: 'Fitness', popularity: 70 },
    { name: 'Fashion', popularity: 65 },
    { name: 'Gaming', popularity: 90 },
    { name: 'Photography', popularity: 60 },
    { name: 'Science', popularity: 78 },
    { name: 'Business', popularity: 82 },
    { name: 'Politics', popularity: 55 },
    { name: 'Spirituality', popularity: 52 },
    { name: 'Movies', popularity: 77 },
    { name: 'Books', popularity: 67 },
    { name: 'Art', popularity: 69 },
    { name: 'Music', popularity: 84 },
    { name: 'Parenting', popularity: 59 },
    { name: 'Relationships', popularity: 61 },
    { name: 'History', popularity: 49 },
    { name: 'Sports', popularity: 85 },
    { name: 'Environment', popularity: 58 },
    { name: 'Productivity', popularity: 66 },
    { name: 'Startups', popularity: 71 },
    { name: 'Coding', popularity: 91 },
    { name: 'AI & ML', popularity: 95 },
    { name: 'Web Development', popularity: 89 },
    { name: 'Mental Health', popularity: 83 },
    { name: 'Photography Tips', popularity: 57 },
    { name: 'Marketing', popularity: 74 },
    { name: 'Cryptocurrency', popularity: 68 },
    { name: 'Design', popularity: 62 },
    { name: 'UX/UI', popularity: 63 },
    { name: 'Comics', popularity: 54 },
    { name: 'Languages', popularity: 53 },
    { name: 'DIY Projects', popularity: 56 },
    { name: 'Nature', popularity: 50 },
    { name: 'Career', popularity: 76 }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Category.deleteMany();
        await Category.insertMany(categories);
        console.log('✅ Categories seeded successfully');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding categories:', err);
        process.exit(1);
    }
};

seedCategories();
