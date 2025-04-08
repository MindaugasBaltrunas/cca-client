import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AccessDenied from './presentation/pages/accessDenied/AccessDenied';
import { LoginForm } from './presentation/pages/loginPage/LoginPage';

// Import your components
// import LoginPage from './components/LoginPage';
// import RegisterPage from './components/RegisterPage';
// import DashboardPage from './components/DashboardPage';
// import VerifyTwoFactorPage from './components/VerifyTwoFactorPage';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import HomePage from './pages/HomePage';
// import ProfilePage from './pages/ProfilePage';
// import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          {/* <Route path="/" element={<AccessDenied />} /> */}
          <Route path="/login" element={<LoginForm />} />
          {/* <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-2fa" element={<VerifyTwoFactorPage />} /> */}
          
          {/* Protected routes using Outlet */}
          {/* <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route> */}
          
          {/* Redirect to home if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;