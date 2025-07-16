const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  instructorName: {
    type: String,
    required: [true, 'Please provide instructor name'],
    trim: true,
    maxlength: [100, 'Instructor name cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide course price'],
    min: [0, 'Price cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course'
});

// Virtual for quizzes
courseSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'course'
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
