import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ThreePageLoader } from './components/common/ThreePageLoader';
import { AuthModal } from './components/auth/AuthModal';
import { StoreSelectorModal } from './components/ordering/StoreSelectorModal';
import { LuckinTopAnnouncement } from './components/realtime/LuckinTopAnnouncement';
import { FloatingOrderTracker } from './components/realtime/FloatingOrderTracker';
import { RealtimeControlCenter } from './components/realtime/RealtimeControlCenter';

// Pages
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { ProductDetails } from './pages/ProductDetails';
import { CoffeeTypes } from './pages/CoffeeTypes';
import { Favourites } from './pages/Favourites';
import { Cart } from './pages/Cart';
import { OrderSummary } from './pages/OrderSummary';
import { OrderTracking } from './pages/OrderTracking';
import { InvoiceView } from './pages/InvoiceView';
import { Account } from './pages/Account';
import { BaristaDashboard } from './pages/BaristaDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Locations } from './pages/Locations';
import { OurStory } from './pages/OurStory';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { BookSlot } from './pages/BookSlot';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { isLoading, setIsLoading } = useLoading();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide Navbar & Footer on Barista dashboard terminal for maximum workspace
  const isBaristaScreen = location.pathname.startsWith('/barista');
  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* ── High-End 3D Three.js Page Loading Experience ── */}
      {isLoading && (
        <ThreePageLoader onComplete={() => setIsLoading(false)} minDurationMs={2000} />
      )}

      <div className="flex flex-col min-h-screen bg-[#FBF4E9] text-[#2A2723]">
        <ScrollToTop />
        
        {!isBaristaScreen && <Navbar />}

        <div className={`flex-grow ${!isBaristaScreen && !isHomePage ? 'pt-24 sm:pt-28' : 'pt-0'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:productId" element={<ProductDetails />} />
            <Route path="/coffee-types" element={<CoffeeTypes />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/order/:orderId/track" element={<OrderTracking />} />
            <Route path="/order/:orderId/invoice" element={<InvoiceView />} />
            <Route path="/book-table" element={<BookSlot />} />
            <Route path="/book-slot" element={<BookSlot />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/forgot-password" element={<Login />} />
            <Route path="/barista" element={<BaristaDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/contact" element={<Contact />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>

        {!isBaristaScreen && <Footer />}
      </div>

      {/* Global Luckin Real-Time Overlays — Active inside User Portal only */}
      {isAuthenticated && <FloatingOrderTracker />}
      {isAuthenticated && <RealtimeControlCenter />}

      {/* Global Modals rendered on top of entire layout */}
      <AuthModal />
      <StoreSelectorModal />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <LoadingProvider>
            <CartProvider>
              <FavoritesProvider>
                <RealtimeProvider>
                  <AppContent />
                </RealtimeProvider>
              </FavoritesProvider>
            </CartProvider>
          </LoadingProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

