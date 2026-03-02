/*
  # Gramarmores - Sistema de Orçamentos - Schema Completo

  ## Descrição
  Sistema completo de gestão de orçamentos para marmoraria com autenticação,
  cadastro de granitos, geração de orçamentos e PDFs.

  ## Tabelas Criadas

  ### 1. granitos
  Armazena o catálogo de granitos da marmoraria
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Referência ao usuário dono do registro
  - `nome` (text) - Nome do granito
  - `valor_m2` (numeric) - Valor por metro quadrado
  - `descricao` (text) - Descrição do produto
  - `categoria` (text) - Categoria do granito
  - `created_at` (timestamptz) - Data de criação

  ### 2. orcamentos
  Armazena os orçamentos criados
  - `id` (uuid, primary key) - Identificador único
  - `user_id` (uuid, foreign key) - Referência ao usuário dono do orçamento
  - `numero` (integer) - Número sequencial do orçamento (por usuário)
  - `cliente_nome` (text) - Nome ou razão social do cliente
  - `cliente_documento` (text) - CPF ou CNPJ
  - `cliente_telefone` (text) - Telefone de contato
  - `cliente_email` (text) - Email do cliente
  - `cliente_endereco` (text) - Endereço completo
  - `valor_total` (numeric) - Soma dos subtotais
  - `desconto` (numeric) - Desconto aplicado
  - `valor_final` (numeric) - Valor final após desconto
  - `pdf_path` (text) - Caminho do PDF no storage
  - `status` (text) - Status do orçamento (Pendente, Aprovado, Rejeitado)
  - `created_at` (timestamptz) - Data de criação

  ### 3. itens_orcamento
  Armazena os itens de cada orçamento
  - `id` (uuid, primary key) - Identificador único
  - `orcamento_id` (uuid, foreign key) - Referência ao orçamento
  - `granito_id` (uuid, foreign key) - Referência ao granito
  - `largura` (numeric) - Largura em metros
  - `altura` (numeric) - Altura em metros
  - `quantidade` (integer) - Quantidade de peças
  - `area` (numeric) - Área calculada (largura x altura)
  - `subtotal` (numeric) - Subtotal do item

  ## Segurança (RLS)
  - Todas as tabelas têm RLS habilitado
  - Usuários só podem acessar seus próprios dados
  - Policies específicas para SELECT, INSERT, UPDATE e DELETE
  - Validação de propriedade em cascata para itens_orcamento
*/

-- Criar tabela de granitos
CREATE TABLE IF NOT EXISTS granitos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  valor_m2 numeric(10, 2) NOT NULL CHECK (valor_m2 >= 0),
  descricao text DEFAULT '',
  categoria text DEFAULT 'Geral',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  numero integer NOT NULL,
  cliente_nome text NOT NULL,
  cliente_documento text DEFAULT '',
  cliente_telefone text DEFAULT '',
  cliente_email text DEFAULT '',
  cliente_endereco text DEFAULT '',
  valor_total numeric(10, 2) DEFAULT 0 CHECK (valor_total >= 0),
  desconto numeric(10, 2) DEFAULT 0 CHECK (desconto >= 0),
  valor_final numeric(10, 2) DEFAULT 0 CHECK (valor_final >= 0),
  pdf_path text DEFAULT '',
  status text DEFAULT 'Pendente',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, numero)
);

-- Criar tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid REFERENCES orcamentos(id) ON DELETE CASCADE NOT NULL,
  granito_id uuid REFERENCES granitos(id) ON DELETE RESTRICT NOT NULL,
  largura numeric(10, 2) NOT NULL CHECK (largura > 0),
  altura numeric(10, 2) NOT NULL CHECK (altura > 0),
  quantidade integer DEFAULT 1 CHECK (quantidade > 0),
  area numeric(10, 2) NOT NULL CHECK (area >= 0),
  subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_granitos_user_id ON granitos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_user_id ON orcamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_numero ON orcamentos(user_id, numero);
CREATE INDEX IF NOT EXISTS idx_itens_orcamento_id ON itens_orcamento(orcamento_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE granitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento ENABLE ROW LEVEL SECURITY;

-- Policies para tabela granitos
CREATE POLICY "Usuários podem visualizar seus próprios granitos"
  ON granitos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios granitos"
  ON granitos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios granitos"
  ON granitos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios granitos"
  ON granitos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies para tabela orcamentos
CREATE POLICY "Usuários podem visualizar seus próprios orçamentos"
  ON orcamentos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios orçamentos"
  ON orcamentos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos"
  ON orcamentos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios orçamentos"
  ON orcamentos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies para tabela itens_orcamento (validação em cascata)
CREATE POLICY "Usuários podem visualizar itens de seus orçamentos"
  ON itens_orcamento FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orcamentos
      WHERE orcamentos.id = itens_orcamento.orcamento_id
      AND orcamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir itens em seus orçamentos"
  ON itens_orcamento FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orcamentos
      WHERE orcamentos.id = itens_orcamento.orcamento_id
      AND orcamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar itens de seus orçamentos"
  ON itens_orcamento FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orcamentos
      WHERE orcamentos.id = itens_orcamento.orcamento_id
      AND orcamentos.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orcamentos
      WHERE orcamentos.id = itens_orcamento.orcamento_id
      AND orcamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar itens de seus orçamentos"
  ON itens_orcamento FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orcamentos
      WHERE orcamentos.id = itens_orcamento.orcamento_id
      AND orcamentos.user_id = auth.uid()
    )
  );

-- Função para gerar número sequencial de orçamento por usuário
CREATE OR REPLACE FUNCTION get_next_orcamento_numero(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1 INTO next_num
  FROM orcamentos
  WHERE user_id = p_user_id;
  
  RETURN next_num;
END;
$$;