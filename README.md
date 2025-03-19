# Form Management System

A full-stack web application that allows administrators to create, manage, and assign forms to users, while users can view and submit their assigned forms.

## Features

### Admin Panel
- Create, edit, and delete forms with multiple question types
- Assign forms to users
- Track completion progress
- Download reports in CSV, Excel, or PDF formats

### User Panel
- View assigned forms
- Fill and submit answers
- View submission confirmations

## Tech Stack
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT-based

## Setup Instructions

### Prerequisites
- Node.js and npm/yarn
- Docker and Docker Compose

### Database Setup
1. Navigate to the infra directory:
   ```
   cd infra
   ```

2. Start the MySQL database using Docker:
   ```
   docker-compose up -d
   ```

   This will start a MySQL 8 database container with:
   - Database name: form_management
   - Port: 3306
   - Root password: rootpassword

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run database migrations:
   ```
   yarn migrate
   ```

3. Install dependencies and start the development server:
   ```
   yarn install && yarn dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies and start the development server:
   ```
   yarn install && yarn dev
   ```

## Login Credentials

### Admin
- Email: admin@example.com
- Password: admin123

### User
- Email: user@example.com
- Password: user123

## Project Structure
- `frontend/` - React application
- `backend/` - Express.js API
- `infra/` - Infrastructure configuration (Docker)

## License
[MIT](LICENSE) 