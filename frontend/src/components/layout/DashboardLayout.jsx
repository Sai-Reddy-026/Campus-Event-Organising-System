/**
 * Dashboard Layout - Sidebar + Navbar + Content area
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <div className="main-content">
                <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
