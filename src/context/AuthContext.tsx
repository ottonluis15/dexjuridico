import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../mock/initialData';
import { storageService } from '../services/storageService';

export interface RegisterUserData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  oab?: string;
  phone?: string;
  firmName?: string;
  plan?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  login: (email: string, role?: UserRole) => boolean;
  registerUser: (userData: RegisterUserData) => User;
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

  const [availableUsers, setAvailableUsers] = useState<User[]>(() => storageService.getUsers());

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

  const registerUser = (userData: RegisterUserData): User => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      oab: userData.oab || 'OAB Não Informada',
      phone: userData.phone || '(11) 99999-0000',
      status: 'ACTIVE',
      avatarUrl: userData.role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop'
    };

    const updatedUsers = [newUser, ...availableUsers];
    setAvailableUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);

    // Cadastrar também no corpo de advogados do escritório
    const currentLawyers = storageService.getLawyers();
    const newLawyer = {
      id: `law_${Date.now()}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '(11) 99999-0000',
      oab: newUser.oab || 'OAB Sob Consulta',
      specialties: ['Direito Geral', 'Contencioso Cível'],
      status: 'ACTIVE' as const,
      roleTitle: userData.role === 'ADMIN' ? `Sócio Fundador • ${userData.firmName || 'Banca'}` : 'Advogado Associado',
      assignedCasesCount: 0
    };
    storageService.saveLawyers([newLawyer, ...currentLawyers]);

    // Autenticar imediatamente
    setCurrentUser(newUser);
    storageService.saveCurrentUser(newUser);

    storageService.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'CADASTRO_CONTA',
      entity: `Escritório: ${userData.firmName || 'Nova Conta'}`,
      details: `Novo cadastro de escritório jurídico realizado. OAB: ${newUser.oab}, Plano: ${userData.plan || 'Escritório Pro'}.`,
      ipAddress: '187.54.12.90'
    });

    return newUser;
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
        registerUser,
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
