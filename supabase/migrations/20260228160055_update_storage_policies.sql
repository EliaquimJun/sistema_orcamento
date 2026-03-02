/*
  # Atualizar Políticas de Storage

  ## Descrição
  Atualiza as políticas do bucket orcamentos para permitir acesso simplificado.

  ## Alterações
  - Remove políticas antigas
  - Cria novas políticas sem restrição de pasta
  - Mantém segurança por usuário autenticado
*/

DROP POLICY IF EXISTS "Usuários podem fazer upload de PDFs de orçamentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios PDFs" ON storage.objects;

CREATE POLICY "Autenticados podem fazer upload no bucket orcamentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orcamentos');

CREATE POLICY "Autenticados podem atualizar arquivos no bucket orcamentos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'orcamentos')
WITH CHECK (bucket_id = 'orcamentos');

CREATE POLICY "Autenticados podem ler arquivos do bucket orcamentos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'orcamentos');

CREATE POLICY "Autenticados podem deletar arquivos do bucket orcamentos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'orcamentos');