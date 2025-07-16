# LMS Backend

A comprehensive Node.js backend application for Learning Management System with complete course management, user authentication, and student enrollment features.

## Features

### ✅ User Authentication
- User Registration & Login
- JWT Authentication
- Password hashing with bcrypt
- Role-based access control (Student, Admin)
- Protected routes middleware
- User profile management
- Password change functionality

### ✅ Course Management (Admin Only)
- Create, read, update, delete courses
- Course details: title, description, instructor, price
- Course search and filtering
- Enrollment tracking
- Soft delete functionality

### ✅ Lesson Management (Admin Only)
- Add lessons to courses
- Video URL integration
- Resource links for additional materials
- Lesson ordering
- Duration tracking
- Complete CRUD operations

### ✅ Quiz Management (Admin Only)
- Create quizzes with multiple-choice questions
- Configurable time limits and passing scores
- Maximum attempt limits
- Question ordering
- Answer validation
- Complete CRUD operations

### ✅ Student Enrollment & Progress
- Course enrollment system
- Progress tracking
- Lesson completion tracking
- Quiz attempt management
- Score calculation and passing status
- Enrollment history

## Technologies Used

- Node.js & Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs for password hashing
- express-validator for input validation
- CORS for cross-origin requests

## Database Models

### User Model
- Name, email, password (hashed)
- Role (student, admin)
- Account status and timestamps

### Course Model
- Title, description, instructor name, price
- Created by admin user
- Enrollment count tracking
- Soft delete support

### Lesson Model
- Title, video URL, resource links
- Course association and ordering
- Duration and status tracking

### Quiz Model
- Title, description, questions array
- Time limits and scoring configuration
- Course association and ordering

### Enrollment Model
- Student-course relationship
- Progress tracking and completion status
- Lesson completion history
- Quiz attempt records with scores

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| PUT | `/api/auth/me` | Update user profile | Private |
| PUT | `/api/auth/changepassword` | Change user password | Private |
| GET | `/api/auth/logout` | Logout user | Private |

### Course Management Routes (Admin Only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/courses` | Create a new course | Admin |
| GET | `/api/courses` | Get all courses (with pagination) | Public |
| GET | `/api/courses/:id` | Get single course with lessons & quizzes | Public |
| PUT | `/api/courses/:id` | Update course | Admin |
| DELETE | `/api/courses/:id` | Delete course (soft delete) | Admin |

### Lesson Management Routes (Admin Only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/courses/:courseId/lessons` | Add lesson to course | Admin |
| GET | `/api/courses/:courseId/lessons` | Get all lessons for course | Public |
| GET | `/api/lessons/:id` | Get single lesson | Public |
| PUT | `/api/lessons/:id` | Update lesson | Admin |
| DELETE | `/api/lessons/:id` | Delete lesson | Admin |

### Quiz Management Routes (Admin Only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/courses/:courseId/quizzes` | Add quiz to course | Admin |
| GET | `/api/courses/:courseId/quizzes` | Get all quizzes for course | Public |
| GET | `/api/quizzes/:id` | Get quiz for taking (answers hidden) | Private |
| GET | `/api/quizzes/:id/admin` | Get quiz with answers | Admin |
| PUT | `/api/quizzes/:id` | Update quiz | Admin |
| DELETE | `/api/quizzes/:id` | Delete quiz | Admin |

### Enrollment & Student Progress Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/enrollments` | Enroll in a course | Student |
| GET | `/api/enrollments` | Get my enrollments | Student |
| GET | `/api/enrollments/:id` | Get enrollment details | Student/Admin |
| POST | `/api/enrollments/:id/lessons/:lessonId/complete` | Mark lesson complete | Student |
| POST | `/api/enrollments/:id/quizzes/:quizId/attempt` | Submit quiz attempt | Student |
| GET | `/api/enrollments/admin/all` | Get all enrollments | Admin |

## Example API Calls

### Register Admin User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@lms.com",
  "password": "Admin123",
  "role": "admin"
}
```

### Create Course (Admin)
```http
POST /api/courses
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript basics",
  "instructorName": "John Smith",
  "price": 99.99
}
```

### Add Lesson to Course (Admin)
```http
POST /api/courses/COURSE_ID/lessons
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "title": "Introduction to Variables",
  "videoUrl": "https://youtube.com/watch?v=example",
  "resourceLinks": [
    {
      "title": "MDN Guide",
      "url": "https://developer.mozilla.org/guide"
    }
  ],
  "duration": 25
}
```

### Add Quiz to Course (Admin)
```http
POST /api/courses/COURSE_ID/quizzes
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "title": "Variables Quiz",
  "questions": [
    {
      "text": "Which keyword declares a variable?",
      "options": [
        { "text": "var", "isCorrect": true },
        { "text": "variable", "isCorrect": false }
      ]
    }
  ],
  "timeLimit": 15,
  "passingScore": 70
}
```

### Enroll in Course (Student)
```http
POST /api/enrollments
Content-Type: application/json
Authorization: Bearer student_jwt_token

{
  "courseId": "COURSE_ID"
}
```

### Submit Quiz (Student)
```http
POST /api/enrollments/ENROLLMENT_ID/quizzes/QUIZ_ID/attempt
Content-Type: application/json
Authorization: Bearer student_jwt_token

{
  "answers": [
    {
      "questionId": "QUESTION_ID",
      "selectedOption": 0
    }
  ]
}
```

## User Roles

- **Student**: Default role for regular users
- **Instructor**: For course instructors
- **Admin**: For system administrators

## Password Requirements

- Minimum 6 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Port number for the server (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire in 30 days
- Input validation and sanitization
- Protected routes middleware
- Role-based authorization
- Account deactivation support

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

To run in production mode:
```bash
npm start
```
