# Gym Membership Management System

## Project Overview
A web-based application for managing gym operations, including members, membership plans, trainers, attendance, payments and reports.

## Technology Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: MySQL
- Additional Database: MongoDB
- Authentication: bcryptjs and JWT using HTTP-only cookies

## Main Features
- Member registration and login
- Admin authentication
- Member management
- Membership plan management
- Trainer management and assignment
- Attendance tracking
- Payment management
- Reports and analytics
- Member dashboard
- Activity logging

## Database
MySQL database: gym_membership_db

Main tables:
- Member
- Membership_Plan
- Membership
- Trainer
- Trainer_Assignment
- Attendance
- Payment
- auth_users

SQL scripts are included in this repository.

## Team Contributions

### Member 1
- Designed and implemented the MySQL database schema.
- Added sample data, SQL operations and indexing.
- Implemented the membership reporting view.
- Integrated the frontend developed by Member 2 with the backend and database.
- Implemented authentication, login and registration.

### Member 2
- Designed and developed the frontend interface.
- Worked on MongoDB integration and activity logging.
- Contributed to application modules and project integration.

## Project Setup

1. Clone the repository:

   git clone https://github.com/priyankabm11/Gym-Membership-Management-System.git

2. Enter the project directory:

   cd Gym-Membership-Management-System

3. Install dependencies:

   npm install

4. Configure your environment variables in a local .env.local file.

5. Start the development server:

   npm run dev

6. Open http://localhost:3000

