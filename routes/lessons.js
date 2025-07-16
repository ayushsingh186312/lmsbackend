const express = require('express');
const { body, validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin only)
router.post('/:courseId/lessons', protect, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Lesson title must be between 3 and 100 characters'),
  body('videoUrl')
    .isURL()
    .withMessage('Please provide a valid video URL'),
  body('resourceLinks')
    .optional()
    .isArray()
    .withMessage('Resource links must be an array'),
  body('resourceLinks.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Resource title must be between 1 and 100 characters'),
  body('resourceLinks.*.url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid resource URL'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('Order must be a number'),
  body('duration')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Duration must be a positive number')
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
    const { title, videoUrl, resourceLinks, order, duration } = req.body;

    // Check if course exists
    const course = await Course.findOne({ _id: courseId, isActive: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If no order specified, set it to the next available order
    let lessonOrder = order;
    if (!lessonOrder) {
      const lastLesson = await Lesson.findOne({ course: courseId })
        .sort({ order: -1 })
        .select('order');
      lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
    }

    // Create lesson
    const lesson = await Lesson.create({
      title,
      videoUrl,
      resourceLinks: resourceLinks || [],
      course: courseId,
      order: lessonOrder,
      duration
    });

    res.status(201).json({
      success: true,
      data: {
        lesson
      }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lesson creation'
    });
  }
});

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Public
router.get('/:courseId/lessons', async (req, res) => {
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

    // Get lessons for this course
    const lessons = await Lesson.find({ 
      course: courseId, 
      isActive: true 
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: {
        lessons
      }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public
router.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('course', 'title instructorName');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        lesson
      }
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Admin only)
router.put('/lessons/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Lesson title must be between 3 and 100 characters'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid video URL'),
  body('resourceLinks')
    .optional()
    .isArray()
    .withMessage('Resource links must be an array'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('Order must be a number'),
  body('duration')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Duration must be a positive number')
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

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const fieldsToUpdate = {};
    const { title, videoUrl, resourceLinks, order, duration } = req.body;

    if (title) fieldsToUpdate.title = title;
    if (videoUrl) fieldsToUpdate.videoUrl = videoUrl;
    if (resourceLinks) fieldsToUpdate.resourceLinks = resourceLinks;
    if (order !== undefined) fieldsToUpdate.order = order;
    if (duration !== undefined) fieldsToUpdate.duration = duration;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        lesson: updatedLesson
      }
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Admin only)
router.delete('/lessons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Soft delete by setting isActive to false
    lesson.isActive = false;
    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
