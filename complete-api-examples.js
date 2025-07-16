// Complete API Test Examples for LMS Backend
// Use these examples with Postman, Thunder Client, or any HTTP client

const baseURL = 'http://localhost:5000/api';

console.log('=== LMS Backend Complete API Test Examples ===\n');

// First, you need to register an admin user and get JWT token
console.log('STEP 1: Register Admin User');
console.log('POST ' + baseURL + '/auth/register');
console.log('Content-Type: application/json\n');
console.log(JSON.stringify({
  name: "Admin User",
  email: "admin@lms.com",
  password: "Admin123",
  role: "admin"
}, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

console.log('STEP 2: Login Admin User (Copy the JWT token from response)');
console.log('POST ' + baseURL + '/auth/login');
console.log('Content-Type: application/json\n');
console.log(JSON.stringify({
  email: "admin@lms.com",
  password: "Admin123"
}, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

// COURSE MANAGEMENT (Admin only)
console.log('=== COURSE MANAGEMENT (Admin Only) ===\n');

console.log('1. Create a Course:');
console.log('POST ' + baseURL + '/courses');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "JavaScript Fundamentals",
  description: "Learn the basics of JavaScript programming language including variables, functions, arrays, and objects.",
  instructorName: "John Smith",
  price: 99.99
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('2. Get All Courses (Public):');
console.log('GET ' + baseURL + '/courses');
console.log('Query parameters: ?page=1&limit=10&search=javascript&instructor=john');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('3. Get Single Course with Lessons and Quizzes (Public):');
console.log('GET ' + baseURL + '/courses/COURSE_ID');//6876bb61f9e6700e9b25a7da

console.log('\n' + '-'.repeat(40) + '\n');

console.log('4. Update Course (Admin only):');
console.log('PUT ' + baseURL + '/courses/COURSE_ID');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "Advanced JavaScript",
  price: 149.99
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('5. Delete Course (Admin only):');
console.log('DELETE ' + baseURL + '/courses/COURSE_ID');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(60) + '\n');

// LESSON MANAGEMENT (Admin only)
console.log('=== LESSON MANAGEMENT (Admin Only) ===\n');

console.log('1. Add Lesson to Course:');
console.log('POST ' + baseURL + '/courses/COURSE_ID/lessons');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "Introduction to Variables",
  videoUrl: "https://youtube.com/watch?v=example1",
  resourceLinks: [
    {
      title: "MDN Variables Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Variables"
    },
    {
      title: "Practice Exercises",
      url: "https://codepen.io/example"
    }
  ],
  order: 1,
  duration: 25
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('2. Get All Lessons for Course (Public):');
console.log('GET ' + baseURL + '/courses/COURSE_ID/lessons');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('3. Get Single Lesson (Public):');
console.log('GET ' + baseURL + '/lessons/LESSON_ID');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('4. Update Lesson (Admin only):');
console.log('PUT ' + baseURL + '/lessons/LESSON_ID');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "Variables and Data Types",
  duration: 30
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('5. Delete Lesson (Admin only):');
console.log('DELETE ' + baseURL + '/lessons/LESSON_ID');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(60) + '\n');

// QUIZ MANAGEMENT (Admin only)
console.log('=== QUIZ MANAGEMENT (Admin Only) ===\n');

console.log('1. Add Quiz to Course:');
console.log('POST ' + baseURL + '/courses/COURSE_ID/quizzes');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "Variables Quiz",
  description: "Test your knowledge of JavaScript variables",
  questions: [
    {
      text: "Which keyword is used to declare a variable in JavaScript?",
      options: [
        { text: "var", isCorrect: true },
        { text: "variable", isCorrect: false },
        { text: "v", isCorrect: false },
        { text: "declare", isCorrect: false }
      ],
      order: 1
    },
    {
      text: "What is the correct way to declare a constant in JavaScript?",
      options: [
        { text: "var x = 5", isCorrect: false },
        { text: "let x = 5", isCorrect: false },
        { text: "const x = 5", isCorrect: true },
        { text: "constant x = 5", isCorrect: false }
      ],
      order: 2
    }
  ],
  timeLimit: 15,
  passingScore: 75,
  maxAttempts: 3,
  order: 1
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('2. Get All Quizzes for Course (Public - answers hidden):');
console.log('GET ' + baseURL + '/courses/COURSE_ID/quizzes');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('3. Get Quiz for Taking (Students - answers hidden):');
console.log('GET ' + baseURL + '/quizzes/QUIZ_ID');//6876c3c2fd83cc57abf56ba1
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('4. Get Quiz with Answers (Admin only):');
console.log('GET ' + baseURL + '/quizzes/QUIZ_ID/admin');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('5. Update Quiz (Admin only):');
console.log('PUT ' + baseURL + '/quizzes/QUIZ_ID');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  title: "JavaScript Variables and Constants Quiz",
  passingScore: 80
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('6. Delete Quiz (Admin only):');
console.log('DELETE ' + baseURL + '/quizzes/QUIZ_ID');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(60) + '\n');

// STUDENT FUNCTIONALITY
console.log('=== STUDENT FUNCTIONALITY ===\n');

console.log('First, register a student user:');
console.log('POST ' + baseURL + '/auth/register');
console.log('Content-Type: application/json\n');
console.log(JSON.stringify({
  name: "Student User",
  email: "student@lms.com",
  password: "Student123",
  role: "student"
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('1. Enroll in Course (Students):');
console.log('POST ' + baseURL + '/enrollments');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  courseId: "COURSE_ID_HERE"
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('2. Get My Enrollments (Students):');
console.log('GET ' + baseURL + '/enrollments');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('3. Get Single Enrollment Details (Students):');
console.log('GET ' + baseURL + '/enrollments/ENROLLMENT_ID');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('4. Mark Lesson as Completed (Students):');
console.log('POST ' + baseURL + '/enrollments/ENROLLMENT_ID/lessons/LESSON_ID/complete');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('5. Submit Quiz Attempt (Students):');
console.log('POST ' + baseURL + '/enrollments/ENROLLMENT_ID/quizzes/QUIZ_ID/attempt');http://localhost:5000/api/enrollments/687773956a91a352d9344997/quizzes/6876c3c2fd83cc57abf56ba1/attempt       /// adv js course da
console.log('Content-Type: application/json');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  answers: [
    {
      questionId: "QUESTION_ID_1",
      selectedOption: 0
    },
    {
      questionId: "QUESTION_ID_2", 
      selectedOption: 2
    }
  ]
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('6. Get My Quiz Attempts & Scores (Students):');
console.log('GET ' + baseURL + '/enrollments/ENROLLMENT_ID/quizzes/QUIZ_ID/attempts');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('7. Get Overall Course Progress (Students):');
console.log('GET ' + baseURL + '/enrollments/ENROLLMENT_ID/progress');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('8. Get Detailed Progress Report (Students):');
console.log('GET ' + baseURL + '/enrollments/progress');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');
console.log('Query parameters: ?courseId=COURSE_ID (optional)');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('9. Get All My Quiz Scores (Students):');
console.log('GET ' + baseURL + '/progress/quiz-scores');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');
console.log('Query parameters: ?courseId=COURSE_ID (optional)');

console.log('\n' + '-'.repeat(40) + '\n');

console.log('10. Get Comprehensive Progress Report (Students):');
console.log('GET ' + baseURL + '/progress/report');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');
console.log('Query parameters: ?courseId=COURSE_ID (optional)');

console.log('\n' + '-'.repeat(40) + '\n');
//http://localhost:5000/api/enrollments/687773956a91a352d9344997/lessons/6876c2dafd83cc57abf56b8f/complete
console.log('11. Get Learning Analytics (Students):');
console.log('GET ' + baseURL + '/progress/analytics');
console.log('Authorization: Bearer STUDENT_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(60) + '\n');

// PROGRESS TRACKING EXAMPLES
console.log('=== PROGRESS TRACKING EXAMPLES ===\n');

console.log('Example Progress Response:');
console.log(JSON.stringify({
  success: true,
  data: {
    courseId: "65f1234567890abcdef12345",
    courseTitle: "JavaScript Fundamentals",
    totalLessons: 10,
    completedLessons: 7,
    totalQuizzes: 3,
    passedQuizzes: 2,
    overallProgress: 70,
    lessonProgress: 70,
    quizProgress: 66.67,
    lastActivity: "2024-01-15T14:30:00.000Z",
    timeSpent: 450, // minutes
    estimatedTimeRemaining: 180,
    completionDate: null,
    lessons: [
      {
        lessonId: "65f1234567890abcdef12346",
        title: "Introduction to Variables",
        completed: true,
        completedAt: "2024-01-10T10:30:00.000Z"
      },
      {
        lessonId: "65f1234567890abcdef12347",
        title: "Functions and Scope",
        completed: false,
        completedAt: null
      }
    ],
    quizzes: [
      {
        quizId: "65f1234567890abcdef12348",
        title: "Variables Quiz",
        attempts: 2,
        bestScore: 85,
        passed: true,
        lastAttemptDate: "2024-01-12T15:45:00.000Z"
      },
      {
        quizId: "65f1234567890abcdef12349",
        title: "Functions Quiz",
        attempts: 1,
        bestScore: 65,
        passed: false,
        lastAttemptDate: "2024-01-14T11:20:00.000Z"
      }
    ]
  }
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('Example Quiz Attempts Response:');
console.log(JSON.stringify({
  success: true,
  data: {
    quizId: "65f1234567890abcdef12348",
    quizTitle: "Variables Quiz",
    maxAttempts: 3,
    attemptsUsed: 2,
    attemptsRemaining: 1,
    passingScore: 75,
    attempts: [
      {
        attemptNumber: 1,
        score: 70,
        passed: false,
        submittedAt: "2024-01-12T14:30:00.000Z",
        timeTaken: 12, // minutes
        correctAnswers: 14,
        totalQuestions: 20
      },
      {
        attemptNumber: 2,
        score: 85,
        passed: true,
        submittedAt: "2024-01-12T15:45:00.000Z",
        timeTaken: 10,
        correctAnswers: 17,
        totalQuestions: 20
      }
    ],
    bestScore: 85,
    averageScore: 77.5
  }
}, null, 2));

console.log('\n' + '-'.repeat(40) + '\n');

console.log('Example Learning Analytics Response:');
console.log(JSON.stringify({
  success: true,
  data: {
    totalCourses: 3,
    completedCourses: 1,
    inProgressCourses: 2,
    totalLessons: 25,
    completedLessons: 18,
    totalQuizzes: 8,
    passedQuizzes: 6,
    totalTimeSpent: 1250, // minutes
    averageQuizScore: 82.5,
    streakDays: 5,
    courseProgress: [
      {
        courseId: "65f1234567890abcdef12345",
        courseTitle: "JavaScript Fundamentals",
        progress: 85.5,
        timeSpent: 450,
        enrolledAt: "2024-01-10T10:00:00.000Z",
        completedAt: null
      },
      {
        courseId: "65f1234567890abcdef12346",
        courseTitle: "HTML & CSS Basics",
        progress: 100,
        timeSpent: 300,
        enrolledAt: "2024-01-05T09:00:00.000Z",
        completedAt: "2024-01-20T16:30:00.000Z"
      }
    ]
  }
}, null, 2));
