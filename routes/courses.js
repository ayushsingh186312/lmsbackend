const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Course description must be between 10 and 1000 characters'),
  body('instructorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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

    const { title, description, instructorName, price } = req.body;

    // Check if course with same title already exists
    const existingCourse = await Course.findOne({ title: title.trim() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'A course with this title already exists'
      });
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      instructorName,
      price,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course creation'
    });
  }
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, instructor } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (instructor) {
      query.instructorName = { $regex: instructor, $options: 'i' };
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .select('title description instructorName price enrollmentCount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        courses
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single course with lessons and quizzes
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get lessons for this course
    const lessons = await Lesson.find({ 
      course: req.params.id, 
      isActive: true 
    }).sort({ order: 1 });

    // Get quizzes for this course
    const quizzes = await Quiz.find({ 
      course: req.params.id, 
      isActive: true 
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        course,
        lessons,
        quizzes
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Course description must be between 10 and 1000 characters'),
  body('instructorName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
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

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const fieldsToUpdate = {};
    const { title, description, instructorName, price } = req.body;

    if (title) fieldsToUpdate.title = title;
    if (description) fieldsToUpdate.description = description;
    if (instructorName) fieldsToUpdate.instructorName = instructorName;
    if (price !== undefined) fieldsToUpdate.price = price;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        course: updatedCourse
      }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Soft delete by setting isActive to false
    course.isActive = false;
    await course.save();

    // Also deactivate associated lessons and quizzes
    await Lesson.updateMany(
      { course: req.params.id },
      { isActive: false }
    );

    await Quiz.updateMany(
      { course: req.params.id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
