
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../../pages/Admin';

import Login from '../../pages/Login';
import ProtectedRoute from '../ProtectedRoute';

const StockRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};

export default StockRoutes;
