import { User, Client, Lawyer, LegalCase, Deadline, FinancialEntry, DocumentItem, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'helena.moreira@dexjuridico.adv.br',
    role: 'ADMIN',
    oab: '184.920/SP',
    phone: '(11) 98765-4321',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
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
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
  },
  {
    id: 'usr_lawyer_2',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    role: 'LAWYER',
    oab: '278.114/SP',
    phone: '(11) 96543-2109',
    specialties: ['Direito de Família e Sucessões', 'Cível'],
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop',
  }
];

export const INITIAL_LAWYERS: Lawyer[] = [
  {
    id: 'law_1',
    userId: 'usr_admin_1',
    name: 'Dra. Helena Moreira',
    email: 'helena.moreira@dexjuridico.adv.br',
    phone: '(11) 98765-4321',
    oab: '184.920/SP',
    specialties: ['Direito Empresarial', 'Tributário', 'Contratos'],
    status: 'ACTIVE',
    roleTitle: 'Sócia Fundadora & Administradora',
    assignedCasesCount: 4
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
    assignedCasesCount: 4
  },
  {
    id: 'law_3',
    userId: 'usr_lawyer_2',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@dexjuridico.adv.br',
    phone: '(11) 96543-2109',
    oab: '278.114/SP',
    specialties: ['Direito de Família e Sucessões', 'Cível'],
    status: 'ACTIVE',
    roleTitle: 'Advogada Associada Plena',
    assignedCasesCount: 2
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
    notes: 'Cliente corporativo com contrato de assessoria mensal (retainer). Demandas societárias e trabalhistas.',
    createdAt: '2024-01-15',
    status: 'ACTIVE',
    linkedLawyerId: 'law_1'
  },
  {
    id: 'cli_2',
    name: 'Carlos Eduardo Silveira',
    type: 'PF',
    document: '289.410.828-44',
    email: 'carlos.silveira@email.com',
    phone: '(11) 99123-4567',
    address: {
      street: 'Rua Pedroso Alvarenga',
      number: '740',
      complement: 'Apto 82',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04531-002'
    },
    notes: 'Ex-gerente de TI em processo de rescisão indireta e horas extras contra multinacional.',
    createdAt: '2024-03-10',
    status: 'ACTIVE',
    linkedLawyerId: 'law_2'
  },
  {
    id: 'cli_3',
    name: 'Mariana Vasconcelos Ribeiro',
    type: 'PF',
    document: '194.832.748-02',
    email: 'mariana.ribeiro@advocacia.net',
    phone: '(11) 98234-5678',
    address: {
      street: 'Alameda Santos',
      number: '1200',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01418-100'
    },
    notes: 'Ação de Divórcio consensual com partilha de patrimônio e alimentos compensatórios.',
    createdAt: '2024-02-20',
    status: 'ACTIVE',
    linkedLawyerId: 'law_3'
  },
  {
    id: 'cli_4',
    name: 'Construtora & Engenharia Horizonte S.A.',
    type: 'PJ',
    document: '12.450.932/0001-11',
    email: 'contencioso@horizonte.eng.br',
    phone: '(11) 3890-4100',
    address: {
      street: 'Rua Funchal',
      number: '418',
      complement: '9º Andar',
      neighborhood: 'Vila Olímpia',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04551-060'
    },
    notes: 'Contencioso cível imobiliário e discussões de contratos de empreitada.',
    createdAt: '2023-11-05',
    status: 'ACTIVE',
    linkedLawyerId: 'law_1'
  },
  {
    id: 'cli_5',
    name: 'Roberto Junqueira Neves',
    type: 'PF',
    document: '054.912.388-71',
    email: 'roberto.junqueira@empresa.com.br',
    phone: '(11) 97345-6789',
    address: {
      street: 'Rua Pamplona',
      number: '550',
      complement: 'Conj 32',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01405-000'
    },
    notes: 'Vítima de fraude bancária via PIX (Golpe do Falso Funcionário). Pedido de restituição e danos morais.',
    createdAt: '2024-04-02',
    status: 'ACTIVE',
    linkedLawyerId: 'law_2'
  },
  {
    id: 'cli_6',
    name: 'Ana Cláudia Fonseca',
    type: 'PF',
    document: '312.654.987-19',
    email: 'ana.fonseca@designstudio.com',
    phone: '(11) 96456-7890',
    address: {
      street: 'Rua Mourato Coelho',
      number: '920',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05417-001'
    },
    notes: 'Disputa de propriedade intelectual e rescisão de contrato de prestação de serviços com agência de publicidade.',
    createdAt: '2024-04-18',
    status: 'PROSPECT',
    linkedLawyerId: 'law_2'
  }
];

