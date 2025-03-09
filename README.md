# Industrial Management System

This project consists of two main folders:
- `indus` - Frontend React application
- `backend` - Node.js/Express API server

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd indus
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file should already be configured with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend application will run on http://localhost:3000

## API Endpoints

### Machines

- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get a single machine
- `POST /api/machines` - Create a new machine
- `PUT /api/machines/:id` - Update a machine
- `DELETE /api/machines/:id` - Delete a machine

### Workers

- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get a single worker
- `POST /api/workers` - Create a new worker
- `PUT /api/workers/:id` - Update a worker
- `DELETE /api/workers/:id` - Delete a worker

## Features

- Machine management (add, edit, delete)
- Worker management (add, edit, delete)
- Machine status tracking
- Worker assignment to machines
- Responsive design
- Dark mode support

## Demo Mode

The application includes a demo mode that activates automatically if the backend API is not available. This allows you to test the UI functionality without a running backend server.

## Troubleshooting

If you encounter issues with the connection between frontend and backend:

1. Ensure both servers are running
2. Check that the REACT_APP_API_URL in the frontend .env file matches your backend URL
3. Verify that CORS is properly configured in the backend
4. Check the browser console and backend logs for error messages 