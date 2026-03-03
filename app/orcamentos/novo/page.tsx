'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye } from 'lucide-react';
import { OrcamentoPreview } from '@/components/OrcamentoPreview';

interface Granito {
  id: string;
  nome: string;
  valor_m2: number;
  categoria: string;
}

interface ItemOrcamento {
  granito_id: string;
  granito_nome?: string;
  valor_m2?: number;
  m2: number;
  m2_input?: string;
  quantidade: number;
  subtotal: number;
}

export default function NovoOrcamentoPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [granitos, setGranitos] = useState<Granito[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [clienteData, setClienteData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    email: '',
    endereco: '',
  });

  const [validade, setValidade] = useState('30 dias');
  const [prazoEntrega, setPrazoEntrega] = useState('A combinar');
  const [condicoesPagamento, setCondicoesPagamento] = useState(
    'Entrada de 50% no ato da aprovação\n50% restante na entrega'
  );

  const [itens, setItens] = useState<ItemOrcamento[]>([
    {
      granito_id: '',
      m2: 0,
      m2_input: '',
      quantidade: 1,
      subtotal: 0,
    },
  ]);

  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    if (user) loadGranitos();
  }, [user]);

  const loadGranitos = async () => {
    const { data } = await supabase
      .from('granitos')
      .select('*')
      .eq('user_id', user?.id)
      .order('nome');

    setGranitos(data || []);
  };

  const calcularItem = (index: number, field: string, value: any) => {
    const novosItens = [...itens];
    const item = { ...novosItens[index] };

    if (field === 'granito_id') {
      item.granito_id = value;
      const granito = granitos.find((g) => g.id === value);
      if (granito) {
        item.granito_nome = granito.nome;
        item.valor_m2 = granito.valor_m2;
      }
    }

    if (field === 'm2') {
      item.m2_input = value;
      const numero = parseFloat(value.replace(',', '.'));
      item.m2 = isNaN(numero) ? 0 : numero;
    }

    if (field === 'quantidade') {
      item.quantidade = parseInt(value) || 1;
    }

    item.subtotal =
      item.m2 * (item.valor_m2 || 0) * item.quantidade;

    novosItens[index] = item;
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        granito_id: '',
        m2: 0,
        m2_input: '',
        quantidade: 1,
        subtotal: 0,
      },
    ]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const calcularTotal = () =>
    itens.reduce((sum, item) => sum + item.subtotal, 0);

  const calcularValorFinal = () =>
    calcularTotal() - desconto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do cliente é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: numeroData } = await supabase.rpc(
        'get_next_orcamento_numero',
        { p_user_id: user?.id }
      );

      const numero = numeroData;

      const { data: orcamento } = await supabase
        .from('orcamentos')
        .insert({
          user_id: user?.id,
          numero,
          cliente_nome: clienteData.nome,
          cliente_documento: clienteData.documento,
          cliente_telefone: clienteData.telefone,
          cliente_email: clienteData.email,
          cliente_endereco: clienteData.endereco,
          valor_total: calcularTotal(),
          desconto,
          valor_final: calcularValorFinal(),
          validade,
          prazo_entrega: prazoEntrega,
          condicoes_pagamento: condicoesPagamento,
          status: 'Pendente',
        })
        .select()
        .single();

      const itensParaInserir = itens.map((item) => ({
        orcamento_id: orcamento.id,
        granito_id: item.granito_id,
        area: item.m2,
        quantidade: item.quantidade,
        subtotal: item.subtotal,
      }));

      await supabase
        .from('itens_orcamento')
        .insert(itensParaInserir);

      toast({
        title: 'Orçamento criado com sucesso!',
        description: `Orçamento #${numero} cadastrado`,
      });

      router.push('/orcamentos');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const previewData = {
    numero: 0,
    cliente: clienteData,
    itens: itens.map((item) => ({
      granito_nome:
        granitos.find((g) => g.id === item.granito_id)?.nome || '',
      m2: item.m2,
      quantidade: item.quantidade,
      valor_m2:
        granitos.find((g) => g.id === item.granito_id)?.valor_m2 || 0,
      subtotal: item.subtotal,
    })),
    valor_total: calcularTotal(),
    desconto,
    valor_final: calcularValorFinal(),
    validade,
    prazo_entrega: prazoEntrega,
    condicoes_pagamento: condicoesPagamento,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Novo Orçamento</h1>
          <p className="text-sm md:text-base text-zinc-400">Crie um novo orçamento para seu cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Dados do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-zinc-200">Nome / Razão Social *</Label>
                <Input
                  id="nome"
                  value={clienteData.nome}
                  onChange={(e) => setClienteData({ ...clienteData, nome: e.target.value })}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento" className="text-zinc-200">CPF / CNPJ</Label>
                <Input
                  id="documento"
                  value={clienteData.documento}
                  onChange={(e) => setClienteData({ ...clienteData, documento: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-zinc-200">Telefone</Label>
                <Input
                  id="telefone"
                  value={clienteData.telefone}
                  onChange={(e) => setClienteData({ ...clienteData, telefone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clienteData.email}
                  onChange={(e) => setClienteData({ ...clienteData, email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco" className="text-zinc-200">Endereço</Label>
                <Input
                  id="endereco"
                  value={clienteData.endereco}
                  onChange={(e) => setClienteData({ ...clienteData, endereco: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white">Itens do Orçamento</h2>
                <p className="text-xs text-zinc-500 mt-1">Medidas em metros (ex: 0.5 para 50cm, 1.2 para 1m e 20cm)</p>
              </div>
              <Button type="button" onClick={adicionarItem} className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Item {index + 1}</h3>
                    {itens.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removerItem(index)}
                        className="bg-zinc-700 border-zinc-600 text-red-400 hover:bg-zinc-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-zinc-200">Granito *</Label>
                      <Select
                        value={item.granito_id}
                        onValueChange={(value) => calcularItem(index, 'granito_id', value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {granitos.map((granito) => (
                            <SelectItem key={granito.id} value={granito.id} className="text-white">
                              {granito.nome} - {formatCurrency(granito.valor_m2)}/m²
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">M² *</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={item.m2_input || ''}
                        onChange={(e) => calcularItem(index, 'm2', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Ex: 2.5 ou 2,5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => calcularItem(index, 'quantidade', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-200">Subtotal</Label>
                      <div className="h-10 flex items-center px-3 bg-zinc-800 border border-zinc-700 rounded-md">
                        <span className="text-amber-600 font-semibold">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Condições
          </h2>

          <div className="space-y-4">
            <div>
              <Label className="text-zinc-200">
                Validade do Orçamento
              </Label>
              <Input
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label className="text-zinc-200">
                Prazo de Entrega
              </Label>
              <Input
                value={prazoEntrega}
                onChange={(e) => setPrazoEntrega(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label className="text-zinc-200">
                Condições de Pagamento
              </Label>
              <textarea
                value={condicoesPagamento}
                onChange={(e) =>
                  setCondicoesPagamento(e.target.value)
                }
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md p-3 min-h-[100px]"
              />
            </div>
          </div>
        </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Resumo Financeiro</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white font-semibold">{formatCurrency(calcularTotal())}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Label className="text-zinc-200">Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={desconto || ''}
                  onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  className="w-full sm:max-w-xs bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-lg md:text-xl text-white font-bold">Total</span>
                <span className="text-xl md:text-2xl text-amber-600 font-bold">
                  {formatCurrency(calcularValorFinal())}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              onClick={() => setPreviewOpen(true)}
              variant="outline"
              className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Preview
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </div>
        </form>

        <OrcamentoPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          data={previewData}
        />
      </div>
    </DashboardLayout>
  );
}
