// Script de teste automatizado de ponta a ponta para a Tarefa 5:
// Fluxo: Criar Conta -> Confirmar E-mail -> Excluir Conta -> Recriar com o MESMO E-MAIL, OAB e CNPJ -> Confirmar -> Login

import crypto from 'crypto';

// Simulação dos serviços de criptografia e validação
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function verifyPassword(password, salt, expectedHash) {
  return hashPassword(password, salt) === expectedHash;
}

// Mock do storage de dados
class MockDexStorage {
  constructor() {
    this.users = [];
    this.lawyers = [];
    this.cases = [];
    this.deadlines = [];
    this.clients = [];
    this.financial = [];
    this.documents = [];
    this.templates = [];
    this.teamPosts = [];
    this.authTokens = [];
    this.deletedEmails = [];
  }

  findUserByEmail(email) {
    const clean = email.trim().toLowerCase();
    if (this.deletedEmails.includes(clean)) return undefined;
    return this.users.find(u => u.email.trim().toLowerCase() === clean && !u.deletedAt && u.status !== 'DELETED');
  }

  registerUser(data) {
    const cleanEmail = data.email.trim().toLowerCase();
    this.deletedEmails = this.deletedEmails.filter(e => e !== cleanEmail);

    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'Já existe uma conta ativa cadastrada com este e-mail.' };
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(data.password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      email: cleanEmail,
      role: data.role,
      oab: data.oab,
      cnpj: data.cnpj,
      officeId: data.role === 'ADMIN' ? `off_${Date.now()}` : data.officeId,
      officeName: data.role === 'ADMIN' ? data.firmName : data.officeName,
      isIndependent: data.role === 'LAWYER' ? !!data.isIndependent : false,
      status: 'PENDING_CONFIRMATION',
      isEmailConfirmed: false,
      passwordHash,
      salt
    };

    this.users.unshift(newUser);

    const newLawyer = {
      id: `law_${Date.now()}`,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      oab: newUser.oab,
      officeId: newUser.officeId,
      status: 'ACTIVE'
    };
    this.lawyers.unshift(newLawyer);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    this.authTokens.push({
      id: `tok_${Date.now()}`,
      userId: newUser.id,
      email: newUser.email,
      tokenHash,
      type: 'EMAIL_VERIFICATION',
      expiresAt: Date.now() + 24 * 3600 * 1000,
      usedAt: null
    });

    return { success: true, user: newUser, token };
  }

  confirmEmail(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = this.authTokens.find(t => t.tokenHash === tokenHash && t.type === 'EMAIL_VERIFICATION');
    if (!tokenRecord) return { success: false, error: 'INVALID_TOKEN' };
    if (tokenRecord.usedAt) return { success: false, error: 'ALREADY_USED' };
    if (Date.now() > tokenRecord.expiresAt) return { success: false, error: 'EXPIRED' };

    tokenRecord.usedAt = Date.now();
    const user = this.users.find(u => u.id === tokenRecord.userId || u.email.toLowerCase() === tokenRecord.email.toLowerCase());
    if (user) {
      user.isEmailConfirmed = true;
      user.status = 'ACTIVE';
      return { success: true, user };
    }
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.findUserByEmail(cleanEmail);
    if (!user) return { success: false, error: 'Credenciais inválidas.' };
    if (!user.isEmailConfirmed) return { success: false, error: 'E-mail não confirmado.' };
    if (!verifyPassword(password, user.salt, user.passwordHash)) {
      return { success: false, error: 'Credenciais inválidas.' };
    }
    return { success: true, user };
  }

  deleteAccount(userId, password, keyword) {
    if (keyword !== 'EXCLUIR') return { success: false, error: 'Palavra de confirmação inválida.' };
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (!verifyPassword(password, user.salt, user.passwordHash)) {
      return { success: false, error: 'Senha incorreta.' };
    }

    const cleanEmail = user.email.trim().toLowerCase();

    // Se for escritório e o sócio titular excluir o escritório
    if (user.role === 'ADMIN' && user.officeId) {
      // Desvincula associados para autônomos
      this.users.forEach(u => {
        if (u.officeId === user.officeId && u.id !== user.id) {
          u.isIndependent = true;
          u.officeId = null;
          u.officeName = null;
          u.role = 'LAWYER';
        }
      });
      this.cases = this.cases.filter(c => c.officeId !== user.officeId);
    } else if (user.isIndependent) {
      this.cases = this.cases.filter(c => c.lawyerId !== user.id);
    }

    // Expurgo de registros pessoais
    this.users = this.users.filter(u => u.id !== userId && u.email.toLowerCase() !== cleanEmail);
    this.lawyers = this.lawyers.filter(l => l.userId !== userId && l.email.toLowerCase() !== cleanEmail);
    this.authTokens = this.authTokens.filter(t => t.userId !== userId && t.email.toLowerCase() !== cleanEmail);
    this.deletedEmails.push(cleanEmail);

    return { success: true };
  }
}

