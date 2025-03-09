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
        const machinesResponse = await getMachines();
        const workersResponse = await getWorkers();
        
        // Make sure we're accessing the data property from the response
        setMachines(machinesResponse.data || []);
        setWorkers(workersResponse.data || []);
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
      // Make sure we're accessing the data property from the response
      if (result && result.data) {
        setMachines([...machines, result.data]);
      }
    } catch (err) {
      setError('Failed to add machine');
      console.error(err);
    }
  };

  // Example function to update a machine
  const handleUpdateMachine = async (id, machineData) => {
    try {
      const result = await updateMachine(id, machineData);
      // Make sure we're accessing the data property from the response
      if (result && result.data) {
        // Check if machines is an array before using map
        if (Array.isArray(machines)) {
          setMachines(machines.map(machine => 
            machine._id === id ? result.data : machine
          ));
        }
      }
    } catch (err) {
      setError('Failed to update machine');
      console.error(err);
    }
  };

  // Example function to delete a machine
  const handleDeleteMachine = async (id) => {
    try {
      await deleteMachine(id);
      // Check if machines is an array before using filter
      if (Array.isArray(machines)) {
        setMachines(machines.filter(machine => machine._id !== id));
      }
    } catch (err) {
      setError('Failed to delete machine');
      console.error(err);
    }
  };

  // Similar functions for workers...
  const handleAddWorker = async (workerData) => {
    try {
      const result = await createWorker(workerData);
      if (result && result.data) {
        setWorkers([...workers, result.data]);
      }
    } catch (err) {
      setError('Failed to add worker');
      console.error(err);
    }
  };

  const handleUpdateWorker = async (id, workerData) => {
    try {
      const result = await updateWorker(id, workerData);
      if (result && result.data) {
        if (Array.isArray(workers)) {
          setWorkers(workers.map(worker => 
            worker._id === id ? result.data : worker
          ));
        }
      }
    } catch (err) {
      setError('Failed to update worker');
      console.error(err);
    }
  };

  const handleDeleteWorker = async (id) => {
    try {
      await deleteWorker(id);
      if (Array.isArray(workers)) {
        setWorkers(workers.filter(worker => worker._id !== id));
      }
    } catch (err) {
      setError('Failed to delete worker');
      console.error(err);
    }
  };

  // Debug information
  console.log('Machines data type:', typeof machines);
  console.log('Machines is array?', Array.isArray(machines));
  console.log('Machines value:', machines);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your UI components here */}
      <h2>Machines</h2>
      {Array.isArray(machines) && machines.length > 0 ? (
        <ul>
          {machines.map(machine => (
            <li key={machine._id}>
              {machine.name} - {machine.type} - {machine.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No machines found</p>
      )}

      <h2>Workers</h2>
      {Array.isArray(workers) && workers.length > 0 ? (
        <ul>
          {workers.map(worker => (
            <li key={worker._id}>
              {worker.name} - {worker.specialty}
            </li>
          ))}
        </ul>
      ) : (
        <p>No workers found</p>
      )}
    </div>
  );
};

export default AdminManagement; 