/*
  # Adiciona campos de Validade e Prazo de Entrega aos Orçamentos

  1. Alterações na Tabela `orcamentos`
    - Adiciona coluna `validade` (text) - Texto livre para validade do orçamento (ex: "30 dias", "15 dias")
    - Adiciona coluna `prazo_entrega` (text) - Texto livre para prazo de entrega (ex: "5 dias úteis", "A combinar")
  
  2. Observações
    - Campos opcionais com valores padrão
    - Permite flexibilidade para o usuário inserir informações customizadas
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orcamentos' AND column_name = 'validade'
  ) THEN
    ALTER TABLE orcamentos ADD COLUMN validade text DEFAULT '30 dias';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orcamentos' AND column_name = 'prazo_entrega'
  ) THEN
    ALTER TABLE orcamentos ADD COLUMN prazo_entrega text DEFAULT 'A combinar';
  END IF;
END $$;
