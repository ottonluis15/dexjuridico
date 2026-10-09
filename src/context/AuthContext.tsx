import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, UserRole, Lawyer } from '../types';
import { storageService } from '../services/storageService';
import { cryptoService } from '../services/cryptoService';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  oab: string;
  phone?: string;
  firmName?: string;
  plan?: string;
  isIndependent?: boolean;
  officeCodeOrEmail?: string; // Para advogado solicitar vínculo
  avatarUrl?: string;
}

export interface CreateLawyerByOfficeData {
  name: string;
  email: string;
  oab: string;
  phone?: string;
  password: string;
  roleTitle?: string;
  specialties?: string[];
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (userData: RegisterUserData) => Promise<{ success: boolean; user?: User; error?: string }>;
  addLawyerByOffice: (lawyerData: CreateLawyerByOfficeData) => Promise<{ success: boolean; lawyer?: Lawyer; error?: string }>;
  updateProfilePhoto: (photoUrl: string | undefined) => boolean;
  updateProfileData: (updates: Partial<User>) => boolean;
  logout: () => void;
  availableUsers: User[]; // Apenas o usuário atual e advogados vinculados (se for escritório)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    storageService.init();
    return storageService.getCurrentUser();
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => storageService.getUsers());

  // Sincronização inicial com Supabase se configurado
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabaseService.fetchUsers().then(remoteUsers => {
        if (remoteUsers && remoteUsers.length > 0) {
          storageService.saveUsers(remoteUsers);
          setAllUsers(remoteUsers);
        }
      }).catch(console.warn);
    }
  }, []);

  // Atualizar lista geral quando houver mudanças
  const refreshUsers = () => {
    setAllUsers(storageService.getUsers());
  };

  // Usuários visíveis com estrito isolamento por escritório
  const availableUsers = useMemo(() => {
    return storageService.getVisibleUsersForUser(currentUser);
  }, [currentUser, allUsers]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    let foundUser = storageService.findUserByEmail(cleanEmail);

    // Se não encontrou no armazenamento local e o Supabase estiver configurado, tenta buscar na nuvem
    if (!foundUser && isSupabaseConfigured()) {
      try {
        const remoteUsers = await supabaseService.fetchUsers();
        if (remoteUsers && remoteUsers.length > 0) {
          storageService.saveUsers(remoteUsers);
          setAllUsers(remoteUsers);
          foundUser = remoteUsers.find(u => u.email.toLowerCase() === cleanEmail);
        }
      } catch (err) {
        console.warn('Erro ao consultar Supabase no login:', err);
      }
    }

    if (!foundUser) {
      return { 
        success: false, 
        error: 'Nenhuma conta encontrada com este e-mail institucional.' 
      };
    }

    if (!password) {
      return { 
        success: false, 
        error: 'Por favor, informe sua senha de acesso.' 
      };
    }

    // Validação segura de senha com salt e hash
    if (foundUser.passwordHash && foundUser.salt) {
      const isValid = await cryptoService.verifyPassword(password, foundUser.salt, foundUser.passwordHash);
      if (!isValid) {
        return { 
          success: false, 
          error: 'Senha incorreta. Verifique suas credenciais e tente novamente.' 
        };
      }
    } else {
      // Fallback para contas legadas sem hash
      return {
        success: false,
        error: 'Credenciais desatualizadas. Por favor, redefina sua conta.'
      };
    }

    setCurrentUser(foundUser);
    storageService.saveCurrentUser(foundUser);

    storageService.addAuditLog({
      userId: foundUser.id,
      userName: foundUser.name,
      userRole: foundUser.role,
      action: 'LOGIN_SUCESSO',
      entity: 'Autenticação / Sessão',
      details: `Login realizado com sucesso no perfil ${foundUser.role === 'ADMIN' ? 'Escritório / Administrador' : 'Advogado'}.`,
      ipAddress: '187.54.12.90',
      officeId: foundUser.officeId
    });

    return { success: true };
  };

  const registerUser = async (userData: RegisterUserData): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Validação de e-mail único
    const existing = storageService.findUserByEmail(cleanEmail);
    if (existing) {
      return { 
        success: false, 
        error: 'Já existe uma conta cadastrada com este e-mail. Por favor, faça login ou use outro e-mail.' 
      };
    }

    // Validação de OAB
    if (!userData.oab || !userData.oab.trim()) {
      return { 
        success: false, 
        error: 'O número de inscrição na OAB (com UF) é obrigatório.' 
      };
    }

    // Validação de requisitos de senha
    if (!userData.password || userData.password.length < 6) {
      return { 
        success: false, 
        error: 'A senha deve conter no mínimo 6 caracteres.' 
      };
    }

    // Gerar salt e hash criptográfico
    const salt = cryptoService.generateSalt();
    const passwordHash = await cryptoService.hashPassword(userData.password, salt);

    let officeId: string | undefined = undefined;
    let officeName: string | undefined = undefined;
    let officeCode: string | undefined = undefined;

    // Cenário 1: Cadastro de Escritório
    if (userData.role === 'ADMIN') {
      const timestamp = Date.now();
      officeId = `off_${timestamp}`;
      officeCode = `DEX-${Math.floor(1000 + Math.random() * 9000)}`;
      officeName = userData.firmName?.trim() || `${userData.name.trim()} Advocacia`;
    } 
    // Cenário 2: Cadastro de Advogado Vinculado a Escritório
    else if (!userData.isIndependent && userData.officeCodeOrEmail?.trim()) {
      const targetOffice = storageService.findOfficeByCodeOrEmail(userData.officeCodeOrEmail);
      if (!targetOffice) {
        return {
          success: false,
          error: `Não foi encontrado nenhum escritório com o código ou e-mail "${userData.officeCodeOrEmail}". Verifique com o titular da banca.`
        };
      }
      officeId = targetOffice.officeId;
      officeName = targetOffice.officeName;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role,
      oab: userData.oab.trim().toUpperCase(),
      phone: userData.phone?.trim() || '(11) 99999-0000',
      status: 'ACTIVE',
      officeId,
      officeName,
      officeCode,
      isIndependent: userData.role === 'LAWYER' ? !!userData.isIndependent : false,
      avatarUrl: userData.avatarUrl,
      passwordHash,
      salt
    };

    const currentUsers = storageService.getUsers();
    const updatedUsers = [newUser, ...currentUsers];
    storageService.saveUsers(updatedUsers);
    setAllUsers(updatedUsers);

    // Criar perfil profissional correspondente na lista de advogados
    const currentLawyers = storageService.getLawyers();
    const newLawyer: Lawyer = {
      id: `law_${Date.now()}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      oab: newUser.oab || '',
      specialties: ['Direito Geral', 'Contencioso'],
      status: 'ACTIVE',
      roleTitle: newUser.role === 'ADMIN' 
        ? `Sócio Fundador • ${officeName || 'Banca'}` 
        : (newUser.isIndependent ? 'Advogado Autônomo' : `Associado • ${officeName || 'Escritório'}`),
      assignedCasesCount: 0,
      officeId: newUser.officeId,
      avatarUrl: newUser.avatarUrl
    };
    storageService.saveLawyers([newLawyer, ...currentLawyers]);

    // Sincronizar na nuvem (Supabase) se configurado
    if (isSupabaseConfigured()) {
      supabaseService.upsertUser(newUser).catch(console.warn);
      supabaseService.upsertLawyer(newLawyer).catch(console.warn);
    }

    // Autenticar imediatamente o novo usuário
    setCurrentUser(newUser);
    storageService.saveCurrentUser(newUser);

    storageService.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'CADASTRO_CONTA',
      entity: newUser.officeName || 'Advocacia Autônoma',
      details: `Novo cadastro realizado com sucesso. Perfil: ${newUser.role}, OAB: ${newUser.oab}.`,
      ipAddress: '187.54.12.90',
      officeId: newUser.officeId
    });

    return { success: true, user: newUser };
  };

  // Cadastro de advogado realizado pelo escritório logado
  const addLawyerByOffice = async (lawyerData: CreateLawyerByOfficeData): Promise<{ success: boolean; lawyer?: Lawyer; error?: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Apenas administradores do escritório podem cadastrar membros na equipe.' };
    }

    const cleanEmail = lawyerData.email.trim().toLowerCase();
    const existing = storageService.findUserByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'Já existe um usuário cadastrado com este e-mail institucional.' };
    }

    if (!lawyerData.oab.trim()) {
      return { success: false, error: 'A inscrição OAB/UF é obrigatória.' };
    }

    if (!lawyerData.password || lawyerData.password.length < 6) {
      return { success: false, error: 'A senha de acesso do advogado deve conter no mínimo 6 caracteres.' };
    }

    const salt = cryptoService.generateSalt();
    const passwordHash = await cryptoService.hashPassword(lawyerData.password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: lawyerData.name.trim(),
      email: cleanEmail,
      role: 'LAWYER',
      oab: lawyerData.oab.trim().toUpperCase(),
      phone: lawyerData.phone?.trim() || '',
      status: 'ACTIVE',
      officeId: currentUser.officeId,
      officeName: currentUser.officeName,
      isIndependent: false,
      avatarUrl: lawyerData.avatarUrl,
      passwordHash,
      salt
    };

    const currentUsers = storageService.getUsers();
    storageService.saveUsers([newUser, ...currentUsers]);

    const newLawyer: Lawyer = {
      id: `law_${Date.now()}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      oab: newUser.oab || '',
      specialties: lawyerData.specialties || ['Direito Civil'],
      status: 'ACTIVE',
      roleTitle: lawyerData.roleTitle || 'Advogado Associado',
      assignedCasesCount: 0,
      officeId: currentUser.officeId,
      avatarUrl: lawyerData.avatarUrl
    };

    const currentLawyers = storageService.getLawyers();
    storageService.saveLawyers([newLawyer, ...currentLawyers]);

    // Sincronizar na nuvem (Supabase) se configurado
    if (isSupabaseConfigured()) {
      supabaseService.upsertUser(newUser).catch(console.warn);
      supabaseService.upsertLawyer(newLawyer).catch(console.warn);
    }

    refreshUsers();

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CADASTRO_ADVOGADO_VINCULADO',
      entity: `Advogado: ${newUser.name}`,
      details: `Advogado ${newUser.name} (OAB ${newUser.oab}) cadastrado e vinculado ao escritório por ${currentUser.name}.`,
      ipAddress: '187.54.12.90',
      officeId: currentUser.officeId
    });

    return { success: true, lawyer: newLawyer };
  };

  const updateProfilePhoto = (photoUrl: string | undefined): boolean => {
    if (!currentUser) return false;
    const success = storageService.updateUserPhoto(currentUser.id, photoUrl);
    if (success) {
      const updated = { ...currentUser, avatarUrl: photoUrl };
      setCurrentUser(updated);
      refreshUsers();
      return true;
    }
    return false;
  };

  const updateProfileData = (updates: Partial<User>): boolean => {
    if (!currentUser) return false;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    storageService.saveCurrentUser(updated);

    const users = storageService.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      storageService.saveUsers(users);
    }

    refreshUsers();
    return true;
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
        ipAddress: '187.54.12.90',
        officeId: currentUser.officeId
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
        addLawyerByOffice,
        updateProfilePhoto,
        updateProfileData,
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
