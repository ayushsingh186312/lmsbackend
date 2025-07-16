// Test script to demonstrate the authentication API endpoints
// You can use these examples with tools like Postman, Thunder Client, or curl

const baseURL = 'http://localhost:5000/api';

console.log('=== LMS Backend Authentication API Test Examples ===\n');

console.log('1. Register a new user:');
console.log('POST ' + baseURL + '/auth/register');
console.log('Content-Type: application/json\n');
console.log(JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  password: "Password123",
  role: "student"
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

console.log('2. Login user:');
console.log('POST ' + baseURL + '/auth/login');
console.log('Content-Type: application/json\n');
console.log(JSON.stringify({
  email: "john@example.com",
  password: "Password123"
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

console.log('3. Get current user profile (requires JWT token):');
console.log('GET ' + baseURL + '/auth/me');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(50) + '\n');

console.log('4. Update user profile (requires JWT token):');
console.log('PUT ' + baseURL + '/auth/me');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  name: "John Smith"
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

console.log('5. Change password (requires JWT token):');
console.log('PUT ' + baseURL + '/auth/changepassword');
console.log('Content-Type: application/json');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE\n');
console.log(JSON.stringify({
  currentPassword: "Password123",
  newPassword: "NewPassword456"
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

console.log('6. Logout (requires JWT token):');
console.log('GET ' + baseURL + '/auth/logout');
console.log('Authorization: Bearer YOUR_JWT_TOKEN_HERE');

console.log('\n' + '='.repeat(50) + '\n');

console.log('Example Success Response:');
console.log(JSON.stringify({
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  data: {
    user: {
      _id: "65f1234567890abcdef12345",
      name: "John Doe",
      email: "john@example.com",
      role: "student",
      isActive: true,
      createdAt: "2024-01-15T10:30:00.000Z"
    }
  }
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

console.log('Example Error Response:');
console.log(JSON.stringify({
  success: false,
  message: "Validation failed",
  errors: [
    {
      field: "email",
      message: "Please provide a valid email"
    }
  ]
}, null, 2));

console.log('\n' + '='.repeat(50) + '\n');
console.log('Server is running at: http://localhost:5000');
console.log('Test the root endpoint: GET http://localhost:5000');
console.log('\nPassword Requirements:');
console.log('- Minimum 6 characters');
console.log('- At least one uppercase letter');
console.log('- At least one lowercase letter');
console.log('- At least one number');
console.log('\nAvailable user roles: student, instructor, admin');
