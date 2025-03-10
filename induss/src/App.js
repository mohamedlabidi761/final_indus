import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import MachineControl from './components/MachineControl/MachineControl';
import History from './components/History/History';
import Authentication from './components/Authentication/Authentication';
import AdminManagement from './components/AdminManagement/AdminManagement';
import Settings from './components/Settings/Settings';
import Layout from './components/Layout/Layout';
import { AppProvider } from './context/AppContext';
import LoadingOverlay from './components/common/LoadingOverlay';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <LoadingOverlay />
          <Routes>
            <Route path="/auth" element={<Authentication />} />
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/machine-control" element={
              <Layout>
                <MachineControl />
              </Layout>
            } />
            <Route path="/history" element={
              <Layout>
                <History />
              </Layout>
            } />
            <Route path="/admin" element={
              <Layout>
                <AdminManagement />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <Settings />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 