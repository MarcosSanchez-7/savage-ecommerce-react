
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StockRoutes from './components/routes/StockRoutes';
import WebRoutes from './components/routes/WebRoutes';
import CartDrawer from './components/CartDrawer';
import { ShopProvider } from './context/ShopContext';


const App: React.FC = () => {
  const isStockApp = import.meta.env.VITE_APP_MODE === 'admin';
  console.log('Current App Mode:', import.meta.env.VITE_APP_MODE, '| isStockApp:', isStockApp);

  return (
    <ShopProvider>
      <BrowserRouter>
        {/* Only show CartDrawer on Web App, not Stock App, unless requested otherwise. Keeping it separate is cleaner. */}
        {!isStockApp && <CartDrawer />}

        {isStockApp ? (
          <StockRoutes />
        ) : (
          <WebRoutes />
        )}
      </BrowserRouter>
    </ShopProvider>
  );
};

export default App;


