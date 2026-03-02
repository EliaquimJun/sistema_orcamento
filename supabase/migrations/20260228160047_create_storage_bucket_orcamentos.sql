/*
  # Criar Bucket de Storage para Orçamentos

  ## Descrição
  Cria um bucket privado para armazenar os PDFs dos orçamentos gerados.

  ## Configuração
  - Nome do bucket: orcamentos
  - Tipo: Privado
  - Políticas de acesso configuradas para usuários autenticados

  ## Segurança
  - Usuários autenticados podem fazer upload de PDFs
  - Usuários só podem acessar seus próprios PDFs
  - Arquivo público apenas via signed URL
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('orcamentos', 'orcamentos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Usuários podem fazer upload de PDFs de orçamentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'orcamentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuários podem atualizar seus próprios PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'orcamentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'orcamentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuários podem ler seus próprios PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'orcamentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuários podem deletar seus próprios PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'orcamentos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);