import { storageService } from './storageService';
import { PRIMARY_OFFICE_ID } from '../mock/initialData';

export interface SuspectRecord {
  table: string;
  id: string;
  officeId?: string;
  userId?: string;
  titleOrName: string;
  reason: string;
}

export interface SeedCleanupReport {
  dryRun: boolean;
  timestamp: string;
  totalInspected: {
    users: number;
    cases: number;
    clients: number;
    deadlines: number;
    financial: number;
  };
  suspectRecords: SuspectRecord[];
  summary: string;
}

const KNOWN_BENCHMARK_OFFICES = new Set([
  PRIMARY_OFFICE_ID, // 'off_dex_principal' (Moreira & Alcaraz)
  'off_demo_sandbox'  // Conta comercial de demonstração
]);

export const seedCleanupService = {
  /**
   * Executa a simulação (dry run) ou limpeza segura de registros seed vinculados a contas reais.
   * Por padrão, executeDeletion = false (DRY RUN OBRIGATÓRIO).
   */
  simulate(executeDeletion = false): SeedCleanupReport {
    const suspectRecords: SuspectRecord[] = [];

    const users = storageService.getUsers();
    const cases = storageService.getCases();
    const clients = storageService.getClients();
    const deadlines = storageService.getDeadlines();
    const financial = storageService.getFinancial();

    // 1. Inspecionar Processos
    for (const c of cases) {
      const isBenchmarkOffice = c.officeId && KNOWN_BENCHMARK_OFFICES.has(c.officeId);
      const isSeedId = /^case_([1-9]|1[0-5])$/.test(c.id);
      
      // Se um processo tem ID de seed mas está associado a uma conta real
      if (!isBenchmarkOffice && isSeedId) {
        suspectRecords.push({
          table: 'dex_cases',
          id: c.id,
          officeId: c.officeId,
          titleOrName: c.caseNumber || c.actionType || 'Processo sem título',
          reason: 'ID de semente (case_1..15) associado a escritório/usuário não-benchmark'
        });
      }
    }

    // 2. Inspecionar Clientes
    for (const cli of clients) {
      const isBenchmarkOffice = cli.officeId && KNOWN_BENCHMARK_OFFICES.has(cli.officeId);
      const isSeedId = /^cli_([1-9]|10)$/.test(cli.id);
      
      if (!isBenchmarkOffice && isSeedId) {
        suspectRecords.push({
          table: 'dex_clients',
          id: cli.id,
          officeId: cli.officeId,
          titleOrName: cli.name,
          reason: 'ID de semente (cli_1..10) associado a escritório/usuário não-benchmark'
        });
      }
    }

    // 3. Inspecionar Prazos
    for (const d of deadlines) {
      const isBenchmarkOffice = d.officeId && KNOWN_BENCHMARK_OFFICES.has(d.officeId);
      const isSeedId = /^dl_([1-9]|1[0-5])$/.test(d.id);
      
      if (!isBenchmarkOffice && isSeedId) {
        suspectRecords.push({
          table: 'dex_deadlines',
          id: d.id,
          officeId: d.officeId,
          titleOrName: d.description,
          reason: 'ID de semente (dl_1..15) associado a escritório/usuário não-benchmark'
        });
      }
    }

    // 4. Inspecionar Financeiro
    for (const f of financial) {
      const isBenchmarkOffice = f.officeId && KNOWN_BENCHMARK_OFFICES.has(f.officeId);
      const isSeedId = /^fin_([1-9]|1[0-5])$/.test(f.id);
      
      if (!isBenchmarkOffice && isSeedId) {
        suspectRecords.push({
          table: 'dex_financial',
          id: f.id,
          officeId: f.officeId,
          titleOrName: f.title,
          reason: 'ID de semente (fin_1..15) associado a escritório/usuário não-benchmark'
        });
      }
    }

    const report: SeedCleanupReport = {
      dryRun: !executeDeletion,
      timestamp: new Date().toISOString(),
      totalInspected: {
        users: users.length,
        cases: cases.length,
        clients: clients.length,
        deadlines: deadlines.length,
        financial: financial.length
      },
      suspectRecords,
      summary: suspectRecords.length === 0
        ? 'Nenhum registro de demonstração/seed foi encontrado associado a contas reais de usuários. Todas as contas de clientes reais estão isoladas e sem contaminação de semente.'
        : `Identificados ${suspectRecords.length} registros suspeitos em modo de simulação (DRY RUN). Nenhuma exclusão foi executada aguardando confirmação explícita.`
    };

    if (executeDeletion && suspectRecords.length > 0) {
      // Exclusão segura apenas após confirmação
      const suspectCaseIds = new Set(suspectRecords.filter(r => r.table === 'dex_cases').map(r => r.id));
      const suspectClientIds = new Set(suspectRecords.filter(r => r.table === 'dex_clients').map(r => r.id));
      const suspectDeadlineIds = new Set(suspectRecords.filter(r => r.table === 'dex_deadlines').map(r => r.id));
      const suspectFinIds = new Set(suspectRecords.filter(r => r.table === 'dex_financial').map(r => r.id));

      if (suspectCaseIds.size > 0) {
        storageService.saveCases(cases.filter(c => !suspectCaseIds.has(c.id)));
      }
      if (suspectClientIds.size > 0) {
        storageService.saveClients(clients.filter(c => !suspectClientIds.has(c.id)));
      }
      if (suspectDeadlineIds.size > 0) {
        storageService.saveDeadlines(deadlines.filter(d => !suspectDeadlineIds.has(d.id)));
      }
      if (suspectFinIds.size > 0) {
        storageService.saveFinancial(financial.filter(f => !suspectFinIds.has(f.id)));
      }
    }

    return report;
  }
};
