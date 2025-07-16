const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [100, 'Lesson title cannot be more than 100 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please provide a video URL'],
    validate: {
  validator: function(v) {
    return /^https?:\/\/[\w\-\.]+\.[a-z]{2,6}(\/[\w\-\.~:\/?#[\]@!$&'()*+,;=%]*)?$/.test(v);
  },
  message: 'Please provide a valid video URL'
}

  },
  resourceLinks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Resource title cannot be more than 100 characters']
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
        },
        message: 'Please provide a valid resource URL'
      }
    }
  }],
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // Duration in minutes
    min: [0, 'Duration cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
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
lessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
