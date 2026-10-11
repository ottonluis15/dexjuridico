import { 
  User, 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  AuditLog,
  TemplateDocument,
  WallPost 
} from '../types';

// Salt e Hash criptográfico gerado para a senha padrão "Admin123!"
const DEFAULT_SALT = 'a1b2c3d4e5f60718';
const DEFAULT_HASH = '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55';

// Identificador unificado do escritório principal
export const PRIMARY_OFFICE_ID = 'off_dex_principal';
export const PRIMARY_OFFICE_NAME = 'Moreira & Alcaraz Advogados Associados';
export const PRIMARY_OFFICE_CODE = 'DEX-1001';

/**
 * USUÁRIOS DO SISTEMA
 * Inclui Sócios Administradores, os 6 Advogados Associados de áreas diferentes e 1 Advogado Autônomo para testes de isolamento.
 */
export const INITIAL_USERS: User[] = [
  // 1. SÓCIO ADMINISTRADOR - DRA. HELENA MOREIRA
  {
    id: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'admin@dexjuridico.adv.br',
    role: 'ADMIN',
    isSuperAdmin: false,
    oab: '184.920/SP',
    phone: '(11) 98765-4321',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  },
  // 2. SÓCIO ADMINISTRADOR & APP ADMIN - DR. OTTON LUIS
  {
    id: 'usr_admin_otton',
    name: 'Dr. Otton Luis',
    email: 'otton.luis.alcaraz@gmail.com',
    role: 'ADMIN',
    isSuperAdmin: true,
    oab: '245.890/SP',
    phone: '(11) 99999-8888',
    specialties: ['Direito Digital', 'Contratos', 'Direito Civil Estratégico'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
  },
  // 3. ADVOGADO 1: DIREITO DO TRABALHO - DR. LUCAS MENDES
  {
    id: 'usr_law_lucas',
    name: 'Dr. Lucas Mendes',
    email: 'lucas.mendes@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '312.450/SP',
    phone: '(11) 97654-3210',
    specialties: ['Direito do Trabalho', 'Processo do Trabalho', 'Acidente de Trabalho'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  },
  // 4. ADVOGADO 2: DIREITO TRIBUTÁRIO - DRA. CAMILA ROCHA
  {
    id: 'usr_law_camila',
    name: 'Dra. Camila Rocha',
    email: 'camila.rocha@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '198.742/RJ',
    phone: '(21) 98877-6655',
    specialties: ['Direito Tributário', 'Execuções Fiscais', 'Planejamento Tributário'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&auto=format&fit=crop',
  },
  // 5. ADVOGADO 3: DIREITO EMPRESARIAL & SOCIETÁRIO - DR. RAFAEL SILVEIRA
  {
    id: 'usr_law_rafael',
    name: 'Dr. Rafael Silveira',
    email: 'rafael.silveira@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '264.310/SP',
    phone: '(11) 98123-4567',
    specialties: ['Direito Empresarial', 'Fusões e Aquisições (M&A)', 'Recuperação Judicial'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
  },
  // 6. ADVOGADO 4: DIREITO DIGITAL & LGPD - DRA. JULIANA MATSUOKA
  {
    id: 'usr_law_juliana',
    name: 'Dra. Juliana Matsuoka',
    email: 'juliana.matsuoka@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '54.890/DF',
    phone: '(61) 99182-7364',
    specialties: ['Direito Digital', 'LGPD & Governança', 'Propriedade Intelectual'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
  },
  // 7. ADVOGADO 5: DIREITO DE FAMÍLIA & SUCESSÕES - DR. GABRIEL FONTES
  {
    id: 'usr_law_gabriel',
    name: 'Dr. Gabriel Fontes',
    email: 'gabriel.fontes@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '172.930/MG',
    phone: '(31) 98456-1234',
    specialties: ['Direito de Família', 'Inventários e Partilhas', 'Holding Familiar'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
  },
  // 8. ADVOGADO 6: DIREITO CÍVEL & IMOBILIÁRIO - DRA. MARIANA VASCONCELOS
  {
    id: 'usr_law_mariana',
    name: 'Dra. Mariana Vasconcelos',
    email: 'mariana.vasconcelos@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '89.450/RS',
    phone: '(51) 99765-8899',
    specialties: ['Direito Imobiliário', 'Responsabilidade Civil', 'Contratos de Locação'],
    status: 'ACTIVE',
    officeId: PRIMARY_OFFICE_ID,
    officeName: PRIMARY_OFFICE_NAME,
    officeCode: PRIMARY_OFFICE_CODE,
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
  },
  // 9. ADVOGADO AUTÔNOMO EXTERNO (PARA DEMONSTRAÇÃO DE ISOLAMENTO RBAC)
  {
    id: 'usr_lawyer_autonomo',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '278.114/SP',
    phone: '(11) 96543-2109',
    specialties: ['Direito de Família', 'Cível Geral'],
    status: 'ACTIVE',
    isIndependent: true,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  }
];

/**
 * CORPO JURÍDICO / ADVOGADOS (MÓDULO EQUIPE)
 */
export const INITIAL_LAWYERS: Lawyer[] = [
  // 1. SÓCIO ADMINISTRADOR - DRA. HELENA MOREIRA
  {
    id: 'law_1',
    userId: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'admin@dexjuridico.adv.br',
    phone: '(11) 98765-4321',
    oab: '184.920/SP',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    roleTitle: 'Sócia Administradora',
    assignedCasesCount: 1,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  },
  // 2. SÓCIO FUNDADOR - DR. OTTON LUIS
  {
    id: 'law_otton',
    userId: 'usr_admin_otton',
    name: 'Dr. Otton Luis',
    email: 'otton.luis.alcaraz@gmail.com',
    phone: '(11) 99999-8888',
    oab: '245.890/SP',
    specialties: ['Direito Digital', 'Contratos', 'Direito Civil Estratégico'],
    status: 'ACTIVE',
    roleTitle: 'Sócio & Diretor Jurídico',
    assignedCasesCount: 1,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
  },
  // 3. ADVOGADO 1: DIREITO DO TRABALHO
  {
    id: 'law_lucas',
    userId: 'usr_law_lucas',
    name: 'Dr. Lucas Mendes',
    email: 'lucas.mendes@dexjuridico.adv.br',
    phone: '(11) 97654-3210',
    oab: '312.450/SP',
    specialties: ['Direito do Trabalho', 'Processo do Trabalho', 'Acidente de Trabalho'],
    status: 'ACTIVE',
    roleTitle: 'Advogado Associado - Trabalhista',
    assignedCasesCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  },
  // 4. ADVOGADO 2: DIREITO TRIBUTÁRIO
  {
    id: 'law_camila',
    userId: 'usr_law_camila',
    name: 'Dra. Camila Rocha',
    email: 'camila.rocha@dexjuridico.adv.br',
    phone: '(21) 98877-6655',
    oab: '198.742/RJ',
    specialties: ['Direito Tributário', 'Execuções Fiscais', 'Planejamento Tributário'],
    status: 'ACTIVE',
    roleTitle: 'Coordenadora da Área Tributária',
    assignedCasesCount: 3,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&auto=format&fit=crop',
  },
  // 5. ADVOGADO 3: DIREITO EMPRESARIAL & SOCIETÁRIO
  {
    id: 'law_rafael',
    userId: 'usr_law_rafael',
    name: 'Dr. Rafael Silveira',
    email: 'rafael.silveira@dexjuridico.adv.br',
    phone: '(11) 98123-4567',
    oab: '264.310/SP',
    specialties: ['Direito Empresarial', 'Fusões e Aquisições (M&A)', 'Recuperação Judicial'],
    status: 'ACTIVE',
    roleTitle: 'Advogado Associado - Empresarial',
    assignedCasesCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
  },
  // 6. ADVOGADO 4: DIREITO DIGITAL & LGPD
  {
    id: 'law_juliana',
    userId: 'usr_law_juliana',
    name: 'Dra. Juliana Matsuoka',
    email: 'juliana.matsuoka@dexjuridico.adv.br',
    phone: '(61) 99182-7364',
    oab: '54.890/DF',
    specialties: ['Direito Digital', 'LGPD & Governança', 'Propriedade Intelectual'],
    status: 'ACTIVE',
    roleTitle: 'Especialista em Privacy & Legal Tech',
    assignedCasesCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
  },
  // 7. ADVOGADO 5: DIREITO DE FAMÍLIA & SUCESSÕES
  {
    id: 'law_gabriel',
    userId: 'usr_law_gabriel',
    name: 'Dr. Gabriel Fontes',
    email: 'gabriel.fontes@dexjuridico.adv.br',
    phone: '(31) 98456-1234',
    oab: '172.930/MG',
    specialties: ['Direito de Família', 'Inventários e Partilhas', 'Holding Familiar'],
    status: 'ACTIVE',
    roleTitle: 'Advogado Associado - Família e Sucessões',
    assignedCasesCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
  },
  // 8. ADVOGADO 6: DIREITO CÍVEL & IMOBILIÁRIO
  {
    id: 'law_mariana',
    userId: 'usr_law_mariana',
    name: 'Dra. Mariana Vasconcelos',
    email: 'mariana.vasconcelos@dexjuridico.adv.br',
    phone: '(51) 99765-8899',
    oab: '89.450/RS',
    specialties: ['Direito Imobiliário', 'Responsabilidade Civil', 'Contratos de Locação'],
    status: 'ACTIVE',
    roleTitle: 'Advogada Associada - Cível e Imobiliário',
    assignedCasesCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
  },
  // 9. ADVOGADO AUTÔNOMO EXTERNO
  {
    id: 'law_autonomo',
    userId: 'usr_lawyer_autonomo',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    phone: '(11) 96543-2109',
    oab: '278.114/SP',
    specialties: ['Direito de Família', 'Cível Geral'],
    status: 'ACTIVE',
    roleTitle: 'Advogada Autônoma',
    assignedCasesCount: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  }
];

/**
 * CLIENTES (PJ & PF)
 */
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_techvanguard',
    name: 'TechVanguard Soluções Digitais Ltda',
    type: 'PJ',
    document: '34.891.204/0001-95',
    email: 'juridico@techvanguard.com.br',
    phone: '(11) 3450-9800',
    address: {
      street: 'Av. Paulista',
      number: '1842',
      complement: '14º Andar - Cj 141',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-923'
    },
    notes: 'Cliente corporativo com assessoria mensal (retainer e contencioso).',
    createdAt: '2026-01-15',
    status: 'ACTIVE',
    linkedLawyerId: 'law_rafael',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_bionutri',
    name: 'BioNutri Indústria de Alimentos S.A.',
    type: 'PJ',
    document: '19.340.892/0001-14',
    email: 'tributario@bionutrialimentos.com.br',
    phone: '(19) 3812-4400',
    address: {
      street: 'Rodovia Anhanguera, Km 98',
      number: 'S/N',
      neighborhood: 'Distrito Industrial',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13065-001'
    },
    notes: 'Indústria alimentícia com carteira relevante de litígios tributários e aduaneiros.',
    createdAt: '2026-01-20',
    status: 'ACTIVE',
    linkedLawyerId: 'law_camila',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_logexpress',
    name: 'LogExpress Transportes e Logística S.A.',
    type: 'PJ',
    document: '45.109.823/0001-60',
    email: 'rh.juridico@logexpress.com.br',
    phone: '(13) 3224-5500',
    address: {
      street: 'Av. Portuária',
      number: '420',
      neighborhood: 'Porto',
      city: 'Santos',
      state: 'SP',
      zipCode: '11015-002'
    },
    notes: 'Frota pesada de transporte rodoviário. Contencioso de massa trabalhista.',
    createdAt: '2026-01-25',
    status: 'ACTIVE',
    linkedLawyerId: 'law_lucas',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_construtora',
    name: 'Construtora Horizonte Sul Ltda',
    type: 'PJ',
    document: '22.841.905/0001-83',
    email: 'diretoria@horizontesul.eng.br',
    phone: '(21) 2540-1122',
    address: {
      street: 'Av. Rio Branco',
      number: '156',
      complement: 'Sala 2104',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-006'
    },
    notes: 'Incorporadora imobiliária com foco em obras de infraestrutura.',
    createdAt: '2026-02-01',
    status: 'ACTIVE',
    linkedLawyerId: 'law_camila',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_investcore',
    name: 'InvestCore Participações Societárias S.A.',
    type: 'PJ',
    document: '08.921.430/0001-52',
    email: 'compliance@investcore.com.br',
    phone: '(11) 3044-8899',
    address: {
      street: 'Rua Funchal',
      number: '418',
      complement: '18º Andar',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04551-060'
    },
    notes: 'Gestora de fundos de private equity e investimentos estratégicos.',
    createdAt: '2026-02-05',
    status: 'ACTIVE',
    linkedLawyerId: 'law_rafael',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_nexahealth',
    name: 'NexaHealth Plataforma de Telemedicina Ltda',
    type: 'PJ',
    document: '38.490.112/0001-44',
    email: 'dpo@nexahealth.med.br',
    phone: '(61) 3328-9010',
    address: {
      street: 'Setor Comercial Sul, Quadra 4',
      number: 'Ed. Prime',
      complement: 'Sala 601',
      neighborhood: 'Asa Sul',
      city: 'Brasília',
      state: 'DF',
      zipCode: '70304-000'
    },
    notes: 'Healthtech com aplicativo de telemedicina e armazenamento em nuvem de prontuários.',
    createdAt: '2026-02-10',
    status: 'ACTIVE',
    linkedLawyerId: 'law_juliana',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_belladonna',
    name: 'BellaDonna Cosméticos e Franquias Ltda',
    type: 'PJ',
    document: '14.890.312/0001-78',
    email: 'franquias@belladonna.com.br',
    phone: '(51) 3330-7766',
    address: {
      street: 'Rua Padre Chagas',
      number: '380',
      neighborhood: 'Moinhos de Vento',
      city: 'Porto Alegre',
      state: 'RS',
      zipCode: '90570-080'
    },
    notes: 'Rede franqueadora com mais de 35 lojas em shoppings e centros comerciais.',
    createdAt: '2026-02-15',
    status: 'ACTIVE',
    linkedLawyerId: 'law_mariana',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_mariana',
    name: 'Mariana Silveira Campos',
    type: 'PF',
    document: '289.410.878-45',
    email: 'mariana.silveira@gmail.com',
    phone: '(11) 98112-4433',
    address: {
      street: 'Rua Oscar Freire',
      number: '920',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001'
    },
    notes: 'Inventário e partilha de bens com expressivo acervo patrimonial.',
    createdAt: '2026-02-18',
    status: 'ACTIVE',
    linkedLawyerId: 'law_gabriel',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_eduardo',
    name: 'Eduardo Barreto Vasques',
    type: 'PF',
    document: '104.923.841-90',
    email: 'eduardo.vasques@uol.com.br',
    phone: '(31) 99871-3322',
    address: {
      street: 'Rua da Bahia',
      number: '1840',
      neighborhood: 'Lourdes',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30160-012'
    },
    notes: 'Demanda familiar contenciosa sobre guarda de menores e fixação de alimentos.',
    createdAt: '2026-02-22',
    status: 'ACTIVE',
    linkedLawyerId: 'law_gabriel',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'cli_marcelo',
    name: 'Marcelo Henrique Fagundes',
    type: 'PF',
    document: '392.481.002-33',
    email: 'marcelo.fagundes@terra.com.br',
    phone: '(51) 99120-4499',
    address: {
      street: 'Av. Carlos Gomes',
      number: '1100',
      complement: 'Apto 802',
      neighborhood: 'Auxiliadora',
      city: 'Porto Alegre',
      state: 'RS',
      zipCode: '90480-001'
    },
    notes: 'Comprador prejudicado por atraso substancial na entrega de imóvel na planta.',
    createdAt: '2026-03-01',
    status: 'ACTIVE',
    linkedLawyerId: 'law_mariana',
    officeId: PRIMARY_OFFICE_ID
  }
];

/**
 * 15 PROCESSOS JUDICIAIS NO FORMATO OFICIAL CNJ
 * Distribuídos pelas 6 áreas de atuação da banca.
 */
export const INITIAL_CASES: LegalCase[] = [
  // 1. TRABALHISTA - DR. LUCAS MENDES
  {
    id: 'case_1',
    caseNumber: '1004521-88.2026.5.02.0045',
    court: '45ª Vara do Trabalho de São Paulo - TRT-2',
    clientId: 'cli_techvanguard',
    lawyerId: 'law_lucas',
    legalArea: 'Trabalhista',
    actionType: 'Reclamatória Trabalhista - Equiparação Salarial e Horas Extras',
    status: 'INICIAL',
    value: 145000.00,
    distributionDate: '2026-02-18',
    description: 'Defesa corporativa da reclamada contra pleito de equiparação de engenheiro de software e comissões.',
    updatedAt: '2026-03-05',
    officeId: PRIMARY_OFFICE_ID
  },
  // 2. TRABALHISTA - DR. LUCAS MENDES
  {
    id: 'case_2',
    caseNumber: '0010923-54.2025.5.02.0012',
    court: '12ª Vara do Trabalho de São Paulo - TRT-2',
    clientId: 'cli_logexpress',
    lawyerId: 'law_lucas',
    legalArea: 'Trabalhista',
    actionType: 'Ação Trabalhista - Acidente de Trabalho e Dano Moral',
    status: 'INSTRUCAO',
    value: 280000.00,
    distributionDate: '2025-08-14',
    description: 'Ação indenizatória por alegado acidente no transporte interestadual. Realização de perícia ergonômica.',
    updatedAt: '2026-03-08',
    officeId: PRIMARY_OFFICE_ID
  },
  // 3. TRIBUTÁRIO - DRA. CAMILA ROCHA
  {
    id: 'case_3',
    caseNumber: '5012948-33.2025.4.03.6100',
    court: '7ª Vara Cível Federal de São Paulo - TRF-3',
    clientId: 'cli_bionutri',
    lawyerId: 'law_camila',
    legalArea: 'Tributário',
    actionType: 'Mandado de Segurança - Exclusão do ICMS da Base de Cálculo do PIS/COFINS',
    status: 'SENTENCA',
    value: 1850000.00,
    distributionDate: '2025-03-10',
    description: 'Aplicação do Tema 69/STF. Sentença concessiva da segurança para compensação administrativa de créditos.',
    updatedAt: '2026-03-12',
    officeId: PRIMARY_OFFICE_ID
  },
  // 4. TRIBUTÁRIO - DRA. CAMILA ROCHA
  {
    id: 'case_4',
    caseNumber: '0043819-15.2024.4.02.5101',
    court: '3ª Vara Federal de Execução Fiscal do Rio de Janeiro - TRF-2',
    clientId: 'cli_construtora',
    lawyerId: 'law_camila',
    legalArea: 'Tributário',
    actionType: 'Embargos à Execução Fiscal - Cobrança Indevida de IRPJ e CSLL',
    status: 'RECURSAL',
    value: 720000.00,
    distributionDate: '2024-11-05',
    description: 'Impugnação à CDA com garantia via seguro-fiança judicial. Agravo de instrumento pendente de julgamento.',
    updatedAt: '2026-02-28',
    officeId: PRIMARY_OFFICE_ID
  },
  // 5. TRIBUTÁRIO - DRA. CAMILA ROCHA
  {
    id: 'case_5',
    caseNumber: '1034921-70.2025.8.26.0053',
    court: '11ª Vara da Fazenda Pública da Capital - TJSP',
    clientId: 'cli_bionutri',
    lawyerId: 'law_camila',
    legalArea: 'Tributário',
    actionType: 'Ação Anulatória de Débito Fiscal Estadual - Glosa de Créditos de ICMS',
    status: 'INICIAL',
    value: 490000.00,
    distributionDate: '2025-10-18',
    description: 'Auto de infração estadual contra entrada interestadual de insumos agrícolas com diferimento de alíquota.',
    updatedAt: '2026-03-02',
    officeId: PRIMARY_OFFICE_ID
  },
  // 6. EMPRESARIAL - DR. RAFAEL SILVEIRA
  {
    id: 'case_6',
    caseNumber: '1023849-12.2025.8.26.0100',
    court: '2ª Vara Cível do Foro Central Cível da Capital - TJSP',
    clientId: 'cli_techvanguard',
    lawyerId: 'law_rafael',
    legalArea: 'Empresarial',
    actionType: 'Ação de Rescisão Contratual c/c Perdas e Danos - Contrato de Tecnologia',
    status: 'INSTRUCAO',
    value: 340000.00,
    distributionDate: '2025-11-20',
    description: 'Inadimplemento culposo de fornecedor internacional de módulos de IA com perda de contratos comerciais.',
    updatedAt: '2026-03-01',
    officeId: PRIMARY_OFFICE_ID
  },
  // 7. EMPRESARIAL - DR. RAFAEL SILVEIRA
  {
    id: 'case_7',
    caseNumber: '1089201-44.2025.8.26.0100',
    court: '1ª Vara Regional de Competência Empresarial e Arbitragem - TJSP',
    clientId: 'cli_investcore',
    lawyerId: 'law_rafael',
    legalArea: 'Empresarial',
    actionType: 'Ação de Dissolução Parcial de Sociedade c/ Apuração de Haveres',
    status: 'INICIAL',
    value: 2400000.00,
    distributionDate: '2025-12-02',
    description: 'Retirada de sócio minoritário com divergência contábil sobre avaliação pelo método de fluxo de caixa descontado.',
    updatedAt: '2026-02-25',
    officeId: PRIMARY_OFFICE_ID
  },
  // 8. DIREITO DIGITAL / LGPD - DRA. JULIANA MATSUOKA
  {
    id: 'case_8',
    caseNumber: '1045920-80.2026.8.26.0100',
    court: '34ª Vara Cível Central de São Paulo - TJSP',
    clientId: 'cli_nexahealth',
    lawyerId: 'law_juliana',
    legalArea: 'Direito Digital',
    actionType: 'Ação de Indenização por Incidente de Segurança da Informação (LGPD)',
    status: 'INICIAL',
    value: 380000.00,
    distributionDate: '2026-01-29',
    description: 'Defesa em demanda coletiva após tentativa frustrada de ransomware sem exfiltração de dados sensíveis de pacientes.',
    updatedAt: '2026-03-09',
    officeId: PRIMARY_OFFICE_ID
  },
  // 9. DIREITO DIGITAL / MARCAS - DRA. JULIANA MATSUOKA
  {
    id: 'case_9',
    caseNumber: '5009841-20.2025.4.02.5101',
    court: '9ª Vara Federal da Seção Judiciária do Rio de Janeiro - TRF-2',
    clientId: 'cli_nexahealth',
    lawyerId: 'law_juliana',
    legalArea: 'Direito Digital',
    actionType: 'Ação de Nulidade de Registro de Marca c/ Pedido de Tutela Antecipada',
    status: 'INSTRUCAO',
    value: 550000.00,
    distributionDate: '2025-07-22',
    description: 'Conflito de registro perante o INPI envolvendo nome empresarial anterior e usurpação de domínio eletrônico.',
    updatedAt: '2026-02-14',
    officeId: PRIMARY_OFFICE_ID
  },
  // 10. FAMÍLIA E SUCESSÕES - DR. GABRIEL FONTES
  {
    id: 'case_10',
    caseNumber: '1008734-62.2025.8.13.0024',
    court: '2ª Vara de Sucessões e Ausência de Belo Horizonte - TJMG',
    clientId: 'cli_mariana',
    lawyerId: 'law_gabriel',
    legalArea: 'Família e Sucessões',
    actionType: 'Inventário Judicial com Partilha de Quotas Societárias e Bens Imóveis',
    status: 'INSTRUCAO',
    value: 4200000.00,
    distributionDate: '2025-05-18',
    description: 'Elaboração do plano de partilha amigável de acervo imobiliário rural e cotas de sociedade holding.',
    updatedAt: '2026-03-04',
    officeId: PRIMARY_OFFICE_ID
  },
  // 11. FAMÍLIA E SUCESSÕES - DR. GABRIEL FONTES
  {
    id: 'case_11',
    caseNumber: '1015642-19.2026.8.13.0024',
    court: '4ª Vara de Família de Belo Horizonte - TJMG',
    clientId: 'cli_eduardo',
    lawyerId: 'law_gabriel',
    legalArea: 'Família e Sucessões',
    actionType: 'Ação Revisional de Alimentos c/c Regulamentação de Guarda Compartilhada',
    status: 'INSTRUCAO',
    value: 96000.00,
    distributionDate: '2026-02-10',
    description: 'Adequação do binômio necessidade-possibilidade em razão de alteração comprovada no padrão remuneratório.',
    updatedAt: '2026-03-07',
    officeId: PRIMARY_OFFICE_ID
  },
  // 12. CÍVEL & IMOBILIÁRIO - DRA. MARIANA VASCONCELOS
  {
    id: 'case_12',
    caseNumber: '5043810-90.2025.8.21.0001',
    court: '16ª Vara Cível do Foro Central de Porto Alegre - TJRS',
    clientId: 'cli_belladonna',
    lawyerId: 'law_mariana',
    legalArea: 'Cível',
    actionType: 'Ação Renovatória de Locação Comercial em Shopping Center',
    status: 'SENTENCA',
    value: 410000.00,
    distributionDate: '2025-04-12',
    description: 'Renovação compulsória de locação do ponto comercial nos termos do art. 51 da Lei nº 8.245/91. Fixação de aluguel pericial.',
    updatedAt: '2026-02-27',
    officeId: PRIMARY_OFFICE_ID
  },
  // 13. CÍVEL & IMOBILIÁRIO - DRA. MARIANA VASCONCELOS
  {
    id: 'case_13',
    caseNumber: '5019842-11.2026.8.21.0001',
    court: '5ª Vara Cível de Porto Alegre - TJRS',
    clientId: 'cli_marcelo',
    lawyerId: 'law_mariana',
    legalArea: 'Cível',
    actionType: 'Ação Rescisória de Compra e Venda de Imóvel c/ Restituição Integral',
    status: 'INICIAL',
    value: 620000.00,
    distributionDate: '2026-02-24',
    description: 'Atraso de mais de 14 meses na entrega da posse física do apartamento. Pedido de lucros cessantes e devolução de 100% dos valores pagos.',
    updatedAt: '2026-03-10',
    officeId: PRIMARY_OFFICE_ID
  },
  // 14. EMPRESARIAL / EXECUÇÃO - DRA. HELENA MOREIRA
  {
    id: 'case_14',
    caseNumber: '1067219-40.2024.8.26.0100',
    court: '22ª Vara Cível Central da Capital - TJSP',
    clientId: 'cli_investcore',
    lawyerId: 'law_1',
    legalArea: 'Empresarial',
    actionType: 'Execução de Título Extrajudicial - Contrato de Mútuo Conversível',
    status: 'EXECUCAO',
    value: 1150000.00,
    distributionDate: '2024-09-15',
    description: 'Cobrança forçada de instrumento particular de dívida não liquidado no termo acordado. Bloqueio via Sisbajud.',
    updatedAt: '2026-03-03',
    officeId: PRIMARY_OFFICE_ID
  },
  // 15. DIREITO DIGITAL / CONTRATOS TECNOLÓGICOS - DR. OTTON LUIS
  {
    id: 'case_15',
    caseNumber: '1092834-05.2025.8.26.0100',
    court: '3ª Vara Cível Central da Capital - TJSP',
    clientId: 'cli_techvanguard',
    lawyerId: 'law_otton',
    legalArea: 'Direito Digital',
    actionType: 'Ação Declaratória de Inexistência de Débito c/ Obrigação de Fazer - API Cloud',
    status: 'RECURSAL',
    value: 890000.00,
    distributionDate: '2025-06-30',
    description: 'Disputa contra multinacional de infraestrutura em nuvem por faturamento errôneo de consumo extraordinário de tokens de inteligência artificial.',
    updatedAt: '2026-03-11',
    officeId: PRIMARY_OFFICE_ID
  }
];

/**
 * PRAZOS FATAIS & AUDIÊNCIAS (AGENDA OPERACIONAL)
 */
export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'ded_1',
    caseId: 'case_1',
    lawyerId: 'law_lucas',
    type: 'Contestação',
    description: 'Protocolar contestação trabalhista com documentos comprobatórios de jornada e espelhos de ponto.',
    dueDate: '2026-10-15',
    dueTime: '18:00',
    priority: 'CRITICAL',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'ded_2',
    caseId: 'case_3',
    lawyerId: 'law_camila',
    type: 'Recurso / Apelação',
    description: 'Apresentar contrarrazões ao recurso de apelação da Fazenda Nacional no TRF-3.',
    dueDate: '2026-10-16',
    dueTime: '19:00',
    priority: 'HIGH',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'ded_3',
    caseId: 'case_6',
    lawyerId: 'law_rafael',
    type: 'Manifestação',
    description: 'Apresentar manifestação sobre laudo pericial contábil e indicar assistente técnico.',
    dueDate: '2026-10-18',
    dueTime: '17:00',
    priority: 'HIGH',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'ded_4',
    caseId: 'case_8',
    lawyerId: 'law_juliana',
    type: 'Audiência de Conciliação',
    description: 'Audiência telepresencial no CEJUSC Central sobre demanda indenizatória de dados.',
    dueDate: '2026-10-21',
    dueTime: '14:30',
    priority: 'NORMAL',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'ded_5',
    caseId: 'case_10',
    lawyerId: 'law_gabriel',
    type: 'Manifestação',
    description: 'Juntar esboço consensual de partilha assinado por todos os herdeiros.',
    dueDate: '2026-10-25',
    dueTime: '18:00',
    priority: 'MEDIUM',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'ded_6',
    caseId: 'case_12',
    lawyerId: 'law_mariana',
    type: 'Manifestação',
    description: 'Juntada de memoriais em substituição aos debates orais na Ação Renovatória.',
    dueDate: '2026-10-29',
    dueTime: '19:00',
    priority: 'HIGH',
    status: 'PENDING',
    officeId: PRIMARY_OFFICE_ID
  }
];

/**
 * HONORÁRIOS & GESTÃO FINANCEIRA
 */
export const INITIAL_FINANCIAL: FinancialEntry[] = [
  {
    id: 'fin_1',
    type: 'MENSALIDADE',
    title: 'Assessoria Mensal Contratual (Retainer) - TechVanguard',
    clientId: 'cli_techvanguard',
    caseId: 'case_6',
    lawyerId: 'law_rafael',
    amount: 14500.00,
    dueDate: '2026-10-15',
    status: 'PENDENTE',
    paymentMethod: 'PIX',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'fin_2',
    type: 'HONORARIOS_INICIAIS',
    title: 'Honorários Iniciais - Mandado de Segurança BioNutri',
    clientId: 'cli_bionutri',
    caseId: 'case_3',
    lawyerId: 'law_camila',
    amount: 32000.00,
    dueDate: '2026-09-30',
    status: 'PAGO',
    paymentDate: '2026-09-29',
    paymentMethod: 'TRANSFERENCIA',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'fin_3',
    type: 'HONORARIOS_EXITO',
    title: 'Honorários de Êxito - Fase 1 Inventário Mariana Silveira',
    clientId: 'cli_mariana',
    caseId: 'case_10',
    lawyerId: 'law_gabriel',
    amount: 55000.00,
    dueDate: '2026-11-10',
    status: 'PENDENTE',
    paymentMethod: 'PIX',
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'fin_4',
    type: 'MENSALIDADE',
    title: 'Retainer Consultoria LGPD - NexaHealth Telemedicina',
    clientId: 'cli_nexahealth',
    caseId: 'case_8',
    lawyerId: 'law_juliana',
    amount: 9800.00,
    dueDate: '2026-10-20',
    status: 'PENDENTE',
    paymentMethod: 'BOLETO',
    officeId: PRIMARY_OFFICE_ID
  }
];

/**
 * REPOSITÓRIO DE DOCUMENTOS
 */
export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    name: 'Contrato_Prestacao_Servicos_TechVanguard.pdf',
    category: 'CONTRATO_HONORARIOS',
    clientId: 'cli_techvanguard',
    caseId: 'case_6',
    uploadedByLawyerId: 'law_rafael',
    fileSize: 420000,
    fileType: 'application/pdf',
    createdAt: '2026-01-15',
    isConfidential: true,
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'doc_2',
    name: 'Mandado_Seguranca_Peticao_Inicial_BioNutri.pdf',
    category: 'PETICAO',
    clientId: 'cli_bionutri',
    caseId: 'case_3',
    uploadedByLawyerId: 'law_camila',
    fileSize: 840000,
    fileType: 'application/pdf',
    createdAt: '2026-03-10',
    isConfidential: false,
    officeId: PRIMARY_OFFICE_ID
  },
  {
    id: 'doc_3',
    name: 'Relatorio_Auditoria_Seguranca_LGPD_NexaHealth.pdf',
    category: 'LAUDO_PERICIAL',
    clientId: 'cli_nexahealth',
    caseId: 'case_8',
    uploadedByLawyerId: 'law_juliana',
    fileSize: 1250000,
    fileType: 'application/pdf',
    createdAt: '2026-01-30',
    isConfidential: true,
    officeId: PRIMARY_OFFICE_ID
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Base de modelos jurídicos padrão disponíveis para download funcional imediato
export const INITIAL_TEMPLATES: TemplateDocument[] = [
  {
    id: 'tpl_1',
    title: 'Procuração Geral Ad Judicia et Extra',
    category: 'PROCURACAO',
    description: 'Instrumento padrão de mandato judicial com poderes para foro em geral e cláusula ad judicia et extra.',
    fileName: 'Procuracao_Geral_Ad_Judicia.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 48500,
    fileData: 'data:application/msword;base64,UEsDBBQABgAIAAAAIQD/0sK8eQEAADoGAAATAAAAd29yZC9kb2N1bWVudC54bWyNk9tu2zAMhu8H7B0E3xfHTto1s1uUrhcYYOti2N2Ahk3bQGRLTly0efrZSYftYQe22yQ/inwfv7d08a5v9Y45V5kK2A5T24EWWa6KSuBu87Q/sW2XSc1VpUqlwQ68595+v/i2bM6gL2WzNaoZcI6u+u1+lW1HbdsuoE44N9pYwFfXjG217j4m642u6o4o07T99g71K3a9fNtt0w15oQ4v4H7kI0/iN8H9j+8H/2b8xQ/rA54/Ld9/Wb79kZ/36H8D',
    uploadedByUserId: 'system',
    uploadedByName: 'Dex Jurídico',
    createdAt: '2026-01-10'
  },
  {
    id: 'tpl_2',
    title: 'Contrato de Prestação de Serviços Advocatícios e Honorários',
    category: 'CONTRATO',
    description: 'Contrato de honorários com cláusula de êxito (quota litis), reembolso de custas e previsão de execução.',
    fileName: 'Contrato_Honorarios_Advocaticios.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 62400,
    fileData: 'data:application/msword;base64,UEsDBBQABgAIAAAAIQD/0sK8eQEAADoGAAATAAAAd29yZC9kb2N1bWVudC54bWyNk9tu2zAMhu8H7B0E3xfHTto1s1uUrhcYYOti2N2Ahk3bQGRLTly0efrZSYftYQe22yQ/inwfv7d08a5v9Y45V5kK2A5T24EWWa6KSuBu87Q/sW2XSc1VpUqlwQ68595+v/i2bM6gL2WzNaoZcI6u+u1+lW1HbdsuoE44N9pYwFfXjG217j4m642u6o4o07T99g71K3a9fNtt0w15oQ4v4H7kI0/iN8H9j+8H/2b8xQ/rA54/Ld9/Wb79kZ/36H8D',
    uploadedByUserId: 'system',
    uploadedByName: 'Dex Jurídico',
    createdAt: '2026-01-15'
  },
  {
    id: 'tpl_3',
    title: 'Petição Inicial — Ação de Cobrança / Monitória',
    category: 'PETICAO_INICIAL',
    description: 'Minuta completa com pedidos de citação, gratuidade de justiça e cálculo demonstrativo de débito.',
    fileName: 'Peticao_Inicial_Cobranca.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 95200,
    fileData: 'data:application/msword;base64,UEsDBBQABgAIAAAAIQD/0sK8eQEAADoGAAATAAAAd29yZC9kb2N1bWVudC54bWyNk9tu2zAMhu8H7B0E3xfHTto1s1uUrhcYYOti2N2Ahk3bQGRLTly0efrZSYftYQe22yQ/inwfv7d08a5v9Y45V5kK2A5T24EWWa6KSuBu87Q/sW2XSc1VpUqlwQ68595+v/i2bM6gL2WzNaoZcI6u+u1+lW1HbdsuoE44N9pYwFfXjG217j4m642u6o4o07T99g71K3a9fNtt0w15oQ4v4H7kI0/iN8H9j+8H/2b8xQ/rA54/Ld9/Wb79kZ/36H8D',
    uploadedByUserId: 'system',
    uploadedByName: 'Dex Jurídico',
    createdAt: '2026-02-01'
  },
  {
    id: 'tpl_4',
    title: 'Contestação Trabalhista Padrão com Preliminares',
    category: 'CONTESTACAO',
    description: 'Peça defensiva com preliminares de inépcia, prescrição bienal/quinquenal e impugnação aos pedidos rescisórios.',
    fileName: 'Contestacao_Trabalhista_Modelo.pdf',
    fileType: 'application/pdf',
    fileSize: 114000,
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQvRjEgMTIgVGYKNzIgNzIwIFRECihtb2RlbG8gZGUgY29udGVzdGFjYW8pIFRqCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA1L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMzE0CiUlRU9GCg==',
    uploadedByUserId: 'system',
    uploadedByName: 'Dex Jurídico',
    createdAt: '2026-02-12'
  },
  {
    id: 'tpl_5',
    title: 'Notificação Extrajudicial com Aviso de Recebimento (AR)',
    category: 'NOTIFICACAO',
    description: 'Notificação de cobrança prévia e constituição em mora com prazo de 48 horas para adimplemento.',
    fileName: 'Notificacao_Extrajudicial.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 34100,
    fileData: 'data:application/msword;base64,UEsDBBQABgAIAAAAIQD/0sK8eQEAADoGAAATAAAAd29yZC9kb2N1bWVudC54bWyNk9tu2zAMhu8H7B0E3xfHTto1s1uUrhcYYOti2N2Ahk3bQGRLTly0efrZSYftYQe22yQ/inwfv7d08a5v9Y45V5kK2A5T24EWWa6KSuBu87Q/sW2XSc1VpUqlwQ68595+v/i2bM6gL2WzNaoZcI6u+u1+lW1HbdsuoE44N9pYwFfXjG217j4m642u6o4o07T99g71K3a9fNtt0w15oQ4v4H7kI0/iN8H9j+8H/2b8xQ/rA54/Ld9/Wb79kZ/36H8D',
    uploadedByUserId: 'system',
    uploadedByName: 'Dex Jurídico',
    createdAt: '2026-02-20'
  }
];

export const INITIAL_TEAM_POSTS: WallPost[] = [
  {
    id: 'post_1',
    authorId: 'usr_admin_otton',
    authorName: 'Dr. Otton Luis',
    authorRole: 'Sócio Fundador',
    authorInitial: 'O',
    createdAt: 'Hoje às 09:15',
    title: '🎉 Grande Vitória no TRF-3 — Tese de Exclusão do ICMS da Base do PIS/COFINS!',
    content: 'Parabéns à Dra. Camila Rocha e a toda a equipe tributária! Obtivemos decisão unânime favorável na 6ª Turma do TRF-3 em favor da BioNutri Alimentos. Compensação estimada em mais de R$ 1,8 milhão. Excelente trabalho de todos os envolvidos!',
    category: 'VITORIA',
    isPinned: true,
    likes: 12,
    likedBy: ['usr_admin_1', 'usr_admin_otton', 'usr_law_camila'],
    commentsCount: 4,
    officeId: PRIMARY_OFFICE_ID,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post_2',
    authorId: 'usr_law_lucas',
    authorName: 'Dr. Lucas Mendes',
    authorRole: 'Advogado Associado',
    authorInitial: 'L',
    createdAt: 'Ontem às 16:40',
    title: '📢 Pauta de Audiências Trabalhistas da Semana Atualizada',
    content: 'Lembramos a todos os colegas que as pautas de audiências de instrução e telepresenciais da 45ª e 12ª Varas do Trabalho já estão sincronizadas na Agenda. Favor revisar as testemunhas com 48h de antecedência.',
    category: 'COMUNICADO',
    isPinned: true,
    likes: 8,
    likedBy: ['usr_admin_1', 'usr_law_lucas'],
    commentsCount: 2,
    officeId: PRIMARY_OFFICE_ID,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 'post_3',
    authorId: 'usr_law_juliana',
    authorName: 'Dra. Juliana Matsuoka',
    authorRole: 'Especialista em Legal Tech & LGPD',
    authorInitial: 'J',
    createdAt: '26 de Agosto às 11:20',
    title: '💡 Treinamento sobre a Nova Dex AI no Escritório',
    content: 'A triagem automatizada com inteligência artificial aumentou nossa velocidade de elaboração de peças em 40%. Para quem quiser dicas de prompts jurídicos avançados e enquadramento normativo, estarei disponível nesta quinta às 15h.',
    category: 'GERAL',
    isPinned: false,
    likes: 6,
    likedBy: ['usr_admin_otton'],
    commentsCount: 1,
    officeId: PRIMARY_OFFICE_ID,
    deleted_at: null,
    deleted_by: null
  }
];
