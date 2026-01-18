import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

const AdminGuard: React.FC = () => {
    // SECURITY DISABLED: Open access to Admin panel as requested.
    return <Outlet />;
};

export default AdminGuard;
