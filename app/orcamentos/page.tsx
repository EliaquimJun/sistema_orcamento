'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Download, MessageCircle, Trash2, Eye, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateOrcamentoPDF } from '@/lib/pdf-generator';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import Link from 'next/link';
import { OrcamentoPreview } from '@/components/OrcamentoPreview';

interface Orcamento {
  id: string;
  numero: number;
  cliente_nome: string;
  cliente_documento: string;
  cliente_telefone: string;
  cliente_email: string;
  cliente_endereco: string;
  valor_total: number;
  desconto: number;
  valor_final: number;
  pdf_path: string;
  status: string;
  created_at: string;
  validade: string;
  prazo_entrega: string;
  itens_orcamento?: any[];
}

export default function OrcamentosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteOrcamentoId, setDeleteOrcamentoId] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadOrcamentos();
    }
  }, [user]);

  const loadOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(*, granitos(nome, valor_m2))')
        .eq('user_id', user?.id)
        .order('numero', { ascending: false });

      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar orçamentos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orcamentoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: novoStatus })
        .eq('id', orcamentoId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Status atualizado com sucesso!',
      });

      loadOrcamentos();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteOrcamentoId) return;

    try {
      const orcamento = orcamentos.find((o) => o.id === deleteOrcamentoId);

      if (orcamento?.pdf_path) {
        const fileName = orcamento.pdf_path.split('/').pop();
        if (fileName) {
          await supabase.storage.from('orcamentos').remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', deleteOrcamentoId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Orçamento excluído com sucesso!',
      });

      setDeleteDialogOpen(false);
      setDeleteOrcamentoId(null);
      loadOrcamentos();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir orçamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGeneratePDF = async (orcamento: Orcamento) => {
    setGeneratingPDF(orcamento.id);

    try {
      const itensFormatados = orcamento.itens_orcamento?.map((item: any) => ({
        granito_nome: item.granitos?.nome || '',
        largura: item.largura,
        altura: item.altura,
        quantidade: item.quantidade,
        area: item.area,
        valor_m2: item.granitos?.valor_m2 || 0,
        subtotal: item.subtotal,
      })) || [];

      const pdfData = {
        numero: orcamento.numero,
        cliente: {
          nome: orcamento.cliente_nome,
          documento: orcamento.cliente_documento,
          telefone: orcamento.cliente_telefone,
          email: orcamento.cliente_email,
          endereco: orcamento.cliente_endereco,
        },
        itens: itensFormatados,
        valor_total: orcamento.valor_total,
        desconto: orcamento.desconto,
        valor_final: orcamento.valor_final,
        created_at: orcamento.created_at,
        validade: orcamento.validade,
        prazo_entrega: orcamento.prazo_entrega,
      };

      const pdfBlob = generateOrcamentoPDF(pdfData);

      const fileName = `orcamento-${orcamento.numero}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('orcamentos')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('orcamentos')
        .update({ pdf_path: fileName })
        .eq('id', orcamento.id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      toast({
        title: 'PDF gerado com sucesso!',
      });

      loadOrcamentos();
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleDownloadPDF = async (orcamento: Orcamento) => {
    if (!orcamento.pdf_path) {
      await handleGeneratePDF(orcamento);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('orcamentos')
        .download(orcamento.pdf_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orcamento-${orcamento.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Erro ao baixar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleWhatsApp = async (orcamento: Orcamento) => {
    if (!orcamento.cliente_telefone) {
      toast({
        title: 'Telefone não cadastrado',
        description: 'Adicione um telefone ao cliente para enviar via WhatsApp',
        variant: 'destructive',
      });
      return;
    }

    try {
      let pdfUrl = '';

      if (orcamento.pdf_path) {
        const { data } = await supabase.storage
          .from('orcamentos')
          .createSignedUrl(orcamento.pdf_path, 604800);

        if (data?.signedUrl) {
          pdfUrl = data.signedUrl;
        }
      }

      const whatsappLink = generateWhatsAppLink(
        orcamento.cliente_telefone,
        orcamento.numero,
        orcamento.cliente_nome,
        orcamento.valor_final,
        pdfUrl
      );

      window.open(whatsappLink, '_blank');
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar link do WhatsApp',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async (orcamento: Orcamento) => {
    if (!orcamento.cliente_email) {
      toast({
        title: 'Email não cadastrado',
        description: 'Adicione um email ao cliente para enviar o orçamento',
        variant: 'destructive',
      });
      return;
    }

    setSendingEmail(orcamento.id);

    try {
      let pdfUrl = '';

      if (!orcamento.pdf_path) {
        await handleGeneratePDF(orcamento);
        const { data: updatedOrcamento } = await supabase
          .from('orcamentos')
          .select('pdf_path')
          .eq('id', orcamento.id)
          .single();

        if (updatedOrcamento?.pdf_path) {
          const { data } = await supabase.storage
            .from('orcamentos')
            .createSignedUrl(updatedOrcamento.pdf_path, 604800);
          if (data?.signedUrl) {
            pdfUrl = data.signedUrl;
          }
        }
      } else {
        const { data } = await supabase.storage
          .from('orcamentos')
          .createSignedUrl(orcamento.pdf_path, 604800);
        if (data?.signedUrl) {
          pdfUrl = data.signedUrl;
        }
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-orcamento-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          to: orcamento.cliente_email,
          clientName: orcamento.cliente_nome,
          orcamentoNumber: orcamento.numero,
          pdfUrl: pdfUrl,
          valorTotal: orcamento.valor_final,
          validade: orcamento.validade,
          prazoEntrega: orcamento.prazo_entrega,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao enviar email');
      }

      toast({
        title: 'Email enviado com sucesso!',
        description: `Orçamento enviado para ${orcamento.cliente_email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handlePreview = (orcamento: Orcamento) => {
    const itensFormatados = orcamento.itens_orcamento?.map((item: any) => ({
      granito_nome: item.granitos?.nome || '',
      largura: item.largura,
      altura: item.altura,
      quantidade: item.quantidade,
      area: item.area,
      valor_m2: item.granitos?.valor_m2 || 0,
      subtotal: item.subtotal,
    })) || [];

    setPreviewData({
      numero: orcamento.numero,
      cliente: {
        nome: orcamento.cliente_nome,
        documento: orcamento.cliente_documento,
        telefone: orcamento.cliente_telefone,
        email: orcamento.cliente_email,
        endereco: orcamento.cliente_endereco,
      },
      itens: itensFormatados,
      valor_total: orcamento.valor_total,
      desconto: orcamento.desconto,
      valor_final: orcamento.valor_final,
      validade: orcamento.validade,
      prazo_entrega: orcamento.prazo_entrega,
    });

    setPreviewOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      Pendente: 'secondary',
      Aprovado: 'default',
      Rejeitado: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={
        status === 'Aprovado' ? 'bg-green-600 hover:bg-green-700' : ''
      }>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Orçamentos</h1>
            <p className="text-sm md:text-base text-zinc-400">Gerencie todos os orçamentos</p>
          </div>
          <Link href="/orcamentos/novo">
            <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        {orcamentos.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum orçamento cadastrado</h3>
              <p className="text-zinc-400 mb-6">Comece criando seu primeiro orçamento</p>
              <Link href="/orcamentos/novo">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orcamentos.map((orcamento) => (
              <Card key={orcamento.id} className="bg-zinc-900/50 border-zinc-800 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-white">
                        Orçamento #{orcamento.numero}
                      </h3>
                      {getStatusBadge(orcamento.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-zinc-400">Cliente</p>
                        <p className="text-white font-medium break-words">{orcamento.cliente_nome}</p>
                        {orcamento.cliente_telefone && (
                          <p className="text-sm text-zinc-400">{orcamento.cliente_telefone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Data</p>
                        <p className="text-white font-medium">
                          {format(new Date(orcamento.created_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Valor Total</p>
                        <p className="text-xl md:text-2xl font-bold text-amber-600">
                          {formatCurrency(orcamento.valor_final)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <Select
                      value={orcamento.status}
                      onValueChange={(value) => handleStatusChange(orcamento.id, value)}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-full lg:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="Pendente" className="text-white">Pendente</SelectItem>
                        <SelectItem value="Aprovado" className="text-white">Aprovado</SelectItem>
                        <SelectItem value="Rejeitado" className="text-white">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-5 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(orcamento)}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(orcamento)}
                        disabled={generatingPDF === orcamento.id}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendEmail(orcamento)}
                        disabled={sendingEmail === orcamento.id}
                        className="bg-blue-600 border-blue-700 text-white hover:bg-blue-700"
                        title="Enviar por Email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsApp(orcamento)}
                        className="bg-green-600 border-green-700 text-white hover:bg-green-700"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDeleteOrcamentoId(orcamento.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="bg-zinc-800 border-zinc-700 text-red-400 hover:bg-zinc-700"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {previewData && (
          <OrcamentoPreview open={previewOpen} onOpenChange={setPreviewOpen} data={previewData} />
        )}
      </div>
    </DashboardLayout>
  );
}