export const INITIAL_CASES: LegalCase[] = [
  {
    id: 'case_1',
    caseNumber: '1004523-88.2024.8.26.0100',
    court: '32ª Vara Cível do Foro Central da Comarca de São Paulo/SP',
    clientId: 'cli_4',
    lawyerId: 'law_1',
    legalArea: 'Cível',
    actionType: 'Ação de Cobrança c/c Indenização por Perdas e Danos',
    status: 'INSTRUCAO',
    value: 450000.00,
    distributionDate: '2024-01-22',
    description: 'Cobrança decorrente do inadimplemento de medições em contrato de fornecimento de estruturas metálicas.',
    notes: 'Aguardando manifestação sobre os quesitos periciais e designação de perito de engenharia.',
    updatedAt: '2024-08-20'
  },
  {
    id: 'case_2',
    caseNumber: '0010944-12.2024.5.02.0041',
    court: '41ª Vara do Trabalho de São Paulo - TRT da 2ª Região',
    clientId: 'cli_2',
    lawyerId: 'law_2',
    legalArea: 'Trabalhista',
    actionType: 'Reclamatória Trabalhista (Rescisão Indireta e Horas Extras)',
    status: 'INICIAL',
    value: 185400.00,
    distributionDate: '2024-03-15',
    description: 'Pedido de rescisão indireta em razão de assédio moral e sobrecarga, adicional noturno, reflexos em FGTS e verbas rescisórias.',
    notes: 'Audiência UNA/Conciliação designada para breve. Provas testemunhais e prints de conversas arquivados.',
    updatedAt: '2024-08-22'
  },
  {
    id: 'case_3',
    caseNumber: '5003290-71.2024.4.03.6100',
    court: '6ª Vara Cível Federal de São Paulo - TRF da 3ª Região',
    clientId: 'cli_1',
    lawyerId: 'law_1',
    legalArea: 'Tributário',
    actionType: 'Mandado de Segurança Coletivo / Individual',
    status: 'RECURSAL',
    value: 820000.00,
    distributionDate: '2024-02-05',
    description: 'Exclusão do ICMS-ST da base de cálculo do PIS e da COFINS com compensação de indébito tributário dos últimos 5 anos.',
    notes: 'Recurso de Apelação protocolado. Aguardando julgamento no Tribunal Regional Federal.',
    updatedAt: '2024-08-15'
  },
  {
    id: 'case_4',
    caseNumber: '1029482-19.2024.8.26.0002',
    court: '2ª Vara da Família e Sucessões de Santo Amaro/SP',
    clientId: 'cli_3',
    lawyerId: 'law_3',
    legalArea: 'Família e Sucessões',
    actionType: 'Ação de Divórcio Consensual c/c Partilha e Guarda Compartilhada',
    status: 'SENTENCA',
    value: 1200000.00,
    distributionDate: '2024-03-01',
    description: 'Homologação de acordo de divórcio, partilha amigável de imóveis em São Paulo e regime de convivência.',
    notes: 'Sentença homologatória proferida. Aguardando expedição de mandado de averbação ao Cartório de Registro Civil.',
    updatedAt: '2024-08-10'
  },
  {
    id: 'case_5',
    caseNumber: '1083921-45.2024.8.26.0100',
    court: '14ª Vara Cível do Foro Central de São Paulo/SP',
    clientId: 'cli_5',
    lawyerId: 'law_2',
    legalArea: 'Consumidor',
    actionType: 'Ação Declaratória de Inexistência de Débito c/c Reparação de Danos',
    status: 'INSTRUCAO',
    value: 68500.00,
    distributionDate: '2024-04-10',
    description: 'Golpe via transações PIX não reconhecidas e abertura de conta fraudulenta em nome do autor. Responsabilidade objetiva do banco (Súmula 479 STJ).',
    notes: 'Liminar deferida para cessar cobranças e retirar negativação no Serasa/SPC. Contestação do banco apresentada.',
    updatedAt: '2024-08-25'
  },
  {
    id: 'case_6',
    caseNumber: '0008312-55.2024.5.02.0019',
    court: '19ª Vara do Trabalho de São Paulo - TRT-2',
    clientId: 'cli_1',
    lawyerId: 'law_2',
    legalArea: 'Trabalhista',
    actionType: 'Execução de Sentença e Liquidação de Cálculos',
    status: 'EXECUCAO',
    value: 94200.00,
    distributionDate: '2023-09-12',
    description: 'Defesa patronal em liquidação de cálculos periciais trabalhistas com impugnação a índices de correção monetária.',
    notes: 'Impugnação aos cálculos oposta. Perito nomeado pelo juízo intimado a prestar esclarecimentos.',
    updatedAt: '2024-08-18'
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'ded_1',
    caseId: 'case_2',
    lawyerId: 'law_2',
    type: 'Audiência de Conciliação',
    description: 'Audiência Inicial / UNA Trabalhista via Telepresencial Zoom (Link no despacho fls. 88)',
    dueDate: '2026-08-28', // Amanhã
    dueTime: '13:30',
    priority: 'CRITICAL',
    status: 'PENDING',
    notes: 'Testemunhas já alinhadas. Sala virtual confirmada.'
  },
  {
    id: 'ded_2',
    caseId: 'case_5',
    lawyerId: 'law_2',
    type: 'Réplica',
    description: 'Apresentar Réplica à Contestação bancária e ratificar pedido de inversão do ônus da prova',
    dueDate: '2026-08-29', // Em 2 dias
    dueTime: '23:59',
    priority: 'HIGH',
    status: 'PENDING',
    notes: 'Banco alegou culpa exclusiva da vítima; contra-argumentar com Súmula 479 STJ e registros do Bacen.'
  },
  {
    id: 'ded_3',
    caseId: 'case_1',
    lawyerId: 'law_1',
    type: 'Quesitos Periciais',
    description: 'Protocolar quesitos suplementares para o perito judicial engenheiro',
    dueDate: '2026-08-27', // HOJE
    dueTime: '18:00',
    priority: 'CRITICAL',
    status: 'PENDING',
    notes: 'Quesitos já rascunhados pelo assistente técnico da construtora.'
  },
  {
    id: 'ded_4',
    caseId: 'case_3',
    lawyerId: 'law_1',
    type: 'Manifestação',
    description: 'Manifestar sobre parecer da Procuradoria da Fazenda Nacional (PFN)',
    dueDate: '2026-09-04',
    dueTime: '23:59',
    priority: 'MEDIUM',
    status: 'PENDING',
    notes: 'Prazo dilatado em dias úteis.'
  },
  {
    id: 'ded_5',
    caseId: 'case_4',
    lawyerId: 'law_3',
    type: 'Cumprimento de Sentença',
    description: 'Retirar formal de partilha e guias de averbação imobiliária',
    dueDate: '2026-08-25', // VENCIDO para teste visual de alerta
    dueTime: '17:00',
    priority: 'HIGH',
    status: 'OVERDUE',
    notes: 'Guia DARE emitida e recolhida pela cliente.'
  },
  {
    id: 'ded_6',
    caseId: 'case_6',
    lawyerId: 'law_2',
    type: 'Manifestação',
    description: 'Comprovar recolhimento de custas processuais residuais',
    dueDate: '2026-08-15',
    priority: 'NORMAL',
    status: 'COMPLETED',
    completedAt: '2026-08-14 16:20',
    notes: 'Comprovante protocolado no PJe.'
  }
];

