const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get detailed progress report for student
// @route   GET /api/progress/report
// @access  Private (Students)
router.get('/report', protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { student: req.user.id };
    
    if (courseId) {
      query.course = courseId;
    }

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title description instructorName')
      .populate('completedLessons.lesson', 'title duration order')
      .populate('quizAttempts.quiz', 'title passingScore maxAttempts');

    const progressReport = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      
      // Get total lessons and quizzes for this course
      const totalLessons = await Lesson.countDocuments({ course: course._id });
      const totalQuizzes = await Quiz.countDocuments({ course: course._id });
      
      const completedLessonsCount = enrollment.completedLessons.length;
      
      // Calculate quiz progress
      const quizProgress = enrollment.quizAttempts.reduce((acc, attempt) => {
        const quizId = attempt.quiz._id.toString();
        if (!acc[quizId] || attempt.score > acc[quizId].bestScore) {
          acc[quizId] = {
            bestScore: attempt.score,
            passed: attempt.score >= attempt.quiz.passingScore,
            attempts: enrollment.quizAttempts.filter(a => a.quiz._id.toString() === quizId).length
          };
        }
        return acc;
      }, {});

      const passedQuizzes = Object.values(quizProgress).filter(q => q.passed).length;
      
      // Calculate overall progress
      const lessonProgressPercent = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
      const quizProgressPercent = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;
      const overallProgress = totalLessons > 0 || totalQuizzes > 0 
        ? ((lessonProgressPercent + quizProgressPercent) / 2)
        : 0;

      // Calculate time spent (in minutes)
      const timeSpent = enrollment.completedLessons.reduce((total, lesson) => {
        return total + (lesson.lesson.duration || 0);
      }, 0);

      progressReport.push({
        enrollmentId: enrollment._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructorName: course.instructorName
        },
        progress: {
          overall: Math.round(overallProgress * 100) / 100,
          lessons: Math.round(lessonProgressPercent * 100) / 100,
          quizzes: Math.round(quizProgressPercent * 100) / 100
        },
        stats: {
          totalLessons,
          completedLessons: completedLessonsCount,
          totalQuizzes,
          passedQuizzes,
          timeSpent,
          enrolledAt: enrollment.enrolledAt,
          lastActivity: enrollment.lastActivity,
          completedAt: enrollment.completedAt
        },
        recentActivity: enrollment.completedLessons
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 5)
          .map(lesson => ({
            type: 'lesson',
            title: lesson.lesson.title,
            completedAt: lesson.completedAt
          }))
          .concat(
            enrollment.quizAttempts
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
              .slice(0, 3)
              .map(attempt => ({
                type: 'quiz',
                title: attempt.quiz.title,
                score: attempt.score,
                passed: attempt.score >= attempt.quiz.passingScore,
                submittedAt: attempt.submittedAt
              }))
          )
          .sort((a, b) => new Date(b.completedAt || b.submittedAt) - new Date(a.completedAt || a.submittedAt))
          .slice(0, 5)
      });
    }

    res.status(200).json({
      success: true,
      count: progressReport.length,
      data: progressReport
    });

  } catch (error) {
    console.error('Progress report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get quiz scores summary for student
// @route   GET /api/progress/quiz-scores
// @access  Private (Students)
router.get('/quiz-scores', protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { student: req.user.id };
    
    if (courseId) {
      query.course = courseId;
    }

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title')
      .populate('quizAttempts.quiz', 'title passingScore maxAttempts');

    const quizScores = [];

    for (const enrollment of enrollments) {
      const quizMap = new Map();

      enrollment.quizAttempts.forEach(attempt => {
        const quizId = attempt.quiz._id.toString();
        
        if (!quizMap.has(quizId)) {
          quizMap.set(quizId, {
            quizId: attempt.quiz._id,
            quizTitle: attempt.quiz.title,
            courseTitle: enrollment.course.title,
            passingScore: attempt.quiz.passingScore,
            maxAttempts: attempt.quiz.maxAttempts,
            attempts: [],
            bestScore: 0,
            averageScore: 0,
            passed: false,
            attemptsUsed: 0
          });
        }

        const quizData = quizMap.get(quizId);
        quizData.attempts.push({
          attemptNumber: quizData.attempts.length + 1,
          score: attempt.score,
          submittedAt: attempt.submittedAt,
          timeTaken: attempt.timeTaken,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions
        });

        quizData.attemptsUsed = quizData.attempts.length;
        quizData.bestScore = Math.max(quizData.bestScore, attempt.score);
        quizData.passed = quizData.bestScore >= attempt.quiz.passingScore;
        
        const totalScore = quizData.attempts.reduce((sum, att) => sum + att.score, 0);
        quizData.averageScore = Math.round((totalScore / quizData.attempts.length) * 100) / 100;
      });

      quizScores.push(...Array.from(quizMap.values()));
    }

    res.status(200).json({
      success: true,
      count: quizScores.length,
      data: quizScores
    });

  } catch (error) {
    console.error('Quiz scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get learning analytics for student
// @route   GET /api/progress/analytics
// @access  Private (Students)
router.get('/analytics', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title')
      .populate('completedLessons.lesson', 'duration')
      .populate('quizAttempts.quiz', 'passingScore');

    const analytics = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.completedAt).length,
      inProgressCourses: enrollments.filter(e => !e.completedAt).length,
      totalLessons: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      passedQuizzes: 0,
      totalTimeSpent: 0,
      averageQuizScore: 0,
      streakDays: 0,
      monthlyProgress: {},
      courseProgress: []
    };

    let totalQuizScore = 0;
    let quizCount = 0;
    const activityDates = new Set();

    for (const enrollment of enrollments) {
      // Count lessons and quizzes
      const totalCourseLessons = await Lesson.countDocuments({ course: enrollment.course._id });
      const totalCourseQuizzes = await Quiz.countDocuments({ course: enrollment.course._id });
      
      analytics.totalLessons += totalCourseLessons;
      analytics.completedLessons += enrollment.completedLessons.length;
      analytics.totalQuizzes += totalCourseQuizzes;

      // Calculate time spent
      const timeSpent = enrollment.completedLessons.reduce((total, lesson) => {
        const date = new Date(lesson.completedAt).toDateString();
        activityDates.add(date);
        return total + (lesson.lesson.duration || 0);
      }, 0);
      analytics.totalTimeSpent += timeSpent;

      // Quiz analytics
      const quizProgress = enrollment.quizAttempts.reduce((acc, attempt) => {
        const quizId = attempt.quiz._id.toString();
        const date = new Date(attempt.submittedAt).toDateString();
        activityDates.add(date);
        
        if (!acc[quizId] || attempt.score > acc[quizId]) {
          acc[quizId] = attempt.score;
        }
        return acc;
      }, {});

      const coursePassedQuizzes = Object.entries(quizProgress).filter(([quizId, score]) => {
        const quiz = enrollment.quizAttempts.find(a => a.quiz._id.toString() === quizId)?.quiz;
        return quiz && score >= quiz.passingScore;
      }).length;

      analytics.passedQuizzes += coursePassedQuizzes;

      // Calculate average quiz scores
      enrollment.quizAttempts.forEach(attempt => {
        totalQuizScore += attempt.score;
        quizCount++;
      });

      // Course progress
      const courseProgress = totalCourseLessons > 0 || totalCourseQuizzes > 0
        ? ((enrollment.completedLessons.length / totalCourseLessons * 50) + 
           (coursePassedQuizzes / totalCourseQuizzes * 50))
        : 0;

      analytics.courseProgress.push({
        courseId: enrollment.course._id,
        courseTitle: enrollment.course.title,
        progress: Math.round(courseProgress * 100) / 100,
        timeSpent,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt
      });
    }

    analytics.averageQuizScore = quizCount > 0 ? Math.round((totalQuizScore / quizCount) * 100) / 100 : 0;

    // Calculate learning streak
    const sortedDates = Array.from(activityDates).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of sortedDates) {
      const activityDate = new Date(dateStr);
      const diffDays = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak + 1) {
        break;
      }
    }
    analytics.streakDays = streak;

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
