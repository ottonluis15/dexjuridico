import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../mock/initialData';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  login: (email: string, role?: UserRole) => boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    storageService.init();
    return storageService.getCurrentUser();
  });

  const availableUsers = INITIAL_USERS;

  const login = (email: string, role?: UserRole): boolean => {
    const foundUser = availableUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role)
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      storageService.saveCurrentUser(foundUser);
      storageService.addAuditLog({
        userId: foundUser.id,
        userName: foundUser.name,
        userRole: foundUser.role,
        action: 'LOGIN_SUCESSO',
        entity: 'Autenticação / Sessão',
        details: `Login realizado com sucesso no perfil ${foundUser.role === 'ADMIN' ? 'Administrador' : 'Advogado'}.`,
        ipAddress: '187.54.12.90'
      });
      return true;
    }
    return false;
  };

  const switchUser = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      storageService.saveCurrentUser(user);
      storageService.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'TROCA_PERFIL',
        entity: 'Autenticação / Sessão',
        details: `Alternância rápida para o perfil de ${user.name} (${user.role}).`,
        ipAddress: '187.54.12.90'
      });
    }
  };

  const logout = () => {
    if (currentUser) {
      storageService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'LOGOUT',
        entity: 'Autenticação / Sessão',
        details: 'Encerramento seguro de sessão.',
        ipAddress: '187.54.12.90'
      });
    }
    setCurrentUser(null);
    storageService.saveCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isLawyer = currentUser?.role === 'LAWYER';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        isLawyer,
        login,
        switchUser,
        logout,
        availableUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
