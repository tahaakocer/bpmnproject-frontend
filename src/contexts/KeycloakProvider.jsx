// src/contexts/KeycloakProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
import KeycloakService from '../services/keycloakService';

// Keycloak Context
export const KeycloakContext = createContext(null);

export const KeycloakProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('KeycloakProvider: Servis üzerinden Keycloak başlatma isteği yapılıyor');
    
    // Başlatma işlemi başarılı olduğunda çağrılacak callback
    const onInitialized = () => {
      console.log('KeycloakProvider: Keycloak başlatma tamamlandı');
      setInitialized(true);
      setAuthenticated(KeycloakService.isLoggedIn());
      setLoading(false);
    };
    
    // Keycloak servisini kullanarak başlat
    KeycloakService.initKeycloak(onInitialized);
  }, []);

  // Keycloak context value
  const contextValue = {
    initialized,
    authenticated,
    loading,
    login: KeycloakService.doLogin,
    logout: KeycloakService.doLogout,
    register: KeycloakService.doRegister,
    getToken: KeycloakService.getToken,
    isLoggedIn: KeycloakService.isLoggedIn,
    getUserInfo: KeycloakService.getUserInfo
  };

  return (
    <KeycloakContext.Provider value={contextValue}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;

// Hook
export const useKeycloak = () => {
  const context = React.useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};