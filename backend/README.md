# Admin Management System Backend

A MongoDB backend for an admin management system that handles machines and workers in an industrial setting.

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Express Validator
- CORS
- Dotenv

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/admin_management
   NODE_ENV=development
   ```
   Note: Update the `MONGODB_URI` with your MongoDB connection string if using MongoDB Atlas.

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Machines

- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get a specific machine
- `POST /api/machines` - Create a new machine
- `PUT /api/machines/:id` - Update a machine
- `DELETE /api/machines/:id` - Delete a machine

### Workers

- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get a specific worker
- `POST /api/workers` - Create a new worker
- `PUT /api/workers/:id` - Update a worker
- `DELETE /api/workers/:id` - Delete a worker

## Data Models

### Machine Model

```javascript
{
  name: String, // required
  type: String, // required
  status: String, // enum: 'operational', 'maintenance', 'offline'
  assignedWorker: ObjectId // reference to Worker model
}
```

### Worker Model

```javascript
{
  name: String, // required
  specialty: String, // required
  assignedMachines: [ObjectId] // array of references to Machine model
}
```

## Frontend Integration

To connect your React frontend to this backend:

1. Install Axios in your React project:
   ```
   npm install axios
   ```

2. Create an API service file (e.g., `src/services/api.js`):
   ```javascript
   import axios from 'axios';

   const API_URL = 'http://localhost:5000/api';

   // Machine API calls
   export const getMachines = async () => {
     const response = await axios.get(`${API_URL}/machines`);
     return response.data;
   };

   export const getMachine = async (id) => {
     const response = await axios.get(`${API_URL}/machines/${id}`);
     return response.data;
   };

   export const createMachine = async (machineData) => {
     const response = await axios.post(`${API_URL}/machines`, machineData);
     return response.data;
   };

   export const updateMachine = async (id, machineData) => {
     const response = await axios.put(`${API_URL}/machines/${id}`, machineData);
     return response.data;
   };

   export const deleteMachine = async (id) => {
     const response = await axios.delete(`${API_URL}/machines/${id}`);
     return response.data;
   };

   // Worker API calls
   export const getWorkers = async () => {
     const response = await axios.get(`${API_URL}/workers`);
     return response.data;
   };

   export const getWorker = async (id) => {
     const response = await axios.get(`${API_URL}/workers/${id}`);
     return response.data;
   };

   export const createWorker = async (workerData) => {
     const response = await axios.post(`${API_URL}/workers`, workerData);
     return response.data;
   };

   export const updateWorker = async (id, workerData) => {
     const response = await axios.put(`${API_URL}/workers/${id}`, workerData);
     return response.data;
   };

   export const deleteWorker = async (id) => {
     const response = await axios.delete(`${API_URL}/workers/${id}`);
     return response.data;
   };
   ```

3. Update your AdminManagement component to use these API calls instead of local state:

   ```jsx
   import React, { useState, useEffect } from 'react';
   import { 
     getMachines, createMachine, updateMachine, deleteMachine,
     getWorkers, createWorker, updateWorker, deleteWorker 
   } from '../services/api';

   const AdminManagement = () => {
     const [machines, setMachines] = useState([]);
     const [workers, setWorkers] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     // Fetch data on component mount
     useEffect(() => {
       const fetchData = async () => {
         try {
           setLoading(true);
           const machinesData = await getMachines();
           const workersData = await getWorkers();
           
           setMachines(machinesData.data);
           setWorkers(workersData.data);
           setError(null);
         } catch (err) {
           setError('Failed to fetch data');
           console.error(err);
         } finally {
           setLoading(false);
         }
       };

       fetchData();
     }, []);

     // Example function to add a new machine
     const handleAddMachine = async (machineData) => {
       try {
         const result = await createMachine(machineData);
         setMachines([...machines, result.data]);
       } catch (err) {
         setError('Failed to add machine');
         console.error(err);
       }
     };

     // Example function to update a machine
     const handleUpdateMachine = async (id, machineData) => {
       try {
         const result = await updateMachine(id, machineData);
         setMachines(machines.map(machine => 
           machine._id === id ? result.data : machine
         ));
       } catch (err) {
         setError('Failed to update machine');
         console.error(err);
       }
     };

     // Example function to delete a machine
     const handleDeleteMachine = async (id) => {
       try {
         await deleteMachine(id);
         setMachines(machines.filter(machine => machine._id !== id));
       } catch (err) {
         setError('Failed to delete machine');
         console.error(err);
       }
     };

     // Similar functions for workers...

     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error}</div>;

     return (
       <div>
         {/* Your UI components here */}
       </div>
     );
   };

   export default AdminManagement;
   ```

## Error Handling

The API includes comprehensive error handling for:
- Invalid ObjectIds
- Validation errors
- Duplicate entries
- Server errors

All errors are returned in a consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
``` 