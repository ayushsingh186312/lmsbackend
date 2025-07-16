const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Students)
router.post('/', protect, [
  body('courseId')
    .isMongoId()
    .withMessage('Please provide a valid course ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.body;
    const studentId = req.user.id;

    // Check if course exists and is active
    const course = await Course.findOne({ _id: courseId, isActive: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment
      }
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during enrollment'
    });
  }
});

// @desc    Get student's enrollments
// @route   GET /api/enrollments
// @access  Private (Students)
router.get('/', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id
    })
    .populate('course', 'title description instructorName price')
    .sort({ enrollmentDate: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: {
        enrollments
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single enrollment details
// @route   GET /api/enrollments/:id
// @access  Private (Students - own enrollments only)
router.get('/:id', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course', 'title description instructorName price')
      .populate('completedLessons.lesson', 'title order');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enrollment
      }
    });

  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark lesson as completed
// @route   POST /api/enrollments/:id/lessons/:lessonId/complete
// @access  Private (Students)
router.post('/:id/lessons/:lessonId/complete', protect, async (req, res) => {
  try {
    const { id: enrollmentId, lessonId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    // Check if lesson exists and belongs to the course
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: enrollment.course,
      isActive: true
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if lesson is already completed
    const alreadyCompleted = enrollment.completedLessons.some(
      cl => cl.lesson.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Lesson already marked as completed'
      });
    }

    // Add lesson to completed lessons
    enrollment.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date()
    });

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        enrollment
      }
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Submit quiz attempt
// @route   POST /api/enrollments/:id/quizzes/:quizId/attempt
// @access  Private (Students)
router.post('/:id/quizzes/:quizId/attempt', protect, [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('answers.*.selectedOption')
    .isNumeric()
    .withMessage('Selected option must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id: enrollmentId, quizId } = req.params;
    const { answers } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    // Get quiz with correct answers
    const quiz = await Quiz.findOne({
      _id: quizId,
      course: enrollment.course,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if student has reached maximum attempts
    const previousAttempts = enrollment.quizAttempts.filter(
      attempt => attempt.quiz.toString() === quizId
    );

    if (previousAttempts.length >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
      });
    }

    // Validate answers and calculate score
    let correctAnswers = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) {
        return res.status(400).json({
          success: false,
          message: `Question ${answer.questionId} not found in quiz`
        });
      }

      const selectedOption = question.options[answer.selectedOption];
      if (!selectedOption) {
        return res.status(400).json({
          success: false,
          message: `Invalid option selected for question ${answer.questionId}`
        });
      }

      const isCorrect = selectedOption.isCorrect;
      if (isCorrect) {
        correctAnswers++;
      }

      processedAnswers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect
      });
    }

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Add quiz attempt to enrollment
    enrollment.quizAttempts.push({
      quiz: quizId,
      score,
      answers: processedAnswers,
      attemptDate: new Date(),
      passed
    });

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore,
        attemptsRemaining: quiz.maxAttempts - (previousAttempts.length + 1)
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all enrollments (Admin only)
// @route   GET /api/enrollments/admin
// @access  Private (Admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, course, student } = req.query;
    
    // Build query
    const query = {};
    
    if (course) {
      query.course = course;
    }
    
    if (student) {
      query.student = student;
    }

    // Execute query with pagination
    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title instructorName')
      .sort({ enrollmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        enrollments
      }
    });

  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
