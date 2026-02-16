import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminGuard: React.FC = () => {
    const { isAdmin, loading, session, user } = useAuth();
    const location = useLocation();

    // LAST LINE OF DEFENSE
    // Verificamos nuevamente toda la cadena de confianza

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 1. Check Session
    if (!session || !user) {
        console.warn("Intento de acceso a Admin sin sesión.", location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Strict Role
    if (!isAdmin) {
        console.warn(`Intento de acceso NO AUTORIZADO a Admin. Usuario: ${user.email}, Rol insuficiente.`);
        return <Navigate to="/" replace />;
    }

    // Autorizado
    return <Outlet />;
};

export default AdminGuard;
