import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Machine API calls
export const getMachines = async () => {
  try {
    const response = await axios.get(`${API_URL}/machines`);
    return response.data; // This will be { success: true, count: X, data: [...] }
  } catch (error) {
    console.error('Error fetching machines:', error);
    throw error;
  }
};

export const getMachine = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/machines/${id}`);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error(`Error fetching machine ${id}:`, error);
    throw error;
  }
};

export const createMachine = async (machineData) => {
  try {
    const response = await axios.post(`${API_URL}/machines`, machineData);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error('Error creating machine:', error);
    throw error;
  }
};

export const updateMachine = async (id, machineData) => {
  try {
    const response = await axios.put(`${API_URL}/machines/${id}`, machineData);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error(`Error updating machine ${id}:`, error);
    throw error;
  }
};

export const deleteMachine = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/machines/${id}`);
    return response.data; // This will be { success: true, data: {} }
  } catch (error) {
    console.error(`Error deleting machine ${id}:`, error);
    throw error;
  }
};

// Worker API calls
export const getWorkers = async () => {
  try {
    const response = await axios.get(`${API_URL}/workers`);
    return response.data; // This will be { success: true, count: X, data: [...] }
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

export const getWorker = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/workers/${id}`);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error(`Error fetching worker ${id}:`, error);
    throw error;
  }
};

export const createWorker = async (workerData) => {
  try {
    const response = await axios.post(`${API_URL}/workers`, workerData);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

export const updateWorker = async (id, workerData) => {
  try {
    const response = await axios.put(`${API_URL}/workers/${id}`, workerData);
    return response.data; // This will be { success: true, data: {...} }
  } catch (error) {
    console.error(`Error updating worker ${id}:`, error);
    throw error;
  }
};

export const deleteWorker = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/workers/${id}`);
    return response.data; // This will be { success: true, data: {} }
  } catch (error) {
    console.error(`Error deleting worker ${id}:`, error);
    throw error;
  }
}; 