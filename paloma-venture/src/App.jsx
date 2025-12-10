import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import './components/Style/ProductCard.css';

// Imports organizados
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ScrollToTop from './components/ScrollToTop';
import CatalogPage from './pages/CatalogPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import PolicyPage from './pages/PolicyPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />

        <CartProvider>
          <Header />
          
          <main className="main-content" style={{ minHeight: '70vh' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/produto/:id" element={<ProductPage />} />

              <Route path="/quem-somos" element={<AboutPage />} />
              <Route path="/politicas" element={<PolicyPage />} />
              <Route path="/contato" element={<ContactPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
          <CartModal />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;