export const INITIAL_FINANCIAL: FinancialEntry[] = [
  {
    id: 'fin_1',
    type: 'HONORARIOS_INICIAIS',
    title: 'Honorários Iniciais - Reclamatória Trabalhista',
    description: 'Primeira parcela de honorários contratuais de pró-labore.',
    clientId: 'cli_2',
    caseId: 'case_2',
    lawyerId: 'law_2',
    amount: 3500.00,
    dueDate: '2026-08-30',
    status: 'PENDENTE',
    paymentMethod: 'PIX',
    hasReceipt: false
  },
  {
    id: 'fin_2',
    type: 'MENSALIDADE',
    title: 'Retainer Mensal - Assessoria Empresarial',
    description: 'Mensalidade consultiva e contenciosa referente ao mês corrente.',
    clientId: 'cli_1',
    caseId: 'case_3',
    lawyerId: 'law_1',
    amount: 12500.00,
    dueDate: '2026-08-10',
    paymentDate: '2026-08-09',
    status: 'PAGO',
    paymentMethod: 'TRANSFERENCIA',
    hasReceipt: true,
    receiptName: 'comprovante_ted_techvanguard_ago2026.pdf'
  },
  {
    id: 'fin_3',
    type: 'HONORARIOS_INICIAIS',
    title: 'Honorários Iniciais - Ação Contra Banco',
    description: 'Honorários de abertura de processo e pedido liminar.',
    clientId: 'cli_5',
    caseId: 'case_5',
    lawyerId: 'law_2',
    amount: 2800.00,
    dueDate: '2026-08-20',
    status: 'ATRASADO',
    paymentMethod: 'BOLETO',
    hasReceipt: false
  },
  {
    id: 'fin_4',
    type: 'HONORARIOS_EXITO',
    title: 'Honorários de Êxito - Divórcio e Partilha',
    description: 'Percentual de 6% sobre o patrimônio partilhado conforme contrato.',
    clientId: 'cli_3',
    caseId: 'case_4',
    lawyerId: 'law_3',
    amount: 45000.00,
    dueDate: '2026-09-15',
    status: 'PENDENTE',
    paymentMethod: 'PIX',
    hasReceipt: false
  },
  {
    id: 'fin_5',
    type: 'CUSTAS',
    title: 'Reembolso de Custas de Distribuição Inicial',
    description: 'Taxa judiciária estadual (DARE SP) adiantada pelo escritório.',
    clientId: 'cli_4',
    caseId: 'case_1',
    lawyerId: 'law_1',
    amount: 4500.00,
    dueDate: '2026-08-05',
    paymentDate: '2026-08-04',
    status: 'PAGO',
    paymentMethod: 'PIX',
    hasReceipt: true,
    receiptName: 'dare_paga_reembolso_01.pdf'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    name: 'Procuracao_Ad_Judicia_Carlos_Silveira.pdf',
    category: 'PROCURACAO',
    clientId: 'cli_2',
    caseId: 'case_2',
    uploadedByLawyerId: 'law_2',
    fileSize: 458900,
    fileType: 'application/pdf',
    createdAt: '2024-03-12',
    isConfidential: true
  },
  {
    id: 'doc_2',
    name: 'Contrato_Honorarios_TechVanguard_2026.pdf',
    category: 'CONTRATO_HONORARIOS',
    clientId: 'cli_1',
    uploadedByLawyerId: 'law_1',
    fileSize: 1204500,
    fileType: 'application/pdf',
    createdAt: '2024-01-10',
    isConfidential: true
  },
  {
    id: 'doc_3',
    name: 'Peticao_Inicial_Distribuida_Protocolo_CNJ.pdf',
    category: 'PETICAO',
    clientId: 'cli_2',
    caseId: 'case_2',
    uploadedByLawyerId: 'law_2',
    fileSize: 2840000,
    fileType: 'application/pdf',
    createdAt: '2024-03-15',
    isConfidential: false
  },
  {
    id: 'doc_4',
    name: 'Sentenca_Homologatoria_Divorcio_Amigavel.pdf',
    category: 'SENTENCA_DECISAO',
    clientId: 'cli_3',
    caseId: 'case_4',
    uploadedByLawyerId: 'law_3',
    fileSize: 840200,
    fileType: 'application/pdf',
    createdAt: '2024-08-08',
    isConfidential: true
  },
  {
    id: 'doc_5',
    name: 'Extratos_Bancarios_Comprovantes_PIX_Golpe.pdf',
    category: 'COMPROVANTE',
    clientId: 'cli_5',
    caseId: 'case_5',
    uploadedByLawyerId: 'law_2',
    fileSize: 3450000,
    fileType: 'application/pdf',
    createdAt: '2024-04-05',
    isConfidential: true
  },
  {
    id: 'doc_6',
    name: 'Parecer_Tecnico_Estrutura_Metalica_Engenharia.docx',
    category: 'LAUDO_PERICIAL',
    clientId: 'cli_4',
    caseId: 'case_1',
    uploadedByLawyerId: 'law_1',
    fileSize: 1980000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdAt: '2024-06-20',
    isConfidential: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-08-27 10:30:14',
    userId: 'usr_admin_1',
    userName: 'Dra. Helena Moreira',
    userRole: 'ADMIN',
    action: 'VISUALIZACAO_DOCUMENTO',
    entity: 'Documento #doc_2 (Contrato_Honorarios_TechVanguard)',
    details: 'Acesso a documento contratual confidencial.',
    ipAddress: '187.54.12.90'
  },
  {
    id: 'log_2',
    timestamp: '2026-08-27 09:45:02',
    userId: 'usr_lawyer_1',
    userName: 'Dr. Lucas Mendes',
    userRole: 'LAWYER',
    action: 'ATUALIZACAO_PRAZO',
    entity: 'Prazo #ded_1 (Audiência Trabalhista)',
    details: 'Adição de notas sobre testemunhas preparadas.',
    ipAddress: '177.102.88.14'
  },
  {
    id: 'log_3',
    timestamp: '2026-08-26 18:22:50',
    userId: 'usr_lawyer_1',
    userName: 'Dr. Lucas Mendes',
    userRole: 'LAWYER',
    action: 'CONSULTA_IA_DEX',
    entity: 'Módulo Dex AI',
    details: 'Triagem e estruturação preliminar de caso sobre Fraude Bancária PIX.',
    ipAddress: '177.102.88.14'
  },
  {
    id: 'log_4',
    timestamp: '2026-08-26 14:10:19',
    userId: 'usr_admin_1',
    userName: 'Dra. Helena Moreira',
    userRole: 'ADMIN',
    action: 'CRIACAO_FINANCEIRO',
    entity: 'Financeiro #fin_2 (Retainer Mensal)',
    details: 'Baixa de recebimento no valor de R$ 12.500,00 via TED.',
    ipAddress: '187.54.12.90'
  }
];
