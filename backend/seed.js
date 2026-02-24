/**
 * Seed Data - Create demo users and events with updated schema
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding database...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Registration.deleteMany({});

        // Also reset the counter
        const Counter = mongoose.models.Counter || mongoose.model('Counter');
        await Counter.deleteMany({});

        // Passwords (Plain Text)
        const adminPass = 'admin123';
        const studentPass = 'student123';
        const student2Pass = 'student123';

        // Create users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@college.edu',
            password: adminPass,
            role: 'admin'
        });

        const student = await User.create({
            name: 'Rahul Kumar',
            email: 'rahul@student.edu',
            password: studentPass,
            role: 'student'
        });

        const student2 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@student.edu',
            password: student2Pass,
            role: 'student'
        });

        console.log(`✅ Users seeded (Student IDs: ${student.studentId}, ${student2.studentId})`);

        // Create events
        const events = await Event.insertMany([
            {
                title: 'Code Sprint 2026',
                description: 'A 24-hour hackathon to build innovative solutions for real-world problems.',
                date: new Date('2026-03-15'),
                category: 'hackathon',
                type: 'our_college',
                venue: 'CS Lab Block A',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 50,
                booked_slots: 0,
                rules: ['Team of 2-4', 'Bring your own laptop', 'No pre-built projects'],
                teamSize: 4,
                prizeDetails: '1st Prize: ₹50,000 | 2nd Prize: ₹30,000 | 3rd Prize: ₹20,000',
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Web Dev Showdown',
                description: 'Build a full-stack web app in 12 hours. Theme revealed on the spot.',
                date: new Date('2026-03-25'),
                category: 'hackathon',
                type: 'our_college',
                venue: 'Innovation Hub',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 30,
                booked_slots: 0,
                rules: ['Solo or Team of 2', 'Any tech stack allowed'],
                teamSize: 2,
                prizeDetails: '1st Prize: ₹25,000',
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'AI Innovation Challenge',
                description: 'Build AI/ML solutions for healthcare and sustainability.',
                date: new Date('2026-04-10'),
                category: 'hackathon',
                type: 'other_college',
                venue: 'Virtual (Online)',
                college: 'IIT Hyderabad',
                isOwnCollege: false,
                total_slots: 100,
                booked_slots: 0,
                rules: ['Open to all colleges', 'Team of 1-3'],
                teamSize: 3,
                prizeDetails: '1st Prize: ₹1,00,000',
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Blockchain Buildathon',
                description: 'Create decentralized applications using blockchain technology.',
                date: new Date('2026-04-20'),
                category: 'hackathon',
                type: 'other_college',
                venue: 'Tech Park, Bangalore',
                college: 'IIIT Bangalore',
                isOwnCollege: false,
                total_slots: 60,
                booked_slots: 0,
                rules: ['Any blockchain platform', 'Team of 2-5'],
                teamSize: 5,
                prizeDetails: '1st Prize: ₹75,000',
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Cricket Tournament',
                description: 'Annual inter-department cricket tournament with exciting matches.',
                date: new Date('2026-03-20'),
                category: 'game',
                type: 'our_college',
                venue: 'College Ground',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 80,
                booked_slots: 0,
                subcategory: 'Cricket',
                rules: ['Teams of 11', 'T20 format'],
                teamSize: 11,
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Table Tennis Championship',
                description: 'Singles and doubles table tennis tournament.',
                date: new Date('2026-03-28'),
                category: 'game',
                type: 'our_college',
                venue: 'Indoor Sports Complex',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 32,
                booked_slots: 0,
                subcategory: 'Table Tennis',
                rules: ['Singles and Doubles', 'Best of 5 sets'],
                teamSize: 1,
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Badminton Championship',
                description: 'Inter-college badminton championship — singles and doubles categories.',
                date: new Date('2026-04-05'),
                category: 'game',
                type: 'other_college',
                venue: 'Sports Complex, IIT Delhi',
                college: 'IIT Delhi',
                isOwnCollege: false,
                total_slots: 40,
                booked_slots: 0,
                subcategory: 'Badminton',
                rules: ['Open for all years'],
                teamSize: 2,
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Inter-College Football League',
                description: 'Compete against top colleges in a knockout football tournament.',
                date: new Date('2026-04-15'),
                category: 'game',
                type: 'other_college',
                venue: 'Jawaharlal Nehru Stadium',
                college: 'Sports Authority',
                isOwnCollege: false,
                total_slots: 60,
                booked_slots: 0,
                subcategory: 'Football',
                rules: ['Team of 11+3 subs', 'FIFA rules'],
                teamSize: 14,
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Thunder Thursday - Cultural Night',
                description: 'Singing, dancing, and cultural performances by students.',
                date: new Date('2026-03-27'),
                category: 'celebration',
                type: 'our_college',
                venue: 'Main Auditorium',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 200,
                booked_slots: 0,
                subcategory: 'Singing',
                createdBy: admin._id,
                visible: true
            },
            {
                title: 'Annual Day Celebration',
                description: 'Grand annual day with performances, awards, and celebrations.',
                date: new Date('2026-05-01'),
                category: 'celebration',
                type: 'our_college',
                venue: 'Central Hall',
                college: 'National Institute of Technology',
                isOwnCollege: true,
                total_slots: 300,
                booked_slots: 0,
                subcategory: 'Cultural',
                createdBy: admin._id,
                visible: true
            }
        ]);

        console.log(`✅ ${events.length} events seeded`);
        console.log('\n📋 Demo Credentials:');
        console.log('  Admin:    admin@college.edu / admin123');
        console.log(`  Student:  rahul@student.edu / student123 (ID: ${student.studentId})`);
        console.log(`  Student:  priya@student.edu / student123 (ID: ${student2.studentId})`);
        console.log('\n✅ Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seedData();
