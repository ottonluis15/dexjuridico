import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  FileCheck, 
  Users, 
  Eye, 
  AlertTriangle, 
  Server, 
  CheckCircle2,
  Search,
  KeyRound
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const LGPDCompliance: React.FC = () => {
  const { auditLogs } = useData();
  const [searchLog, setSearchLog] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    log.userName.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  const dataInventory = [
    {
      category: 'Dados Cadastrais de Clientes',
      fields: 'Nome, CPF/CNPJ, E-mail, Telefone, Endereço',
      purpose: 'Identificação civil para peticionamento, representação processual e emissão de notas fiscais.',
      legalBasis: 'Execução de Contrato (Art. 7º, V, LGPD) e Exercício Regular de Direitos em Processo Judicial (Art. 7º, VI).',
      accessRole: 'Sócios e Advogados responsáveis pela condução do caso.',
      retention: 'Prazo prescricional da ação + 5 anos regulatórios da OAB (Provimento 205/2021).'
    },
    {
      category: 'Dados Sensíveis & Documentos Probatórios',
      fields: 'Prontuários de saúde (Trabalhista/Previdenciário), Extratos bancários, Certidões de casamento/filhos',
      purpose: 'Instrução probatória privativa perante os Tribunais de Justiça e órgãos públicos.',
      legalBasis: 'Exercício Regular de Direitos em Processo Judicial (Art. 11, II, "d", LGPD).',
      accessRole: 'Apenas advogados com procuração outorgada nos autos específicos.',
      retention: 'Até o trânsito em julgado e liquidação definitiva do processo.'
    },
    {
      category: 'Dados Financeiros & Honorários',
      fields: 'Valores contratuais, dados de PIX/transferência, comprovantes de custas judiciais',
      purpose: 'Controle contábil, prestação de contas aos clientes e cumprimento de obrigações tributárias.',
      legalBasis: 'Cumprimento de Obrigação Legal e Fiscal (Art. 7º, II, LGPD).',
      accessRole: 'Administrador / Sócios do escritório.',
      retention: '5 anos (Legislação Tributária Federal).'
    },
    {
      category: 'Tratamento de Dados no Motor Dex AI',
      fields: 'Relatos fáticos desidentificados e transcrições de entrevistas',
      purpose: 'Triagem preliminar, estruturação lógica de teses e conferência de requisitos iniciais.',
      legalBasis: 'Apoio à atividade advocatícia privativa sem cessão comercial de dados a terceiros.',
      accessRole: 'Advogado operador da sessão (processamento efêmero).',
      retention: 'Zero retenção em bases públicas de treinamento externo de modelos LLM.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Governança, Segurança & LGPD (Lei nº 13.709/2018)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Privacidade e Inventário de Dados
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Painel de controle e auditoria para cumprimento rigoroso das diretrizes de minimização de dados, segurança da informação e sigilo profissional da advocacia.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 self-start md:self-auto shrink-0">
          <p className="text-slate-400 font-medium">Status de Conformidade:</p>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sistema 100% em Conformidade</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">DPO / Encarregado: Dra. Helena Moreira</span>
        </div>
      </div>

      {/* Security Principles Checklist (Item 4 do Prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            1. Autenticação & Criptografia
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Senhas protegidas com hashing moderno (bcrypt/argon2), tokens de sessão efêmeros e suporte a autenticação multifator (MFA).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Server className="w-4 h-4 text-cyan-400" />
            2. Validação no Servidor & SQL
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Todas as regras de autorização (RBAC) e consultas a banco de dados são parametrizadas no servidor para proteção contra SQL Injection e privilege escalation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Database className="w-4 h-4 text-amber-400" />
            3. Minimização de Dados
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coleta estritamente limitada ao indispensável para a instrução judicial e fiscal, com descarte e expurgo programado após o encerramento do processo.
          </p>
        </div>
      </div>

      {/* Data Inventory Table (Inventário de Dados Tratados) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-400" />
              Inventário de Dados Pessoais Tratados (Registro de Operações)
            </h3>
            <p className="text-xs text-slate-400">Mapeamento de quais dados o Dex armazena, bases legais e níveis de acesso</p>
          </div>
        </div>

        <div className="space-y-3">
          {dataInventory.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {item.category}
                </h4>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {item.accessRole}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                <strong>Campos Coletados:</strong> {item.fields}
              </p>
              <p className="text-xs text-slate-300">
                <strong>Finalidade Específica:</strong> {item.purpose}
              </p>
              <p className="text-xs text-brand-300">
                <strong>Base Legal LGPD:</strong> {item.legalBasis}
              </p>
              <p className="text-[11px] text-slate-400">
                <strong>Tempo de Retenção:</strong> {item.retention}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table (Trilha de Auditoria) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Trilha de Auditoria & Logs de Acesso (Auditoria LGPD)
            </h3>
            <p className="text-xs text-slate-400">Registro cronológico de acessos, downloads e modificações no sistema</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Entidade / Objeto</th>
                  <th className="py-3 px-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{log.entity}</div>
                      <div className="text-[10px] text-slate-400">{log.details}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
