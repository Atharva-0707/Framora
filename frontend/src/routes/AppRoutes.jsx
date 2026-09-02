import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FeedPage from '../pages/FeedPage';
import PostDetailPage from '../pages/PostDetailPage';
import ProfilePage from '../pages/ProfilePage';
import SearchPage from '../pages/SearchPage';
import BookmarksPage from '../pages/BookmarksPage';
import PurchasesPage from '../pages/PurchasesPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes = ({ onOpenCreateModal }) => {
  return (
    <Routes>
      <Route path="/" element={<FeedPage onOpenCreateModal={onOpenCreateModal} />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/profile/:username" element={<ProfilePage onOpenCreateModal={onOpenCreateModal} />} />
      <Route path="/search" element={<SearchPage />} />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <PurchasesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
