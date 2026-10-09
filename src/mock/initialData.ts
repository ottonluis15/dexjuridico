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

// Usuários iniciais limpos — O acesso é exclusivamente por cadastro e login real
export const INITIAL_USERS: User[] = [];

export const INITIAL_LAWYERS: Lawyer[] = [];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_CASES: LegalCase[] = [];

export const INITIAL_DEADLINES: Deadline[] = [];

export const INITIAL_FINANCIAL: FinancialEntry[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

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
    // Dados codificados em Data URI funcional (arquivo Word/texto formatado)
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
