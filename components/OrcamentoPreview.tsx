'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Gem } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrcamentoPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    numero: number;
    cliente: {
      nome: string;
      documento: string;
      telefone: string;
      email: string;
      endereco: string;
    };
    itens: Array<{
      granito_nome: string;
      largura: number;
      altura: number;
      quantidade: number;
      area: number;
      valor_m2: number;
      subtotal: number;
    }>;
    valor_total: number;
    desconto: number;
    valor_final: number;
    validade?: string;
    prazo_entrega?: string;
  };
}

export function OrcamentoPreview({ open, onOpenChange, data }: OrcamentoPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">Preview do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-8 space-y-6">
          <div className="flex items-start justify-between border-b-2 border-amber-600 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center">
                <Gem className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">Gramarmores</h1>
                <p className="text-zinc-600">Marmoraria e Granitos</p>
                <p className="text-sm text-zinc-500 mt-1">
                  R. Trinta e Cinco, 41 - Jardim Olímpico, Montes Claros - MG, 39406-538<br />
                  (38) 3216-6569 | contato@gramarmores.com.br
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-600">Orçamento</p>
              <p className="text-2xl font-bold text-zinc-900">{data.cliente.nome || '000'}</p>
              <p className="text-sm text-zinc-500 mt-1">
                {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Dados do Cliente
              </h3>
              <div className="bg-zinc-50 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-zinc-900">{data.cliente.nome || 'Nome do Cliente'}</p>
                {data.cliente.documento && (
                  <p className="text-sm text-zinc-600">CPF/CNPJ: {data.cliente.documento}</p>
                )}
                {data.cliente.telefone && (
                  <p className="text-sm text-zinc-600">Tel: {data.cliente.telefone}</p>
                )}
                {data.cliente.email && (
                  <p className="text-sm text-zinc-600">Email: {data.cliente.email}</p>
                )}
                {data.cliente.endereco && (
                  <p className="text-sm text-zinc-600">Endereço: {data.cliente.endereco}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Informações do Orçamento
              </h3>
              <div className="bg-zinc-50 p-4 rounded-lg space-y-1">
                <p className="text-sm text-zinc-600">
                  <span className="font-semibold">Validade:</span> {data.validade || '30 dias'}
                </p>
                <p className="text-sm text-zinc-600">
                  <span className="font-semibold">Prazo de Entrega:</span> {data.prazo_entrega || 'A combinar'}
                </p>
                <p className="text-sm text-zinc-600">
                  <span className="font-semibold">Forma de Pagamento:</span> A combinar
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
              Itens do Orçamento
            </h3>
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Produto
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Medidas (m)
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Área (m²)
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Qtd
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Valor/m²
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {data.itens.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm text-zinc-900">
                        {item.granito_nome || 'Selecione um granito'}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 text-center">
                        {item.largura.toFixed(2)} x {item.altura.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 text-center">
                        {item.area.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 text-center">
                        {item.quantidade}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 text-right">
                        {formatCurrency(item.valor_m2 || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-zinc-900 text-right">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(data.valor_total)}</span>
              </div>
              {data.desconto > 0 && (
                <div className="flex items-center justify-between text-red-600">
                  <span>Desconto</span>
                  <span className="font-semibold">- {formatCurrency(data.desconto)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-900">
                <span className="text-xl font-bold text-zinc-900">Total</span>
                <span className="text-2xl font-bold text-amber-600">
                  {formatCurrency(data.valor_final)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-zinc-200 pt-6 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-zinc-600 mb-2">Condições de Pagamento:</p>
                <p className="text-xs text-zinc-500">
                  • Entrada de 50% no ato da aprovação<br />
                  • 50% restante na entrega do produto<br />
                  • Formas: Dinheiro, PIX, Cartão ou Boleto
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 mb-2">Observações:</p>
                <p className="text-xs text-zinc-500">
                  • Medidas podem ter variação de até 2%<br />
                  • Instalação não incluída neste orçamento
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200">
              <p className="text-sm text-zinc-600 mb-4">Assinatura do Cliente:</p>
              <div className="border-b border-zinc-400 w-80"></div>
              <p className="text-xs text-zinc-500 mt-2">
                {data.cliente.nome || 'Nome do Cliente'}
              </p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-zinc-200 space-y-3">
            <p className="text-sm text-zinc-600">
              Nos colocamos a disposição para qualquer esclarecimento que se faz necessário.
            </p>
            <p className="text-xs text-zinc-500">
              Este documento é um orçamento e não representa uma nota fiscal.<br />
              Gramarmores - Excelência em Mármores e Granitos
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
