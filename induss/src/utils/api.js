import axios from 'axios';

// Set the base URL for all API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to avoid hanging requests
  timeout: 5000
});

// Check if the API server is available
export const checkApiConnection = async () => {
  try {
    // Try to connect to the API health endpoint or any lightweight endpoint
    const response = await api.get('/health', { timeout: 3000 });
    return { connected: true, data: response.data };
  } catch (error) {
    console.error('API connection check failed:', error);
    return { connected: false, error };
  }
};

// Helper function to handle API errors
const handleApiError = (error, operation) => {
  if (error.code === 'ECONNABORTED') {
    console.error(`Timeout: ${operation} operation took too long`);
    throw new Error(`L'opération a pris trop de temps. Vérifiez votre connexion au serveur.`);
  }
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`API Error (${operation}):`, error.response.data);
    throw new Error(error.response.data.message || `Erreur du serveur: ${error.response.status}`);
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`No response (${operation}):`, error.request);
    throw new Error(`Aucune réponse du serveur. Vérifiez que le backend est en cours d'exécution.`);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(`Request error (${operation}):`, error.message);
    throw new Error(`Erreur de requête: ${error.message}`);
  }
};

// Machine API services
export const machineService = {
  // Get all machines
  getAllMachines: async () => {
    try {
      const response = await api.get('/machines');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return handleApiError(error, 'getAllMachines');
    }
  },

  // Get a single machine by ID
  getMachine: async (id) => {
    try {
      const response = await api.get(`/machines/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `getMachine(${id})`);
    }
  },

  // Create a new machine
  createMachine: async (machineData) => {
    try {
      const response = await api.post('/machines', machineData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createMachine');
    }
  },

  // Update a machine
  updateMachine: async (id, machineData) => {
    try {
      const response = await api.put(`/machines/${id}`, machineData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updateMachine(${id})`);
    }
  },

  // Delete a machine
  deleteMachine: async (id) => {
    try {
      const response = await api.delete(`/machines/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `deleteMachine(${id})`);
    }
  }
};

// Worker API services
export const workerService = {
  // Get all workers
  getAllWorkers: async () => {
    try {
      console.log("Calling API to get all workers");
      const response = await api.get('/workers');
      console.log("API response for getAllWorkers:", response);
      
      // Ensure we're returning an array
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // MongoDB sometimes returns data in different formats
        if (Array.isArray(response.data.workers)) {
          return response.data.workers;
        } else if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data.result && Array.isArray(response.data.result)) {
          return response.data.result;
        } else {
          // If it's an object with keys that look like workers, convert to array
          const possibleWorkers = Object.values(response.data).filter(item => 
            item && typeof item === 'object' && item.name && item.specialty
          );
          
          if (possibleWorkers.length > 0) {
            console.log("Extracted workers from object:", possibleWorkers);
            return possibleWorkers;
          }
        }
      }
      
      console.error("Unexpected response format:", response.data);
      return [];
    } catch (error) {
      return handleApiError(error, 'getAllWorkers');
    }
  },

  // Get a single worker by ID
  getWorker: async (id) => {
    try {
      const response = await api.get(`/workers/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `getWorker(${id})`);
    }
  },

  // Create a new worker
  createWorker: async (workerData) => {
    try {
      console.log("Creating worker with data:", workerData);
      const response = await api.post('/workers', workerData);
      console.log("API response for createWorker:", response);
      
      // MongoDB responses can vary, handle different formats
      if (response.data) {
        if (response.data._id) {
          // Direct object response
          return response.data;
        } else if (response.data.worker && response.data.worker._id) {
          // Nested worker object
          return response.data.worker;
        } else if (response.data.data && response.data.data._id) {
          // Nested data object
          return response.data.data;
        } else if (response.data.insertedId) {
          // MongoDB insertOne response format
          return {
            _id: response.data.insertedId,
            ...workerData
          };
        } else if (response.data.id) {
          // Some APIs use 'id' instead of '_id'
          return {
            _id: response.data.id,
            ...workerData
          };
        }
      }
      
      console.error("No data or ID returned from createWorker:", response);
      throw new Error("Aucun identifiant retourné lors de la création de l'ouvrier");
    } catch (error) {
      return handleApiError(error, 'createWorker');
    }
  },

  // Update a worker
  updateWorker: async (id, workerData) => {
    try {
      const response = await api.put(`/workers/${id}`, workerData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updateWorker(${id})`);
    }
  },

  // Delete a worker
  deleteWorker: async (id) => {
    try {
      const response = await api.delete(`/workers/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `deleteWorker(${id})`);
    }
  }
};

export default {
  machineService,
  workerService
}; 