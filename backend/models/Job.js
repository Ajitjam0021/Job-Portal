const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyLogo: String,
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Legal', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  
  experience: {
    min: Number,
    max: Number,
    level: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    }
  },
  
  benefits: [String],
  
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  
  views: {
    type: Number,
    default: 0
  },
  
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for search
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ location: 1, type: 1, category: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);