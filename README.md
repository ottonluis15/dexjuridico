# DEX — Sistema de Gestão Jurídica Modularizado com Assistência de IA

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**DEX** é uma plataforma web completa de gestão jurídica modularizada desenvolvida especificamente para escritórios de advocacia de pequeno e médio porte e advogados autônomos. O sistema centraliza a gestão de clientes, processos judiciais (formato CNJ), prazos fatais e audiências, controle financeiro de honorários, repositório de documentos sob sigilo e triagem inteligente de casos com **Inteligência Artificial (Dex AI)**.

> Elaborado a partir das diretrizes do TCC *"Arquitetura e Implementação de um Software de Gestão Jurídica Modularizado com Assistência baseada em Inteligência Artificial: DEX"*.

---

## 🏛️ Identidade Visual & Design System

- **Paleta Profissional**: Tons neutros profundos (*Navy Blue* `#0B132B`, *Deep Slate* `#1E293B`) com acentos em Azul Royal (`#0E87EB`), Teal/Ciano para Inteligência Artificial (`#06B6D4`), Esmeralda para financeiro/sucesso (`#10B981`) e Âmbar/Rubi para alertas de urgência.
- **Acessibilidade Universal**: Indicadores de status e urgência nunca dependem exclusivamente de cor — combinam ícones semânticos, rótulos textuais explícitos (ex: `[CRÍTICO] Fatal`, `⚠️ Vencido`, `⏳ Vence Hoje`) e contrastes certificados.
- **Totalmente Responsivo**: Layout otimizado para desktop, tablets e smartphones com gaveta móvel e modais adaptáveis.

---

## 📦 Estrutura de Módulos

| Módulo | Descrição e Recursos |
| :--- | :--- |
| **1. Autenticação & RBAC** | Controle de acesso por perfil: **Administrador/Sócio** (visão irrestrita de todos os processos, advogados e financeiro) e **Advogado Associado** (visão filtrada exclusivamente para seus casos e clientes). Botões de 1-clique na tela de login para demonstração ágil. |
| **2. Dashboard Executivo** | Painel de síntese com cards de KPIs em tempo real, banner de alerta de prazos vencidos/fatais, agenda cronológica de audiências e atalhos de ação rápida. |
| **3. Módulo de Clientes** | Cadastro completo de pessoas físicas (CPF) e jurídicas (CNPJ), validação de documentos, telefone com link direto para WhatsApp, endereçamento e histórico de processos vinculados. |
| **4. Módulo de Advogados** | Gestão do corpo jurídico com número OAB/UF, especialidades técnicas, papel na banca e carga de processos sob responsabilidade. |
| **5. Módulo de Processos** | Controle completo de demandas judiciais no padrão CNJ (`0000000-00.0000.0.00.0000`), vinculação cliente-advogado, fases processuais (Inicial, Instrução, Sentença, Recursal, Execução), valor da causa e modal de detalhes em abas. |
| **6. Prazos & Audiências** | Controle rigoroso de prazos fatais com classificação de prioridade (Crítica, Alta, Média, Normal), filtros temporais (*Hoje*, *Esta Semana*, *Vencidos*) e baixa em 1-clique. |
| **7. Financeiro & Honorários** | Lançamentos de honorários iniciais, êxito, retainers mensais e custas judiciais. Filtros de status (Pago, Pendente, Atrasado), formas de pagamento (PIX, Boleto, TED) e anexo de comprovantes. Acesso restrito por perfil. |
| **8. Repositório de Documentos** | Upload seguro com validação de extensão (`.pdf`, `.docx`, `.xlsx`, `.png`) e tamanho (máx. 25MB), categorização (Procurações, Contratos, Petições, Laudos, Sentenças) e flag de sigilo profissional. |
| **9. Área do Advogado** | Cockpit personalizado focado no dia a dia do advogado logado (sua pauta de hoje, suas audiências e seus processos). |
| **10. Dex AI — Assistente** | Motor analítico de triagem que processa relatos fáticos brutos e gera: (1) Resumo dos Fatos & Enquadramento, (2) Perguntas Complementares, (3) Checklist de Documentos, (4) Classificação de Urgência & Risco. Inclui botão para converter a análise diretamente em abertura de processo. |
| **11. Segurança & LGPD** | Painel de governança com Inventário de Dados Pessoais Tratados (finalidades, bases legais e retenção) e Trilha de Auditoria de Acessos. |

---

## 🤖 Diretrizes e Guardrails do Dex AI (Item 3.10)

O módulo **Dex AI** foi desenvolvido estritamente de acordo com as normas éticas do Estatuto da OAB e provimentos do Conselho Federal da OAB sobre Inteligência Artificial:

- **Aviso Obrigatório e Visível**: Em toda saída gerada pela IA é exibido o aviso com borda e destaque:
  > *"⚠️ Conteúdo gerado por IA. Revise antes de utilizar ou salvar. A IA não substitui a análise técnica e o julgamento privativo do advogado."*
- **Limitações Éticas**: A IA não profere decisões jurídicas definitivas, não garante êxito processual e nunca executa atos processuais sem validação humana.
- **Conector de API**: O código em `src/services/aiService.ts` possui uma arquitetura desacoplada e documentada para conexão direta com a **Anthropic Claude API**, **Google Gemini API** ou **OpenAI API**.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js versão 18+ instalado.

### Passo a passo
1. Abra o terminal na pasta do projeto:
   ```bash
   cd dex-juridico
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse no navegador: `http://localhost:3000`

---

## ☁️ Como Fazer Deploy no Vercel (100% Gratuito e Instantâneo)

O projeto já inclui o arquivo de configuração `vercel.json` configurado para Vite/React:

### Opção 1: Via Vercel CLI (Direto pelo terminal)
```bash
npm install -g vercel
vercel
```

### Opção 2: Via GitHub / Dashboard do Vercel
1. Crie um repositório no seu GitHub e suba a pasta do projeto.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório do Dex.
4. O Vercel detectará automaticamente as configurações:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **Deploy**. Em menos de 1 minuto seu sistema estará no ar com HTTPS gratuito!

---

## 🔒 Arquitetura de Segurança & Backend Real (Próximos Passos)

Para ambientes de produção com persistência em banco relacional:
- **Back-end Recomendado**: Node.js com Fastify/NestJS ou Go.
- **Banco de Dados**: PostgreSQL ou MySQL via Prisma ORM / Supabase.
- **Autenticação**: Tokens JWT assinados com RSA-256 e rotação de Refresh Tokens em cookies `HttpOnly` com flag `SameSite=Strict`.
- **Armazenamento de Arquivos**: Bucket S3 compatível (AWS S3, Cloudflare R2 ou Supabase Storage) com URLs pré-assinadas e expiração curta (15 minutos).
