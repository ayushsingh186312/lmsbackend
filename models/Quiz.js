const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true,
    maxlength: [500, 'Question text cannot be more than 500 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Option text cannot be more than 200 characters']
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

// Validate that there's exactly one correct answer
questionSchema.pre('save', function(next) {
  const correctAnswers = this.options.filter(option => option.isCorrect);
  if (correctAnswers.length !== 1) {
    return next(new Error('Each question must have exactly one correct answer'));
  }
  next();
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [100, 'Quiz title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Quiz description cannot be more than 500 characters']
  },
  questions: [questionSchema],
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  timeLimit: {
    type: Number, // Time limit in minutes
    min: [1, 'Time limit must be at least 1 minute'],
    default: 30
  },
  passingScore: {
    type: Number, // Percentage required to pass
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot be more than 100'],
    default: 70
  },
  maxAttempts: {
    type: Number,
    min: [1, 'Maximum attempts must be at least 1'],
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
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
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that quiz has at least one question
quizSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    return next(new Error('Quiz must have at least one question'));
  }
  next();
});

// Index for efficient querying
quizSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
