import { 
  User, 
  Client, 
  Lawyer, 
  LegalCase, 
  Deadline, 
  FinancialEntry, 
  DocumentItem, 
  AuditLog,
  TemplateDocument 
} from '../types';

// Salt e Hash criptográfico gerado para a senha padrão "Admin123!"
const DEFAULT_SALT = 'a1b2c3d4e5f60718';
const DEFAULT_HASH = '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'admin@dexjuridico.adv.br',
    role: 'ADMIN',
    oab: '184.920/SP',
    phone: '(11) 98765-4321',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    officeId: 'off_dex_principal',
    officeName: 'Moreira & Associados Advocacia',
    officeCode: 'DEX-1001',
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'usr_admin_otton',
    name: 'Dr. Otton Luis',
    email: 'otton.luis.alcaraz@gmail.com',
    role: 'ADMIN',
    oab: '245.890/SP',
    phone: '(11) 99999-8888',
    specialties: ['Direito Digital', 'Contratos', 'Direito Civil'],
    status: 'ACTIVE',
    officeId: 'off_dex_principal',
    officeName: 'Moreira & Associados Advocacia',
    officeCode: 'DEX-1001',
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'usr_lawyer_1',
    name: 'Dr. Lucas Mendes',
    email: 'lucas.mendes@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '312.450/SP',
    phone: '(11) 97654-3210',
    specialties: ['Direito do Trabalho', 'Direito Civil', 'Consumidor'],
    status: 'ACTIVE',
    officeId: 'off_dex_principal',
    officeName: 'Moreira & Associados Advocacia',
    officeCode: 'DEX-1001',
    isIndependent: false,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'usr_lawyer_autonomo',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '278.114/SP',
    phone: '(11) 96543-2109',
    specialties: ['Direito de Família e Sucessões', 'Cível'],
    status: 'ACTIVE',
    isIndependent: true,
    salt: DEFAULT_SALT,
    passwordHash: DEFAULT_HASH,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
  }
];

export const INITIAL_LAWYERS: Lawyer[] = [
  {
    id: 'law_1',
    userId: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'admin@dexjuridico.adv.br',
    phone: '(11) 98765-4321',
    oab: '184.920/SP',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    roleTitle: 'Sócia Fundadora & Administradora',
    assignedCasesCount: 2,
    officeId: 'off_dex_principal',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'law_otton',
    userId: 'usr_admin_otton',
    name: 'Dr. Otton Luis',
    email: 'otton.luis.alcaraz@gmail.com',
    phone: '(11) 99999-8888',
    oab: '245.890/SP',
    specialties: ['Direito Digital', 'Contratos', 'Direito Civil'],
    status: 'ACTIVE',
    roleTitle: 'Sócio & Diretor Jurídico',
    assignedCasesCount: 1,
    officeId: 'off_dex_principal',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'law_2',
    userId: 'usr_lawyer_1',
    name: 'Dr. Lucas Mendes',
    email: 'lucas.mendes@dexjuridico.adv.br',
    phone: '(11) 97654-3210',
    oab: '312.450/SP',
    specialties: ['Direito do Trabalho', 'Direito Civil', 'Consumidor'],
    status: 'ACTIVE',
    roleTitle: 'Advogado Associado Sênior',
    assignedCasesCount: 2,
    officeId: 'off_dex_principal',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'law_3',
    userId: 'usr_lawyer_autonomo',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    phone: '(11) 96543-2109',
    oab: '278.114/SP',
    specialties: ['Direito de Família e Sucessões', 'Cível'],
    status: 'ACTIVE',
    roleTitle: 'Advogada Autônoma',
    assignedCasesCount: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
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
    notes: 'Cliente corporativo com assessoria mensal (retainer).',
    createdAt: '2026-01-15',
    status: 'ACTIVE',
    linkedLawyerId: 'law_1',
    officeId: 'off_dex_principal'
  },
  {
    id: 'cli_2',
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
    notes: 'Ação de divórcio litigioso e partilha de bens.',
    createdAt: '2026-02-10',
    status: 'ACTIVE',
    linkedLawyerId: 'law_1',
    officeId: 'off_dex_principal'
  }
];

export const INITIAL_CASES: LegalCase[] = [
  {
    id: 'case_1',
    caseNumber: '1023849-12.2025.8.26.0100',
    court: '2ª Vara Cível do Foro Central Cível da Capital - SP',
    clientId: 'cli_1',
    lawyerId: 'law_1',
    legalArea: 'Empresarial',
    actionType: 'Ação de Rescisão Contratual c/c Perdas e Danos',
    status: 'INSTRUCAO',
    value: 340000.00,
    distributionDate: '2025-11-20',
    description: 'Descumprimento contratual em desenvolvimento de software com pedido de indenização.',
    updatedAt: '2026-03-01',
    officeId: 'off_dex_principal'
  },
  {
    id: 'case_2',
    caseNumber: '1004521-88.2026.5.02.0045',
    court: '45ª Vara do Trabalho de São Paulo - TRT-2',
    clientId: 'cli_1',
    lawyerId: 'law_2',
    legalArea: 'Trabalhista',
    actionType: 'Reclamatória Trabalhista',
    status: 'INICIAL',
    value: 85000.00,
    distributionDate: '2026-02-18',
    description: 'Defesa da reclamada em pedido de equiparação salarial e acúmulo de função.',
    updatedAt: '2026-03-05',
    officeId: 'off_dex_principal'
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'ded_1',
    caseId: 'case_1',
    lawyerId: 'law_1',
    type: 'Manifestação',
    description: 'Apresentar manifestação sobre o laudo pericial contábil homologado.',
    dueDate: '2026-10-18',
    dueTime: '17:00',
    priority: 'HIGH',
    status: 'PENDING',
    officeId: 'off_dex_principal'
  },
  {
    id: 'ded_2',
    caseId: 'case_2',
    lawyerId: 'law_2',
    type: 'Contestação',
    description: 'Protocolar contestação trabalhista com documentos comprobatórios.',
    dueDate: '2026-10-22',
    dueTime: '18:00',
    priority: 'CRITICAL',
    status: 'PENDING',
    officeId: 'off_dex_principal'
  }
];

export const INITIAL_FINANCIAL: FinancialEntry[] = [
  {
    id: 'fin_1',
    type: 'MENSALIDADE',
    title: 'Honorários Mensais - TechVanguard',
    clientId: 'cli_1',
    caseId: 'case_1',
    lawyerId: 'law_1',
    amount: 8500.00,
    dueDate: '2026-10-15',
    status: 'PENDENTE',
    paymentMethod: 'PIX',
    officeId: 'off_dex_principal'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    name: 'Contrato_Prestacao_Servicos_TechVanguard.pdf',
    category: 'CONTRATO_HONORARIOS',
    clientId: 'cli_1',
    uploadedByLawyerId: 'law_1',
    fileSize: 420000,
    fileType: 'application/pdf',
    createdAt: '2026-01-15',
    isConfidential: true,
    officeId: 'off_dex_principal'
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
