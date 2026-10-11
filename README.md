# DEX — Sistema de Gestão Jurídica Modularizado com Assistência de IA

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**DEX** é uma plataforma web completa de gestão jurídica modularizada desenvolvida especificamente para escritórios de advocacia de médio e grande porte, bancas especializadas e advogados autônomos. O sistema centraliza a gestão de clientes, processos judiciais no formato unificado CNJ, prazos fatais e audiências, controle financeiro de honorários, repositório de documentos sob sigilo e triagem inteligente de casos com **Inteligência Artificial (Dex AI)**.

> Elaborado a partir das diretrizes do TCC *"Arquitetura e Implementação de um Software de Gestão Jurídica Modularizado com Assistência baseada em Inteligência Artificial: DEX"*.

---

## 🏢 Escritório Demonstrativo Pré-Configurado

O sistema já vem populado de fábrica com uma banca advocatícia completa e estruturada:

- **Nome da Banca**: **Moreira & Alcaraz Advogados Associados**
- **Código do Escritório**: `DEX-1001`
- **CNPJ**: `41.289.470/0001-38`
- **Sede**: Av. Paulista, 1842 - São Paulo / SP
- **Sócios Titulares / Administradores**:
  - **Dr. Otton Luis** (`otton.luis.alcaraz@gmail.com`) — *Sócio Fundador & Super Admin (Dex Platform Admin)*
  - **Dra. Helena Moreira** (`admin@dexjuridico.adv.br`) — *Sócia Administradora da Banca*

---

## 👥 Corpo Jurídico — 6 Advogados Especialistas

A banca conta com **6 advogados associados em áreas do direito completamente distintas**, permitindo testar o isolamento de perfis RBAC, a pauta diária na **Área do Advogado** e a distribuição equilibrada de demandas:

| Advogado(a) | Área de Atuação | OAB | Cargo | E-mail de Acesso | Senha Padrão |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Lucas Mendes** | **Direito do Trabalho** | `312.450/SP` | Advogado Associado Sênior | `lucas.mendes@dexjuridico.adv.br` | `Admin123!` |
| **Dra. Camila Rocha** | **Direito Tributário & Aduaneiro** | `198.742/RJ` | Coordenadora Tributária | `camila.rocha@dexjuridico.adv.br` | `Admin123!` |
| **Dr. Rafael Silveira** | **Direito Empresarial & Societário (M&A)** | `264.310/SP` | Advogado Associado Sênior | `rafael.silveira@dexjuridico.adv.br` | `Admin123!` |
| **Dra. Juliana Matsuoka** | **Direito Digital & LGPD** | `54.890/DF` | Especialista em Legal Tech & IA | `juliana.matsuoka@dexjuridico.adv.br` | `Admin123!` |
| **Dr. Gabriel Fontes** | **Direito de Família & Sucessões** | `172.930/MG` | Advogado Associado | `gabriel.fontes@dexjuridico.adv.br` | `Admin123!` |
| **Dra. Mariana Vasconcelos** | **Direito Cível Estratégico & Imobiliário** | `89.450/RS` | Advogada Associada | `mariana.vasconcelos@dexjuridico.adv.br` | `Admin123!` |

> **Advogada Autônoma (Para Teste de Isolamento Total)**:
> - **Dra. Beatriz Albuquerque** (`beatriz.albuquerque@dexjuridico.adv.br` / Senha: `Admin123!`) — Advogada com escritório individual independente. Ao logar com este perfil, nenhum processo, cliente ou financeiro do escritório Moreira & Alcaraz é visível (isolamento estrito RBAC).

---

## ⚖️ Os 15 Processos Judiciais Populados (Padrão CNJ)

O escritório possui **15 processos judiciais reais e completos** distribuídos entre as diferentes áreas jurídicas, tribunais estaduais, federais e trabalhistas:

