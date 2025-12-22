
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../../pages/Home';
import ProductDetail from '../../pages/ProductDetail';
import CategoryPage from '../../pages/CategoryPage';

const WebRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            {/* Intentionally omitting /admin route for the public web app */}
        </Routes>
    );
};

export default WebRoutes;
