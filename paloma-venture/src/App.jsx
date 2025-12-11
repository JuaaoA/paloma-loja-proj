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

// Admin routes
import LoginPage from './pages/Admin/LoginPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductForm from './pages/Admin/ProductForm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />

        <CartProvider>
          <Header />
          
          <main className="main-content" style={{ minHeight: '70vh' }}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/produto/:id" element={<ProductPage />} />

              <Route path="/quem-somos" element={<AboutPage />} />
              <Route path="/politicas" element={<PolicyPage />} />
              <Route path="/contato" element={<ContactPage />} />

              {/* Rotas Admin */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Rotas Protegidas (futuras) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/produtos/novo" element={<ProductForm />} />
                <Route path="/admin/produtos/editar/:id" element={<ProductForm />} />
              </Route>
              

              {/* Rota not found */}
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