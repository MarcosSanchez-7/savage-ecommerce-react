
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../pages/Home';
import ProductDetail from '../../pages/ProductDetail';
import CategoryPage from '../../pages/CategoryPage';
import BlogPage from '../../pages/BlogPage';

import AdminDashboard from '../../pages/Admin';

const WebRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
};

export default WebRoutes;
