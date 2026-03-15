const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Please add a company name']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        required: [true, 'Please add job type (e.g., Full-time, Remote)'],
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
    },
    salary: {
        type: String,
        required: [true, 'Please add salary range']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    requirements: {
        type: [String],
        default: []
    },
    qualifications: {
        type: [String],
        default: [],
        required: [true, 'Please add qualifications']
    },
    responsibilities: {
        type: [String],
        default: [],
        required: [true, 'Please add responsibilities']
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for keyword search
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

// Add indexes for frequent filters
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });

module.exports = mongoose.model('Job', jobSchema);
