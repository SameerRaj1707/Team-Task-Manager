# Team Task Manager

A full-stack task management application for teams to collaborate and manage projects efficiently.

## Features

- User Authentication (Register/Login)
- Create, Read, Update, Delete Tasks
- Task Status Management (To Do, In Progress, Done)
- Priority Levels (Low, Medium, High)
- Task Assignee Management
- Dashboard with Statistics
- Filter Tasks by Status

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React.js
- React Router
- Axios
- Context API

## Project Structure

```
team-task-manager/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── components/
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── TaskList.js
│   │   └── TaskDetail.js
│   └── context/
│       └── AuthContext.js
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd team-task-manager
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

4. Configure Environment Variables

Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamtaskmanager
JWT_SECRET=your_jwt_secret_key_here
```

### Running the Application

1. Start MongoDB
```bash
mongod
```

2. Start Backend Server
```bash
cd backend
npm start
```

3. Start Frontend Development Server
```bash
cd frontend
npm start
```

4. Open your browser and navigate to
```
http://localhost:3000
```

## API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get single user (protected)

### Task Routes
- `GET /api/tasks` - Get all tasks (protected)
- `POST /api/tasks` - Create new task (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

## License

MIT