| # | Número CNJ | Tribunal / Vara | Advogado Responsável | Área | Cliente | Fase | Valor da Causa |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `1004521-88.2026.5.02.0045` | 45ª Vara do Trabalho de SP (TRT-2) | Dr. Lucas Mendes | Trabalhista | TechVanguard Ltda | Inicial | R$ 145.000,00 |
| **2** | `0010923-54.2025.5.02.0012` | 12ª Vara do Trabalho de SP (TRT-2) | Dr. Lucas Mendes | Trabalhista | LogExpress S.A. | Instrução | R$ 280.000,00 |
| **3** | `5012948-33.2025.4.03.6100` | 7ª Vara Cível Federal de SP (TRF-3) | Dra. Camila Rocha | Tributário | BioNutri Alimentos S.A. | Sentença | R$ 1.850.000,00 |
| **4** | `0043819-15.2024.4.02.5101` | 3ª Vara Exec. Fiscal do RJ (TRF-2) | Dra. Camila Rocha | Tributário | Construtora Horizonte Sul | Recursal | R$ 720.000,00 |
| **5** | `1034921-70.2025.8.26.0053` | 11ª Vara da Fazenda Pública (TJSP) | Dra. Camila Rocha | Tributário | BioNutri Alimentos S.A. | Inicial | R$ 490.000,00 |
| **6** | `1023849-12.2025.8.26.0100` | 2ª Vara Cível Central (TJSP) | Dr. Rafael Silveira | Empresarial | TechVanguard Ltda | Instrução | R$ 340.000,00 |
| **7** | `1089201-44.2025.8.26.0100` | 1ª Vara Empresarial e Arbitragem (TJSP) | Dr. Rafael Silveira | Empresarial | InvestCore S.A. | Inicial | R$ 2.400.000,00 |
| **8** | `1045920-80.2026.8.26.0100` | 34ª Vara Cível Central (TJSP) | Dra. Juliana Matsuoka | Direito Digital | NexaHealth Telemedicina | Inicial | R$ 380.000,00 |
| **9** | `5009841-20.2025.4.02.5101` | 9ª Vara Federal do RJ (TRF-2) | Dra. Juliana Matsuoka | Direito Digital | NexaHealth Telemedicina | Instrução | R$ 550.000,00 |
| **10** | `1008734-62.2025.8.13.0024` | 2ª Vara de Sucessões de BH (TJMG) | Dr. Gabriel Fontes | Família & Sucessões | Mariana Silveira Campos | Instrução | R$ 4.200.000,00 |
| **11** | `1015642-19.2026.8.13.0024` | 4ª Vara de Família de BH (TJMG) | Dr. Gabriel Fontes | Família & Sucessões | Eduardo Barreto Vasques | Contestação | R$ 96.000,00 |
| **12** | `5043810-90.2025.8.21.0001` | 16ª Vara Cível de Porto Alegre (TJRS) | Dra. Mariana Vasconcelos | Cível & Imobiliário | BellaDonna Cosméticos | Sentença | R$ 410.000,00 |
| **13** | `5019842-11.2026.8.21.0001` | 5ª Vara Cível de Porto Alegre (TJRS) | Dra. Mariana Vasconcelos | Cível & Imobiliário | Marcelo H. Fagundes | Inicial | R$ 620.000,00 |
| **14** | `1067219-40.2024.8.26.0100` | 22ª Vara Cível Central (TJSP) | Dra. Helena Moreira | Empresarial | InvestCore S.A. | Execução | R$ 1.150.000,00 |
| **15** | `1092834-05.2025.8.26.0100` | 3ª Vara Cível Central (TJSP) | Dr. Otton Luis | Direito Digital | TechVanguard Ltda | Recursal | R$ 890.000,00 |

---

## 🏛️ Identidade Visual & Design System

- **Paleta Profissional**: Tons neutros profundos (*Navy Blue* `#0B132B`, *Deep Slate* `#1E293B`) com acentos em Azul Royal (`#0E87EB`), Dourado Nobre (`#C4975A`), Ciano/Teal para Inteligência Artificial (`#06B6D4`), Esmeralda para financeiro/sucesso (`#10B981`) e Âmbar/Rubi para alertas de urgência.
- **Acessibilidade Universal**: Indicadores de status e urgência combinam ícones semânticos, rótulos textuais explícitos (ex: `[CRÍTICO] Fatal`, `⚠️ Vencido`, `⏳ Vence Hoje`) e contrastes certificados.
- **Totalmente Responsivo**: Layout otimizado para desktop, tablets e smartphones com navegação suave sem recarga de tela (SPA).

---

## 📦 Estrutura de Módulos do Sistema

