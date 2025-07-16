const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  quizAttempts: [{
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    answers: [{
      questionId: mongoose.Schema.ObjectId,
      selectedOption: Number,
      isCorrect: Boolean
    }],
    attemptDate: {
      type: Date,
      default: Date.now
    },
    passed: {
      type: Boolean,
      default: false
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String
  }
});

// Ensure a student can only enroll once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Calculate progress before saving
enrollmentSchema.pre('save', async function(next) {
  if (this.isModified('completedLessons')) {
    try {
      const Course = mongoose.model('Course');
      const Lesson = mongoose.model('Lesson');
      
      const course = await Course.findById(this.course);
      const totalLessons = await Lesson.countDocuments({ course: this.course, isActive: true });
      
      if (totalLessons > 0) {
        this.progress = Math.round((this.completedLessons.length / totalLessons) * 100);
        
        // Mark as completed if all lessons are done
        if (this.progress === 100 && !this.isCompleted) {
          this.isCompleted = true;
          this.completionDate = new Date();
        }
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
