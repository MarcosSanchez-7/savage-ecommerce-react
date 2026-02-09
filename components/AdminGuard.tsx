import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

const AdminGuard: React.FC = () => {
    const { isAdmin, loading, session } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 1. Debe estar logueado
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // 2. Debe ser Admin (CEO)
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminGuard;
