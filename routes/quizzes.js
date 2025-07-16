const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Add quiz to course
// @route   POST /api/courses/:courseId/quizzes
// @access  Private (Admin only)
router.post('/:courseId/quizzes', protect, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Quiz title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Quiz description cannot exceed 500 characters'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  body('questions.*.text')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Question text must be between 3 and 500 characters'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  body('questions.*.options.*.text')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Option text must be between 1 and 200 characters'),
  body('timeLimit')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Time limit must be at least 1 minute'),
  body('passingScore')
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Maximum attempts must be at least 1')
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

    const { courseId } = req.params;
    const { title, description, questions, timeLimit, passingScore, maxAttempts, order } = req.body;

    // Check if course exists
    const course = await Course.findOne({ _id: courseId, isActive: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate questions - each must have exactly one correct answer
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const correctAnswers = question.options.filter(opt => opt.isCorrect);
      
      if (correctAnswers.length !== 1) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have exactly one correct answer`
        });
      }
    }

    // If no order specified, set it to the next available order
    let quizOrder = order;
    if (!quizOrder) {
      const lastQuiz = await Quiz.findOne({ course: courseId })
        .sort({ order: -1 })
        .select('order');
      quizOrder = lastQuiz ? lastQuiz.order + 1 : 1;
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      questions,
      course: courseId,
      timeLimit,
      passingScore,
      maxAttempts,
      order: quizOrder
    });

    res.status(201).json({
      success: true,
      data: {
        quiz
      }
    });

  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during quiz creation'
    });
  }
});

// @desc    Get all quizzes for a course
// @route   GET /api/courses/:courseId/quizzes
// @access  Public
router.get('/:courseId/quizzes', async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findOne({ _id: courseId, isActive: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get quizzes for this course (hide correct answers for security)
    const quizzes = await Quiz.find({ 
      course: courseId, 
      isActive: true 
    })
    .select('-questions.options.isCorrect') // Hide correct answers
    .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: {
        quizzes
      }
    });

  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single quiz (for taking quiz)
// @route   GET /api/quizzes/:id
// @access  Private (Students and above)
router.get('/quizzes/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.id, 
      isActive: true 
    })
    .select('-questions.options.isCorrect') // Hide correct answers
    .populate('course', 'title instructorName');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get quiz with answers (for admin only)
// @route   GET /api/quizzes/:id/admin
// @access  Private (Admin only)
router.get('/quizzes/:id/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('course', 'title instructorName');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin only)
router.put('/quizzes/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Quiz title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Quiz description cannot exceed 500 characters'),
  body('questions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  body('timeLimit')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Time limit must be at least 1 minute'),
  body('passingScore')
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Maximum attempts must be at least 1')
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

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const fieldsToUpdate = {};
    const { title, description, questions, timeLimit, passingScore, maxAttempts, order } = req.body;

    if (title) fieldsToUpdate.title = title;
    if (description) fieldsToUpdate.description = description;
    if (timeLimit !== undefined) fieldsToUpdate.timeLimit = timeLimit;
    if (passingScore !== undefined) fieldsToUpdate.passingScore = passingScore;
    if (maxAttempts !== undefined) fieldsToUpdate.maxAttempts = maxAttempts;
    if (order !== undefined) fieldsToUpdate.order = order;

    if (questions) {
      // Validate questions - each must have exactly one correct answer
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const correctAnswers = question.options.filter(opt => opt.isCorrect);
        
        if (correctAnswers.length !== 1) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have exactly one correct answer`
          });
        }
      }
      fieldsToUpdate.questions = questions;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        quiz: updatedQuiz
      }
    });

  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin only)
router.delete('/quizzes/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Soft delete by setting isActive to false
    quiz.isActive = false;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
