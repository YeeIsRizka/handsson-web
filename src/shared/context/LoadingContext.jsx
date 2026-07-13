import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/ui/LoadingScreen';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");
  const navigate = useNavigate();

  const navigateWithLoading = useCallback((to, options = {}) => {
    const { message = "Mempersiapkan Arena...", duration = 1500, state } = options;
    setLoadingMessage(message);
    setIsLoading(true);
    
    setTimeout(() => {
      navigate(to, { state });
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, duration);
  }, [navigate]);

  const showLoading = useCallback((message = "Memuat...", duration = 0) => {
    setLoadingMessage(message);
    setIsLoading(true);
    if (duration > 0) {
      setTimeout(() => setIsLoading(false), duration);
    }
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ navigateWithLoading, showLoading, hideLoading, isLoading }}>
      {children}
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
