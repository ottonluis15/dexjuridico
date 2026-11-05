import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Eye, 
  CheckCircle2, 
  Search, 
  KeyRound,
  Server
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DecorativeBars } from '../common/DecorativeBars';

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
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <DecorativeBars className="mb-2" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-serif font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dex-kpi-mint text-dex-navy-950 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-dex-navy-950" />
              Governança, Segurança &amp; LGPD (Lei nº 13.709/2018)
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Privacidade e Inventário de Dados
          </h2>
          <p className="text-xs text-[#8F8A87] font-serif mt-1 max-w-2xl leading-relaxed">
            Painel de controle e auditoria para cumprimento rigoroso das diretrizes de minimização de dados, segurança da informação e sigilo profissional da advocacia.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-dex-navy-800 border border-white/5 text-xs space-y-1.5 self-start md:self-auto shrink-0 font-serif">
          <p className="text-[#8F8A87]">Status de Conformidade:</p>
          <div className="flex items-center gap-2 text-dex-chart-green font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sistema 100% em Conformidade</span>
          </div>
          <span className="text-[10px] text-[#8F8A87] block font-mono">DPO / Encarregado: Dra. Helena Moreira</span>
        </div>
      </div>

      {/* Security Principles Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-dex-coral uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            1. Autenticação &amp; Criptografia
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            Senhas protegidas com hashing moderno, tokens de sessão efêmeros e suporte a autenticação multifator (MFA).
          </p>
        </div>

        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-dex-peach uppercase tracking-wider">
            <Server className="w-4 h-4" />
            2. Validação no Servidor &amp; SQL
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            Todas as regras de autorização (RBAC) e consultas a banco de dados são parametrizadas no servidor para proteção contra SQL Injection.
          </p>
        </div>

        <div className="p-6 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-dex-beige uppercase tracking-wider">
            <Database className="w-4 h-4" />
            3. Minimização de Dados
          </div>
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            Coleta estritamente limitada ao indispensável para a instrução judicial e fiscal, com descarte e expurgo programado após o encerramento do processo.
          </p>
        </div>
      </div>

      {/* Data Inventory Table */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-dex-coral" />
              Inventário de Dados Pessoais Tratados (Registro de Operações)
            </h3>
            <p className="text-xs text-[#8F8A87] font-serif mt-0.5">Mapeamento de quais dados o Dex armazena, bases legais e níveis de acesso</p>
          </div>
        </div>

        <div className="space-y-3">
          {dataInventory.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-dex-navy-800 border border-white/5 space-y-2 font-serif">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-dex-coral" />
                  {item.category}
                </h4>
                <span className="text-[10px] text-dex-peach bg-dex-navy-950 px-2 py-0.5 rounded border border-white/5">
                  {item.accessRole}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                <strong className="text-white">Campos Coletados:</strong> {item.fields}
              </p>
              <p className="text-xs text-slate-300">
                <strong className="text-white">Finalidade Específica:</strong> {item.purpose}
              </p>
              <p className="text-xs text-dex-peach">
                <strong>Base Legal LGPD:</strong> {item.legalBasis}
              </p>
              <p className="text-[11px] text-[#8F8A87]">
                <strong>Tempo de Retenção:</strong> {item.retention}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 md:p-8 rounded-[24px] bg-dex-navy-900 border border-white/5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-dex-coral" />
              Trilha de Auditoria &amp; Logs de Acesso (Auditoria LGPD)
            </h3>
            <p className="text-xs text-[#8F8A87] font-serif mt-0.5">Registro cronológico de acessos, downloads e modificações no sistema</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#8F8A87] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-dex-input text-dex-navy-950 font-serif rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-dex-coral"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 overflow-hidden bg-dex-navy-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-serif">
              <thead className="bg-dex-navy-800 text-[#8F8A87] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Entidade / Objeto</th>
                  <th className="py-3 px-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-dex-navy-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8F8A87] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dex-navy-900 text-dex-peach border border-white/5">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{log.entity}</div>
                      <div className="text-[10px] text-[#8F8A87]">{log.details}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8F8A87]">
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