| Módulo | Descrição e Recursos |
| :--- | :--- |
| **1. Autenticação & RBAC** | Controle de acesso por perfil: **Administrador/Sócio** (visão irrestrita de todos os processos, advogados e financeiro) e **Advogado Associado** (visão filtrada exclusivamente para seus casos e clientes). Botões de 1-clique na tela de login para demonstração ágil. |
| **2. Dashboard Executivo** | Painel de síntese com cards de KPIs em tempo real, banner de alerta de prazos vencidos/fatais, agenda cronológica de audiências e atalhos de ação rápida. |
| **3. Módulo de Clientes** | Cadastro completo de pessoas físicas (CPF) e jurídicas (CNPJ), validação de documentos, telefone com link direto para WhatsApp, endereçamento e histórico de processos vinculados. |
| **4. Módulo de Advogados (Equipe)** | Gestão do corpo jurídico com número OAB/UF, especialidades técnicas, papel na banca e carga de processos sob responsabilidade. |
| **5. Módulo de Processos** | Controle completo de demandas judiciais no padrão CNJ (`0000000-00.0000.0.00.0000`), vinculação cliente-advogado, fases processuais (Inicial, Instrução, Sentença, Recursal, Execução), valor da causa e modal de detalhes em abas. |
| **6. Prazos & Audiências** | Controle rigoroso de prazos fatais com classificação de prioridade (Crítica, Alta, Média, Normal), filtros temporais (*Hoje*, *Esta Semana*, *Vencidos*) e baixa em 1-clique. |
| **7. Financeiro & Honorários** | Lançamentos de honorários iniciais, êxito, retainers mensais e custas judiciais. Filtros de status (Pago, Pendente, Atrasado), formas de pagamento (PIX, Boleto, TED) e anexo/download de comprovantes. |
| **8. Modelos de Documentos** | Repositório funcional de minutas (Procurações, Contratos, Petições Iniciais, Contestações e Notificações) com download imediato e upload de novos modelos. |
| **9. Área do Advogado (Workbench)** | Cockpit personalizado focado no dia a dia do advogado logado (sua pauta de hoje, suas audiências e seus processos sob condução). |
| **10. Dex AI — Assistente Jurídico** | Motor analítico de triagem que processa relatos fáticos (por texto ou **áudio gravado/transcrito via Google Gemini API**) e gera: Resumo dos Fatos, Enquadramento Jurídico, Perguntas Complementares, Checklist de Documentos e Classificação de Urgência. Inclui botão para converter a triagem diretamente em abertura de processo. |
| **11. Mural da Equipe** | Rede de comunicação interna da banca para comunicados, avisos e vitórias judiciais, com suporte a comentários, curtidas por perfil e persistência em nuvem (Supabase). |
| **12. Relatórios & Inteligência Jurídica** | Exportação profissional de relatórios em **PDF formatado** e planilhas **Excel (.xls)** de processos, prazos e financeiro. |
| **13. Segurança & LGPD** | Painel de governança com Inventário de Dados Pessoais Tratados (finalidades, bases legais e retenção) e Trilha de Auditoria de Acessos criptografada. |
| **14. Configurações da Plataforma** | Restrito exclusivamente ao **App Admin (Dex Platform Admin)** para governança de instâncias e chaves de API. |

---

## 🤖 Transcrição de Áudio com Google Gemini AI

O Dex AI integra a API do **Google Gemini 1.5 Flash (`gemini-flash-latest`)**:
- Grave áudios de relatos de clientes diretamente no navegador ou anexe arquivos de voz.
- O endpoint `/api/transcribe` (Serverless Function na Vercel e middleware local no Vite) processa a gravação e retorna a transcrição com fidelidade jurídica em português do Brasil.
- Para habilitar, basta preencher a variável de ambiente `GEMINI_API_KEY` na Vercel ou no arquivo `.env` local.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js versão 18+ instalado.

### Passo a passo
1. Abra o terminal na pasta do projeto:
   ```bash
   cd dexjuridico
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

## ☁️ Como Fazer Deploy no Vercel (100% Gratuito)

O projeto já inclui o arquivo de configuração `vercel.json` e a Serverless Function `api/transcribe.ts`:

1. Faça commit e push das alterações para seu repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório do Dex.
4. Adicione as variáveis de ambiente em **Settings > Environment Variables**:
   - `GEMINI_API_KEY`: sua chave de API do Google AI Studio.
   - `VITE_APP_ADMIN_EMAIL`: `otton.luis.alcaraz@gmail.com`
   - *(Opcional)* `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: caso deseje persistência remota no Supabase.
5. Clique em **Deploy**. O sistema estará online com certificado SSL/HTTPS gratuito e CDN global!
