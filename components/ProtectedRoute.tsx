import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { session, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 1. Verificar Sesión
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // 2. Verificar Rol ADMIN removido (Ahora se usa AdminGuard para rutas de admin)
    // ProtectedRoute ahora es solo para verificar que haya una sesión activa.

    return <Outlet />;
};

export default ProtectedRoute;
