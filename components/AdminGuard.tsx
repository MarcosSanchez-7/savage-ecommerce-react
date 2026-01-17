import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminGuard: React.FC = () => {
    const { session, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Must be logged in AND be Admin (CEO)
    if (!session || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminGuard;
