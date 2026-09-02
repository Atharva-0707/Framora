import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import CreatePostModal from './components/CreatePostModal';
import SiteFooter from './components/SiteFooter';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="app-container">
      <div className="main-content">
        <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />
        <main style={{ flex: 1 }}>
          <AppRoutes onOpenCreateModal={() => setIsCreateModalOpen(true)} />
        </main>

        <SiteFooter />

        {/* Global Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={() => {
            window.location.href = '/';
          }}
        />
      </div>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
