const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load Models
const User = require('./features/auth/user.model');
const Job = require('./features/jobs/job.model');
const Application = require('./features/applications/application.model');

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    } catch (err) {
        console.error(`Error: ${err.message}`.red);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany();
        await Job.deleteMany();
        await Application.deleteMany();
        console.log('Data Destroyed...'.red.inverse);

        // Create Employer
        const employerSalt = await bcrypt.genSalt(10);
        const employerPassword = await bcrypt.hash('123456', employerSalt);

        const employer = await User.create({
            name: 'Tech Corp Admin',
            email: 'employer@example.com',
            password: 'password123', // Will be hashed by pre-save hook if we pass it directly, but let's trust the model
            role: 'employer',
            company: 'Tech Corp',
            companyDescription: 'Leading innovator in tech solutions.',
            industry: 'Technology',
            companySize: '100-500',
            website: 'https://techcorp.com',
            address: '123 Tech Lane, Silicon Valley, CA'
        });

        console.log('Employer Created'.green);

        // Create Candidate
        const candidate = await User.create({
            name: 'John Doe',
            email: 'candidate@example.com',
            password: 'password123',
            role: 'candidate',
            bio: 'Passionate Full Stack Developer with 5 years of experience.',
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
            experience: '5 Years',
            education: 'BS in Computer Science',
            resume: 'https://example.com/resume.pdf',
            phone: '555-0123',
            address: '456 Coder Way, Austin, TX'
        });

        console.log('Candidate Created'.green);

        // Create Jobs
        const jobs = await Job.create([
            {
                title: 'Senior React Developer',
                company: 'Tech Corp',
                location: 'Remote',
                type: 'Full-time',
                salary: '$120k - $150k',
                description: 'We are looking for an experienced React developer to lead our frontend team.',
                requirements: ['5+ years React', 'Redux', 'TypeScript'],
                qualifications: ['BS CS or equivalent'],
                responsibilities: ['Architect frontend', 'Mentor juniors'],
                postedBy: employer._id
            },
            {
                title: 'Backend Engineer (Node.js)',
                company: 'Tech Corp',
                location: 'New York, NY',
                type: 'Full-time',
                salary: '$130k - $160k',
                description: 'Join our backend team to build scalable APIs.',
                requirements: ['Node.js', 'MongoDB', 'Microservices'],
                qualifications: ['BS CS', 'AWS Certified'],
                responsibilities: ['API Design', 'Database Optimization'],
                postedBy: employer._id
            },
            {
                title: 'UI/UX Designer',
                company: 'Tech Corp',
                location: 'San Francisco, CA',
                type: 'Contract',
                salary: '$80/hr',
                description: 'Design beautiful interfaces for our next gen products.',
                requirements: ['Figma', 'Adobe XD', 'Prototyping'],
                qualifications: ['Portfolio required'],
                responsibilities: ['User Research', 'Wireframing', 'High-fi mockups'],
                postedBy: employer._id
            }
        ]);

        console.log('Jobs Created'.green);

        // Create Application
        await Application.create({
            job: jobs[0]._id, // Applied to React Developer
            applicant: candidate._id,
            resume: 'https://example.com/resume.pdf',
            coverLetter: 'I am the perfect fit for this role!',
            status: 'pending'
        });

        console.log('Application Created'.green);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

seedData();
