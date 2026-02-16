
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import StockRoutes from './components/routes/StockRoutes';
import WebRoutes from './components/routes/WebRoutes';
import CartDrawer from './components/CartDrawer';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import SEO from './components/SEO';
import HomePageSkeleton from './components/skeletons/HomePageSkeleton';
import ScrollToTop from './components/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainContent: React.FC = () => {
  const { loading } = useShop();
  // Check if we are in "Admin/Stock Mode" via env var or just default to Web Store
  const isStockApp = import.meta.env.VITE_APP_MODE === 'admin';

  if (loading) {
    return <HomePageSkeleton />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <ToastContainer
          aria-label="Notificaciones"
          position="top-center"
          autoClose={2500}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          limit={2}
          toastClassName="savage-toast"
        />
        <MainContent />
      </ShopProvider>
    </AuthProvider>
  );
};

export default App;
