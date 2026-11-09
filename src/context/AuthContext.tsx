import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, UserRole, Lawyer } from '../types';
import { storageService } from '../services/storageService';
import { cryptoService } from '../services/cryptoService';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { PlanId, SubscriptionPeriod, getPlanById } from '../config/plans';
import { activePaymentProvider } from '../services/payment/PaymentProvider';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  oab: string;
  phone?: string;
  firmName?: string;
  cnpj?: string;
  address?: string;
  primaryArea?: string;
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
  isAppAdmin: boolean;
  isLawyer: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; pendingConfirmation?: boolean; email?: string }>;
  registerUser: (userData: RegisterUserData) => Promise<{ success: boolean; user?: User; error?: string; pendingConfirmation?: boolean; emailWarning?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  requestEmailChange: (newEmail: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  addLawyerByOffice: (lawyerData: CreateLawyerByOfficeData) => Promise<{ success: boolean; lawyer?: Lawyer; error?: string }>;
  updateProfilePhoto: (photoUrl: string | undefined) => boolean;
  updateProfileData: (updates: Partial<User>) => boolean;
  changeSubscription: (planId: PlanId, period: SubscriptionPeriod, cardDetails?: any) => Promise<{ success: boolean; message: string; error?: string }>;
  cancelSubscription: (reason?: string) => Promise<{ success: boolean; message: string; error?: string }>;
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

  // Sincronização inicial com Supabase se configurado (merge seguro, sem apagar cadastros locais)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabaseService.fetchUsers().then(remoteUsers => {
        if (remoteUsers && remoteUsers.length > 0) {
          const localUsers = storageService.getUsers();
          const remoteEmailSet = new Set(remoteUsers.map(u => u.email.trim().toLowerCase()));
          const merged = [...remoteUsers];
          // Preserva usuários cadastrados localmente que ainda não estejam na nuvem
          for (const localUser of localUsers) {
            if (!remoteEmailSet.has(localUser.email.trim().toLowerCase())) {
              merged.push(localUser);
              supabaseService.upsertUser(localUser).catch(console.warn);
            }
          }
          storageService.saveUsers(merged);
          setAllUsers(merged);
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

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; pendingConfirmation?: boolean; email?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    let foundUser = storageService.findUserByEmail(cleanEmail);

    // Se não encontrou no armazenamento local e o Supabase estiver configurado, tenta buscar na nuvem
    if (!foundUser && isSupabaseConfigured()) {
      try {
        const remoteUsers = await supabaseService.fetchUsers();
        if (remoteUsers && remoteUsers.length > 0) {
          const localUsers = storageService.getUsers();
          const remoteEmailSet = new Set(remoteUsers.map(u => u.email.trim().toLowerCase()));
          const merged = [...remoteUsers];
          for (const localUser of localUsers) {
            if (!remoteEmailSet.has(localUser.email.trim().toLowerCase())) {
              merged.push(localUser);
            }
          }
          storageService.saveUsers(merged);
          setAllUsers(merged);
          foundUser = merged.find(u => u.email.trim().toLowerCase() === cleanEmail);
        }
      } catch (err) {
        console.warn('Erro ao consultar Supabase no login:', err);
      }
    }

    if (!password) {
      return { 
        success: false, 
        error: 'Por favor, informe sua senha de acesso.' 
      };
    }

    // Mensagem de segurança OWASP: não revelar se a conta existe ou não
    if (!foundUser) {
      return { 
        success: false, 
        error: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.' 
      };
    }

    // Validação segura de senha com salt e hash
    if (foundUser.passwordHash && foundUser.salt) {
      const isValid = await cryptoService.verifyPassword(password, foundUser.salt, foundUser.passwordHash);
      if (!isValid) {
        return { 
          success: false, 
          error: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.' 
        };
      }
    } else {
      // Fallback para contas legadas sem hash
      return {
        success: false,
        error: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'
      };
    }

    // BLOQUEIO DE CONTA NÃO CONFIRMADA (Tarefa 2)
    if (foundUser.isEmailConfirmed === false || foundUser.status === 'PENDING_CONFIRMATION') {
      return {
        success: false,
        error: 'Sua conta ainda não foi ativada. Por favor, confirme seu endereço de e-mail através do link que enviamos.',
        pendingConfirmation: true,
        email: cleanEmail
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

  const registerUser = async (userData: RegisterUserData): Promise<{ success: boolean; user?: User; error?: string; pendingConfirmation?: boolean; emailWarning?: string }> => {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Validação de e-mail único
    const existing = storageService.findUserByEmail(cleanEmail);
    if (existing) {
      return { 
        success: false, 
        error: 'Já existe uma conta cadastrada com este e-mail. Por favor, faça login ou utilize a recuperação de senha.' 
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
    if (!userData.password || userData.password.length < 8) {
      return { 
        success: false, 
        error: 'A senha deve conter no mínimo 8 caracteres.' 
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

    // A conta nasce pendente de confirmação (Tarefa 2)
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role,
      oab: userData.oab.trim().toUpperCase(),
      phone: userData.phone?.trim() || '(11) 99999-0000',
      status: 'PENDING_CONFIRMATION',
      isEmailConfirmed: false,
      officeId,
      officeName,
      officeCode,
      cnpj: userData.cnpj?.trim(),
      address: userData.address?.trim(),
      primaryArea: userData.primaryArea?.trim(),
      isIndependent: userData.role === 'LAWYER' ? !!userData.isIndependent : false,
      subscriptionPlan: userData.plan || (userData.isIndependent ? 'ESSENTIAL' : 'TRIAL'),
      subscriptionStatus: 'TRIAL',
      subscriptionPeriod: 'MONTHLY',
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
      specialties: userData.primaryArea ? [userData.primaryArea, 'Contencioso'] : ['Direito Geral', 'Contencioso'],
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

    // DISPARO DE E-MAIL DE CONFIRMAÇÃO (Tarefa 2)
    let emailWarning: string | undefined = undefined;
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const sendRes = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          userId: newUser.id,
          origin
        })
      });

      if (!sendRes.ok) {
        const errJson = await sendRes.json().catch(() => ({}));
        emailWarning = errJson?.error || 'Não foi possível disparar o e-mail pelo servidor SMTP no momento.';
        console.warn('[Cadastro] Falha no disparo do e-mail:', emailWarning);
      }

      // Contingência local para teste em desenvolvimento standalone
      storageService.createLocalAuthToken({
        userId: newUser.id,
        email: newUser.email,
        type: 'EMAIL_VERIFICATION',
        expiresInHours: 24,
        metadata: { name: newUser.name }
      }).catch(console.warn);
    } catch (e: any) {
      emailWarning = e?.message || 'Falha de comunicação ao conectar com o serviço de e-mail.';
      console.warn('Erro ao disparar verificação de e-mail:', e);
    }

    storageService.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'CADASTRO_CONTA',
      entity: newUser.officeName || 'Advocacia Autônoma',
      details: `Novo cadastro realizado (Confirmação de e-mail pendente). Perfil: ${newUser.role}, OAB: ${newUser.oab}.`,
      ipAddress: '187.54.12.90',
      officeId: newUser.officeId
    });

    // Retorna pendente de confirmação sem autenticar imediatamente, reportando qualquer aviso de e-mail
    return { success: true, user: newUser, pendingConfirmation: true, emailWarning };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, origin })
      });
      if (res.ok) {
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Falha ao reenviar e-mail de confirmação.' };
    } catch {
      await storageService.createLocalAuthToken({
        userId: `usr_${cleanEmail}`,
        email: cleanEmail,
        type: 'EMAIL_VERIFICATION',
        expiresInHours: 24
      });
      return { success: true };
    }
  };

  const requestEmailChange = async (newEmail: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };
    const clean = newEmail.trim().toLowerCase();
    if (!clean || clean === currentUser.email.toLowerCase()) {
      return { success: false, error: 'O novo e-mail deve ser diferente do e-mail atual.' };
    }

    // Registra pendingEmail no usuário
    const updated = { ...currentUser, pendingEmail: clean };
    storageService.saveCurrentUser(updated);
    setCurrentUser(updated);

    const users = storageService.getUsers().map(u => u.id === currentUser.id ? { ...u, pendingEmail: clean } : u);
    storageService.saveUsers(users);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clean,
          name: currentUser.name,
          userId: currentUser.id,
          origin
        })
      });
    } catch {
      await storageService.createLocalAuthToken({
        userId: currentUser.id,
        email: clean,
        type: 'CHANGE_EMAIL',
        expiresInHours: 24,
        metadata: { newEmail: clean }
      });
    }

    return { 
      success: true, 
      message: 'Enviamos um link de confirmação para o novo e-mail. A troca só será efetivada após você clicar no link.' 
    };
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

    // Validação de Limite do Plano para Advogados Vinculados (Item 4)
    const plan = getPlanById(currentUser.subscriptionPlan);
    const officeLawyersCount = storageService.getLawyers().filter(l => l.officeId === currentUser.officeId).length;
    if (officeLawyersCount >= plan.limits.maxLawyers) {
      return {
        success: false,
        error: `Limite de equipe atingido! O plano atual (${plan.name}) permite até ${plan.limits.maxLawyers} advogados. Acesse a aba Planos para realizar o upgrade.`
      };
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

  const changeSubscription = async (
    planId: PlanId,
    period: SubscriptionPeriod,
    cardDetails?: any
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Usuário não autenticado', error: 'Usuário não autenticado' };
    }

    // Regra de Autorização RBAC: apenas ADMIN do escritório ou advogado autônomo
    if (currentUser.role === 'LAWYER' && !currentUser.isIndependent) {
      return { 
        success: false, 
        message: 'Apenas o sócio administrador pode alterar o plano do escritório.',
        error: 'Apenas o sócio administrador pode alterar o plano do escritório.'
      };
    }

    if (currentUser.isDemo) {
      return {
        success: false,
        message: 'A conta de demonstração não permite alteração de plano.',
        error: 'A conta de demonstração não permite alteração de plano.'
      };
    }

    const planDef = getPlanById(planId);
    const amount = period === 'YEARLY' ? planDef.yearlyPricePerMonth * 12 : planDef.monthlyPrice;

    try {
      // 1. Tentar chamada à API Serverless Vercel
      let apiSuccess = false;
      try {
        const resp = await fetch('/api/plans/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            planName: planDef.name,
            period,
            amount,
            user: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              officeId: currentUser.officeId,
              isIndependent: currentUser.isIndependent,
              isDemo: currentUser.isDemo
            },
            cardHolder: cardDetails?.holderName,
            lastDigits: cardDetails?.cardNumberMasked?.slice(-4)
          })
        });
        if (resp.ok) {
          apiSuccess = true;
        }
      } catch (e) {
        // Fallback local caso o ambiente seja dev offline sem o serverless rodando
        console.warn('API /api/plans/subscribe indisponível, aplicando fallback via activePaymentProvider');
      }

      // 2. Chamar o Adaptador de Pagamento (MockPaymentProvider)
      const paymentResult = await activePaymentProvider.createSubscription({
        planId,
        planName: planDef.name,
        period,
        amount,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          officeId: currentUser.officeId,
          isIndependent: currentUser.isIndependent
        },
        cardInfo: cardDetails
      });

      if (!paymentResult.success) {
        return { success: false, message: paymentResult.message, error: paymentResult.message };
      }

      // 3. Atualizar estado local e storage
      const updatedUser = storageService.updateUserSubscription(currentUser.id, planId, period, 'ACTIVE');
      if (updatedUser) {
        setCurrentUser(updatedUser);
        storageService.saveCurrentUser(updatedUser);
      }

      // 4. Salvar histórico da assinatura
      storageService.addSubscription({
        id: paymentResult.transactionId,
        userId: currentUser.id,
        officeId: currentUser.officeId,
        planId,
        period,
        status: 'ACTIVE',
        amount,
        paymentMethod: 'MOCK_CARD',
        startDate: paymentResult.subscription.startDate,
        endDate: paymentResult.subscription.endDate,
        createdAt: new Date().toISOString()
      });

      // 5. Auditoria
      storageService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'ASSINATURA_PLANO',
        entity: `Plano: ${planDef.name}`,
        details: `Plano alterado para ${planDef.name} (${period === 'YEARLY' ? 'Anual' : 'Mensal'}). Provedor: ${paymentResult.provider}.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser.officeId
      });

      refreshUsers();

      return {
        success: true,
        message: `Plano ${planDef.name} ativado com sucesso!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao processar assinatura',
        error: err.message
      };
    }
  };

  const cancelSubscription = async (reason?: string): Promise<{ success: boolean; message: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Usuário não autenticado', error: 'Usuário não autenticado' };
    }

    if (currentUser.role === 'LAWYER' && !currentUser.isIndependent) {
      return { 
        success: false, 
        message: 'Apenas o sócio administrador pode cancelar a assinatura do escritório.',
        error: 'Apenas o sócio administrador pode cancelar a assinatura.'
      };
    }

    if (currentUser.isDemo) {
      return {
        success: false,
        message: 'A conta de demonstração não permite cancelamento.',
        error: 'A conta de demonstração não permite cancelamento.'
      };
    }

    try {
      try {
        await fetch('/api/plans/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              isIndependent: currentUser.isIndependent,
              isDemo: currentUser.isDemo
            },
            reason
          })
        });
      } catch (e) {
        console.warn('API /api/plans/cancel indisponível, aplicando fallback local');
      }

      await activePaymentProvider.cancelSubscription(currentUser.id);

      const updatedUser = storageService.updateUserSubscription(
        currentUser.id, 
        currentUser.subscriptionPlan || 'TRIAL', 
        currentUser.subscriptionPeriod || 'MONTHLY', 
        'CANCELED'
      );

      if (updatedUser) {
        setCurrentUser(updatedUser);
        storageService.saveCurrentUser(updatedUser);
      }

      storageService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'CANCELAMENTO_PLANO',
        entity: `Plano: ${currentUser.subscriptionPlan}`,
        details: `Cancelamento de assinatura solicitado. Motivo: ${reason || 'Não informado'}.`,
        ipAddress: '187.54.12.90',
        officeId: currentUser.officeId
      });

      refreshUsers();

      return {
        success: true,
        message: 'Assinatura cancelada com sucesso. Seu acesso continuará ativo até o final do período vigente.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao cancelar assinatura',
        error: err.message
      };
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
        ipAddress: '187.54.12.90',
        officeId: currentUser.officeId
      });
    }
    setCurrentUser(null);
    storageService.saveCurrentUser(null);
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const appAdminEmail = ((import.meta as any).env?.VITE_APP_ADMIN_EMAIL || 'otton.luis.alcaraz@gmail.com').toLowerCase();
  const isAppAdmin = !!currentUser?.isSuperAdmin || 
    (currentUser?.email ? currentUser.email.toLowerCase() === appAdminEmail : false);
  const isLawyer = currentUser?.role === 'LAWYER';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        isAppAdmin,
        isLawyer,
        login,
        registerUser,
        resendVerificationEmail,
        requestEmailChange,
        addLawyerByOffice,
        updateProfilePhoto,
        updateProfileData,
        changeSubscription,
        cancelSubscription,
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
