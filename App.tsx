
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import StockRoutes from './components/routes/StockRoutes';
import WebRoutes from './components/routes/WebRoutes';
import CartDrawer from './components/CartDrawer';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import SEO from './components/SEO';
import LoadingScreen from './components/LoadingScreen';
import { Toaster } from 'react-hot-toast'; //añadimos la libreria Toaster de react para que aparezcan los mensajes de error y demas

const MainContent: React.FC = () => {
  const { loading } = useShop();
  // Check if we are in "Admin/Stock Mode" via env var or just default to Web Store
  const isStockApp = import.meta.env.VITE_APP_MODE === 'admin';

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <SEO />
      {/* Only show CartDrawer on Web App, not Stock App, unless requested otherwise. Keeping it separate is cleaner. */}
      {!isStockApp && <CartDrawer />}

      {isStockApp ? (
        <StockRoutes />
      ) : (
        <WebRoutes />
      )}
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ShopProvider>
        <Toaster position="top-center" reverseOrder={false} style={{ backgroundColor: 'black', color: 'red' }} /> {/* libreria TOAST de react */}
        <MainContent />
      </ShopProvider>
    </AuthProvider>
  );
};

export default App;
