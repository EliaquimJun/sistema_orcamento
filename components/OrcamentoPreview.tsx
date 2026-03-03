'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LOGO_GRAMARMORES } from '@/lib/pdf-assets';

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
      m2: number;
      area?: number;
      quantidade: number;
      valor_m2: number;
      subtotal: number;
    }>;
    valor_total: number;
    desconto: number;
    valor_final: number;
    validade?: string;
    prazo_entrega?: string;
    condicoes_pagamento?: string;
  };
}

export function OrcamentoPreview({
  open,
  onOpenChange,
  data,
}: OrcamentoPreviewProps) {

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">
            Preview do Orçamento
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white p-8 space-y-8">

          {/* HEADER */}
          <div className="bg-red-800 text-white p-6 rounded-lg flex items-start justify-between">

            <div className="flex items-center gap-5">
              <img
                src={LOGO_GRAMARMORES}
                alt="Gramarmores"
                className="w-24 h-auto object-contain"
              />

              <div>
                <h1 className="text-3xl font-bold">
                  Gramarmores
                </h1>
                <p className="text-red-100">
                  Marmoraria e Granitos
                </p>
                <p className="text-sm text-red-200 mt-1">
                  R. Trinta e Cinco, 41 - Jardim Olímpico
                  <br />
                  Montes Claros - MG
                  <br />
                  (38) 98823-6569 | marmorariagramarmores@hotmail.com
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-red-200">Orçamento</p>
              <p className="text-2xl font-bold">{data.cliente.nome}</p>
              <p className="text-sm text-red-200 mt-2">
                {format(new Date(), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* DADOS CLIENTE */}
          <div className="grid grid-cols-2 gap-6">

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Dados do Cliente
              </h3>

              <div className="bg-zinc-50 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-zinc-900">
                  {data.cliente.nome || '-'}
                </p>

                {data.cliente.documento && (
                  <p className="text-sm text-zinc-600">
                    CPF/CNPJ: {data.cliente.documento}
                  </p>
                )}

                {data.cliente.telefone && (
                  <p className="text-sm text-zinc-600">
                    Tel: {data.cliente.telefone}
                  </p>
                )}

                {data.cliente.email && (
                  <p className="text-sm text-zinc-600">
                    Email: {data.cliente.email}
                  </p>
                )}

                {data.cliente.endereco && (
                  <p className="text-sm text-zinc-600">
                    Endereço: {data.cliente.endereco}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2 uppercase tracking-wide">
                Informações do Orçamento
              </h3>

              <div className="bg-zinc-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-zinc-600">
                  <span className="font-semibold">Validade:</span>{' '}
                  {data.validade || '30 dias'}
                </p>

                <p className="text-sm text-zinc-600">
                  <span className="font-semibold">Prazo de Entrega:</span>{' '}
                  {data.prazo_entrega || 'A combinar'}
                </p>

                <div className="pt-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    Condições de Pagamento
                  </p>
                  <p className="text-sm text-zinc-600 whitespace-pre-line mt-1">
                    {data.condicoes_pagamento || 'A combinar'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TABELA */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wide">
              Itens do Orçamento
            </h3>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-red-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase">
                      Produto
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-white uppercase">
                      M²
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-white uppercase">
                      Qtd
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white uppercase">
                      Valor/m²
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200">
                  {data.itens.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm text-zinc-900">
                        {item.granito_nome}
                      </td>

                      <td className="px-4 py-3 text-sm text-center text-zinc-600">
                        {Number(item.area ?? item.m2 ?? 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-sm text-center text-zinc-600">
                        {item.quantidade}
                      </td>

                      <td className="px-4 py-3 text-sm text-right text-zinc-600">
                        {formatCurrency(item.valor_m2)}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-right text-zinc-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">

              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(data.valor_total)}
                </span>
              </div>

              {data.desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto</span>
                  <span className="font-semibold">
                    - {formatCurrency(data.desconto)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t-2 border-red-800">
                <span className="text-xl font-bold text-zinc-900">
                  Total
                </span>
                <span className="text-2xl font-bold text-black">
                  {formatCurrency(data.valor_final)}
                </span>
              </div>

            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}