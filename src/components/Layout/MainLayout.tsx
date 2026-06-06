import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Breadcrumb from './Breadcrumb';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-telecom-bg">
      <Sidebar currentPath={location.pathname} navigate={navigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <Breadcrumb currentPath={location.pathname} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