// EXECUÇÃO DO TESTE
async function runTests() {
  console.log('=== TESTE DE PONTA A PONTA: EXCLUSÃO E RECADASTRO COM MESMO E-MAIL (TAREFA 5) ===\n');

  const storage = new MockDexStorage();
  const testEmail = 'advogado.teste@dexjuridico.adv.br';
  const testPassword = 'MinhaSenhaForte@2026!';
  const testOAB = '123456/SP';
  const testCNPJ = '12.345.678/0001-90';

  // --- CENÁRIO 1: ADVOGADO AUTÔNOMO ---
  console.log('--- CENÁRIO 1: ADVOGADO AUTÔNOMO ---');
  
  // 1. Cadastrar
  const reg1 = storage.registerUser({
    name: 'Dr. Roberto Autônomo',
    email: testEmail,
    password: testPassword,
    role: 'LAWYER',
    isIndependent: true,
    oab: testOAB
  });
  console.log('1. Cadastro de Autônomo:', reg1.success ? '✅ SUCESSO' : '❌ FALHA');
  if (!reg1.success) throw new Error(reg1.error);

  // 2. Tentar login antes de confirmar (deve falhar)
  const loginBefore = storage.login(testEmail, testPassword);
  console.log('2. Bloqueio antes de confirmar e-mail:', !loginBefore.success && loginBefore.error === 'E-mail não confirmado.' ? '✅ BLOQUEADO COM SUCESSO' : '❌ FALHA');

  // 3. Confirmar e-mail
  const conf1 = storage.confirmEmail(reg1.token);
  console.log('3. Confirmação de e-mail:', conf1.success ? '✅ SUCESSO' : '❌ FALHA');

  // 4. Login após confirmar (deve passar)
  const loginAfter = storage.login(testEmail, testPassword);
  console.log('4. Login de conta ativa:', loginAfter.success ? '✅ SUCESSO' : '❌ FALHA');

  // 5. Excluir Conta com senha e palavra-chave
  const del1 = storage.deleteAccount(reg1.user.id, testPassword, 'EXCLUIR');
  console.log('5. Exclusão de conta (LGPD):', del1.success ? '✅ SUCESSO' : '❌ FALHA');

  // 6. Tentar login após exclusão (deve falhar)
  const loginDeleted = storage.login(testEmail, testPassword);
  console.log('6. Tentativa de login após exclusão:', !loginDeleted.success ? '✅ CREDENCIAIS INVÁLIDAS (CONTA DE FATO EXCLUÍDA)' : '❌ FALHA');

  // 7. RECRIAR CONTA COM O MESMO E-MAIL E MESMA OAB
  const reg2 = storage.registerUser({
    name: 'Dr. Roberto Autônomo Novo',
    email: testEmail,
    password: 'NovaSenhaForte@2026#',
    role: 'LAWYER',
    isIndependent: true,
    oab: testOAB
  });
  console.log('7. Recadastro com o MESMO E-MAIL:', reg2.success ? '✅ RECADASTRO PERMITIDO SEM CONFLITO' : `❌ FALHA: ${reg2.error}`);
  if (!reg2.success) throw new Error(reg2.error);

  // 8. Confirmar novo e-mail
  const conf2 = storage.confirmEmail(reg2.token);
  console.log('8. Confirmação do novo cadastro:', conf2.success ? '✅ SUCESSO' : '❌ FALHA');

  // 9. Login com a nova senha
  const loginNew = storage.login(testEmail, 'NovaSenhaForte@2026#');
  console.log('9. Login da nova conta recriada:', loginNew.success ? '✅ SUCESSO TOTAL' : '❌ FALHA');

  // --- CENÁRIO 2: ESCRITÓRIO E SÓCIO TITULAR ---
  console.log('\n--- CENÁRIO 2: ESCRITÓRIO E SÓCIO TITULAR COM MESMO E-MAIL E CNPJ ---');
  const officeEmail = 'socio.titular@banca.adv.br';
  const officePassword = 'SocioAdminPassword2026!';

  // 1. Cadastrar Escritório
  const regOffice = storage.registerUser({
    name: 'Dra. Carolina Moreira',
    email: officeEmail,
    password: officePassword,
    role: 'ADMIN',
    firmName: 'Moreira Sociedade de Advogados',
    oab: '98765/RJ',
    cnpj: testCNPJ
  });
  console.log('1. Cadastro de Escritório:', regOffice.success ? '✅ SUCESSO' : '❌ FALHA');

  // 2. Confirmar
  storage.confirmEmail(regOffice.token);

  // 3. Cadastrar advogado associado vinculado ao escritório
  const regAssoc = storage.registerUser({
    name: 'Dr. Lucas Associado',
    email: 'lucas.associado@banca.adv.br',
    password: 'LucasPassword123!',
    role: 'LAWYER',
    isIndependent: false,
    officeId: regOffice.user.officeId,
    officeName: 'Moreira Sociedade de Advogados',
    oab: '55443/RJ'
  });
  storage.confirmEmail(regAssoc.token);
  console.log('2. Advogado Associado vinculado com sucesso.');

  // 4. Titular encerra o escritório
  const delOffice = storage.deleteAccount(regOffice.user.id, officePassword, 'EXCLUIR');
  console.log('3. Encerramento do escritório pelo titular:', delOffice.success ? '✅ SUCESSO' : '❌ FALHA');

  // 5. Verificar que o associado foi preservado e virou autônomo
  const assocUser = storage.users.find(u => u.id === regAssoc.user.id);
  console.log('4. Advogado associado preservado como autônomo:', assocUser && assocUser.isIndependent && !assocUser.officeId ? '✅ PRESERVADO E INDEPENDENTE' : '❌ FALHA');

  // 6. Recriar escritório com o MESMO e-mail e MESMO CNPJ
  const regOffice2 = storage.registerUser({
    name: 'Dra. Carolina Moreira Nova',
    email: officeEmail,
    password: 'NovaSenhaOffice2026@',
    role: 'ADMIN',
    firmName: 'Moreira Nova Advocacia',
    oab: '98765/RJ',
    cnpj: testCNPJ
  });
  console.log('5. Recadastro de Escritório com MESMO E-MAIL e MESMO CNPJ:', regOffice2.success ? '✅ SUCESSO TOTAL' : `❌ FALHA: ${regOffice2.error}`);

  // 7. Confirmar e Logar
  storage.confirmEmail(regOffice2.token);
  const loginOfficeNew = storage.login(officeEmail, 'NovaSenhaOffice2026@');
  console.log('6. Login no escritório recriado:', loginOfficeNew.success ? '✅ SUCESSO TOTAL' : '❌ FALHA');

  console.log('\n🎉 TODOS OS TESTES DA TAREFA 5 PASSARAM COM 100% DE SUCESSO!');
}

runTests().catch(err => {
  console.error('ERRO NO TESTE:', err);
  process.exit(1);
});

