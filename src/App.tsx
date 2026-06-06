import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import StationDetail from './pages/StationDetail';
import CapacityPrediction from './pages/CapacityPrediction';
import WeeklyReportPage from './pages/WeeklyReportPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="station/:cityCode" element={<StationDetail />} />
          <Route path="capacity" element={<CapacityPrediction />} />
          <Route path="report" element={<WeeklyReportPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
};

export default App;
