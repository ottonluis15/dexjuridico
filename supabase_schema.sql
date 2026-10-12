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
    "isSuperAdmin" BOOLEAN DEFAULT false,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    salt TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dex_users ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN DEFAULT false;
ALTER TABLE public.dex_users ADD COLUMN IF NOT EXISTS "cnpj" TEXT;
ALTER TABLE public.dex_users ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE public.dex_users ADD COLUMN IF NOT EXISTS "primaryArea" TEXT;

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
    description TEXT,
    "clientId" TEXT,
    "caseId" TEXT,
    "lawyerId" TEXT,
    amount NUMERIC DEFAULT 0,
    "dueDate" TEXT,
    "paymentDate" TEXT,
    status TEXT DEFAULT 'PENDENTE',
    "paymentMethod" TEXT,
    "hasReceipt" BOOLEAN DEFAULT false,
    "receiptName" TEXT,
    "receiptUrl" TEXT,
    "receiptType" TEXT,
    "receiptSize" BIGINT,
    "officeId" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Migrações incrementais de colunas financeiras (caso a tabela já exista):
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "paymentDate" TEXT;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "hasReceipt" BOOLEAN DEFAULT false;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "receiptName" TEXT;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "receiptType" TEXT;
ALTER TABLE public.dex_financial ADD COLUMN IF NOT EXISTS "receiptSize" BIGINT;

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

-- 9. Tabela de Publicações do Mural da Equipe
CREATE TABLE IF NOT EXISTS public.dex_team_posts (
    id TEXT PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorInitial" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'COMUNICADO',
    "isPinned" BOOLEAN DEFAULT false,
    likes INT DEFAULT 0,
    "commentsCount" INT DEFAULT 0,
    "officeId" TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela de Curtidas do Mural (1 curtida por perfil por publicação)
CREATE TABLE IF NOT EXISTS public.dex_team_post_likes (
    id TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL REFERENCES public.dex_team_posts(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL,
    "officeId" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_post_user_like UNIQUE ("postId", "userId")
);

-- Migração de limpeza de curtidas duplicadas (se houverem)
DELETE FROM public.dex_team_post_likes a
USING public.dex_team_post_likes b
WHERE a.ctid < b.ctid
  AND a."postId" = b."postId"
  AND a."userId" = b."userId";

-- 11. Habilitar Políticas de Acesso Público Anon (Permite leitura/escrita com chave anon do Supabase)
ALTER TABLE public.dex_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_financial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dex_team_post_likes ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Permitir Leitura Dex Team Posts" ON public.dex_team_posts FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Team Posts" ON public.dex_team_posts FOR ALL USING (true);

CREATE POLICY "Permitir Leitura Dex Team Likes" ON public.dex_team_post_likes FOR SELECT USING (true);
CREATE POLICY "Permitir Gravacao Dex Team Likes" ON public.dex_team_post_likes FOR ALL USING (true);

-- 10. Inserir Contas Administrativas Iniciais (com Senha Admin123!)
INSERT INTO public.dex_users (
    id, name, email, role, oab, phone, specialties, status, "officeId", "officeName", "officeCode", "isIndependent", "isSuperAdmin", salt, "passwordHash", "avatarUrl"
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
    true,
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
    false,
    'a1b2c3d4e5f60718',
    '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'
)
ON CONFLICT (id) DO UPDATE SET "isSuperAdmin" = EXCLUDED."isSuperAdmin";

-- 12. Migração: Padronização de Títulos e Cargos no Masculino
UPDATE public.dex_lawyers 
SET "roleTitle" = REPLACE("roleTitle", 'Sócia Fundadora & Administradora', 'Sócio Fundador & Administrador')
WHERE "roleTitle" ILIKE '%Sócia Fundadora & Administradora%';

UPDATE public.dex_lawyers 
SET "roleTitle" = REPLACE("roleTitle", 'Advogada Autônoma', 'Advogado Autônomo')
WHERE "roleTitle" ILIKE '%Advogada Autônoma%';

UPDATE public.dex_lawyers 
SET "roleTitle" = REPLACE(REPLACE("roleTitle", 'Sócia', 'Sócio'), 'Advogada', 'Advogado')
WHERE "roleTitle" ILIKE '%Sócia%' OR "roleTitle" ILIKE '%Advogada%';

-- 13. Migração Tarefa 6: Garantia de Vínculo de Dono e Isolamento por Escritório em Clientes
-- Preenche officeId a partir do advogado vinculado, quando officeId estiver nulo/vazio
UPDATE public.dex_clients c
SET "officeId" = l."officeId"
FROM public.dex_lawyers l
WHERE c."linkedLawyerId" = l.id
  AND (c."officeId" IS NULL OR c."officeId" = '')
  AND l."officeId" IS NOT NULL;

-- Para registros sem nenhum vínculo remanescente, associa à matriz padrão
UPDATE public.dex_clients
SET "officeId" = 'off_dex_principal'
WHERE ("officeId" IS NULL OR "officeId" = '')
  AND ("linkedLawyerId" IS NULL OR "linkedLawyerId" = '');

-- 14. Migração Tarefa 5: Suporte a Conta de Demonstração (isDemo = true)
ALTER TABLE public.dex_users ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false;

-- Inserção da conta de demonstração sandbox dedicada
INSERT INTO public.dex_users (
    id, name, email, role, oab, phone, specialties, status,
    "officeId", "officeName", "officeCode", "isSuperAdmin", "isIndependent",
    salt, "passwordHash", "avatarUrl", "isDemo"
) VALUES (
    'usr_demo_apresentacao',
    'Demonstração Dex',
    'demo@dexjuridico.adv.br',
    'ADMIN',
    '000.000/DEMO',
    '(11) 99999-0000',
    '["Direito Geral", "Casos de Demonstração"]'::jsonb,
    'ACTIVE',
    'off_demo_sandbox',
    'Demonstração Comercial Dex',
    'DEMO-001',
    false,
    false,
    'a1b2c3d4e5f60718',
    '7ec23d5cbd8c1ff9db5abecfc8c289e6330ef637f917e6a3480bcbf812553d55',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    true
)
ON CONFLICT (id) DO UPDATE SET "isDemo" = true, "officeId" = 'off_demo_sandbox';


