-- ==============================================================================
-- DEX JURÍDICO — SCRIPT DE CRIAÇÃO DO BANCO DE DADOS NA NUVEM (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Como usar:
-- 1. Acesse seu painel do Supabase (https://supabase.com/dashboard)
-- 2. Entre no seu projeto e clique em "SQL Editor" no menu lateral esquerdo
-- 3. Cole todo o conteúdo deste arquivo e clique em "Run" (Executar)
-- ==============================================================================

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.dex_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'LAWYER',
    oab TEXT,
    phone TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ACTIVE',
    "officeId" TEXT,
    "officeName" TEXT,
    "officeCode" TEXT,
    "isIndependent" BOOLEAN DEFAULT false,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    salt TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.dex_clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'PF',
    document TEXT,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    "createdAt" TEXT,
    status TEXT DEFAULT 'ACTIVE',
    "linkedLawyerId" TEXT,
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Advogados
CREATE TABLE IF NOT EXISTS public.dex_lawyers (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    oab TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ACTIVE',
    "roleTitle" TEXT,
    "assignedCasesCount" INT DEFAULT 0,
    "officeId" TEXT,
    "avatarUrl" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Processos
CREATE TABLE IF NOT EXISTS public.dex_cases (
    id TEXT PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    court TEXT,
    "clientId" TEXT,
    "lawyerId" TEXT,
    "legalArea" TEXT,
    "actionType" TEXT,
    status TEXT DEFAULT 'INICIAL',
    value NUMERIC DEFAULT 0,
    "distributionDate" TEXT,
    description TEXT,
    "updatedAt" TEXT,
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Prazos
CREATE TABLE IF NOT EXISTS public.dex_deadlines (
    id TEXT PRIMARY KEY,
    "caseId" TEXT,
    "lawyerId" TEXT,
    type TEXT,
    description TEXT,
    "dueDate" TEXT,
    "dueTime" TEXT,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'PENDING',
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Financeiro
CREATE TABLE IF NOT EXISTS public.dex_financial (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    "clientId" TEXT,
    "caseId" TEXT,
    "lawyerId" TEXT,
    amount NUMERIC DEFAULT 0,
    "dueDate" TEXT,
    status TEXT DEFAULT 'PENDENTE',
    "paymentMethod" TEXT,
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Documentos
CREATE TABLE IF NOT EXISTS public.dex_documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    "clientId" TEXT,
    "caseId" TEXT,
    "uploadedByLawyerId" TEXT,
    "fileSize" BIGINT DEFAULT 0,
    "fileType" TEXT,
    "createdAt" TEXT,
    "isConfidential" BOOLEAN DEFAULT false,
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Modelos Jurídicos
CREATE TABLE IF NOT EXISTS public.dex_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" BIGINT DEFAULT 0,
    "fileData" TEXT,
    "uploadedByUserId" TEXT,
    "uploadedByName" TEXT,
    "officeId" TEXT,
    "createdAt" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habilitar Políticas de Acesso Público Anon (Permite leitura/escrita com chave anon do Supabase)
ALTER TABLE public.dex_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_financial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_templates ENABLE ROW LEVEL SECURITY;

-- Políticas universais de leitura e gravação para a chave pública anon
CREATE POLICY "Permitir Leitura Dex Users" ON public.dex_users FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Users" ON public.dex_users FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Clientes" ON public.dex_clients FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Clientes" ON public.dex_clients FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Advogados" ON public.dex_lawyers FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Advogados" ON public.dex_lawyers FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Processos" ON public.dex_cases FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Processos" ON public.dex_cases FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Prazos" ON public.dex_deadlines FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Prazos" ON public.dex_deadlines FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Financeiro" ON public.dex_financial FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Financeiro" ON public.dex_financial FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Documentos" ON public.dex_documents FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Documentos" ON public.dex_documents FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Modelos" ON public.dex_templates FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Modelos" ON public.dex_templates FOR ALL USING (true);

-- 10. Inserir Contas Administrativas Iniciais (com Senha Admin123!)
INSERT INTO public.dex_users (
    id, name, email, role, oab, phone, specialties, status, "officeId", "officeName", "officeCode", "isIndependent", salt, "passwordHash", "avatarUrl"
) VALUES 
(
    'usr_admin_otton',
    'Dr. Otton Luis',
    'otton.luis.alcaraz@gmail.com',
    'ADMIN',
    '245.890/SP',
    '(11) 99999-8888',
    '["Direito Digital", "Contratos", "Direito Civil"]'::jsonb,
    'ACTIVE',
    'off_dex_principal',
    'Moreira & Associados Advocacia',
    'DEX-1001',
    false,
    'a1b2c3d4e5f60718',
    '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop'
),
(
    'usr_admin_1',
    'Dra. Helena Moreira',
    'admin@dexjuridico.adv.br',
    'ADMIN',
    '184.920/SP',
    '(11) 98765-4321',
    '["Direito Empresarial", "Tributário", "Contratos"]'::jsonb,
    'ACTIVE',
    'off_dex_principal',
    'Moreira & Associados Advocacia',
    'DEX-1001',
    false,
    'a1b2c3d4e5f60718',
    '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'
)
ON CONFLICT (id) DO NOTHING;
