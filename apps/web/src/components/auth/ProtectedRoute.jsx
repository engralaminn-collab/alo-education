import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate(`/Login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, location.pathname, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Access denied.</div>
      </div>
    );
  }

  return children;
}
