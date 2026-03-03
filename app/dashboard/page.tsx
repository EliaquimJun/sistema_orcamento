'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  FileText,
  CheckCircle,
  TrendingUp,
  Package,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface DashboardStats {
  totalFaturado: number;
  orcamentosMes: number;
  orcamentosAprovados: number;
  granitoMaisVendido: string;
  faturamentoMensal: { mes: string; valor: number }[];
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalFaturado: 0,
    orcamentosMes: 0,
    orcamentosAprovados: 0,
    granitoMaisVendido: 'N/A',
    faturamentoMensal: [],
  });

  const [loading, setLoading] = useState(false);

  const loadDashboardStats = useCallback(async (userId: string) => {
    try {
      setLoading(true);

      const now = new Date();
      const mesInicio = startOfMonth(now);
      const mesFim = endOfMonth(now);

      const { data: orcamentos, error } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(*, granitos(nome))')
        

      if (error) throw error;

      const lista = orcamentos || [];

      const totalFaturado = lista
        .filter((orc) => orc.status === 'Aprovado')
        .reduce((sum, orc) => sum + Number(orc.valor_final || 0), 0);

      const orcamentosMes = lista.filter((orc) => {
        const data = new Date(orc.created_at);
        return data >= mesInicio && data <= mesFim;
      }).length;

      const orcamentosAprovados = lista.filter(
        (orc) => orc.status === 'Aprovado'
      ).length;

      const granitoContagem: Record<string, number> = {};

      lista.forEach((orc) => {
        orc.itens_orcamento?.forEach((item: any) => {
          const nome = item.granitos?.nome || 'Desconhecido';
          granitoContagem[nome] =
            (granitoContagem[nome] || 0) + Number(item.quantidade || 0);
        });
      });

      const granitoMaisVendido =
        Object.entries(granitoContagem).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] || 'N/A';

      const mesesFaturamento: Record<string, number> = {};

      lista
        .filter((orc) => orc.status === 'Aprovado')
        .forEach((orc) => {
          const mes = format(new Date(orc.created_at), 'MMM/yy', {
            locale: ptBR,
          });
          mesesFaturamento[mes] =
            (mesesFaturamento[mes] || 0) + Number(orc.valor_final || 0);
        });

      const faturamentoMensal = Object.entries(mesesFaturamento)
        .map(([mes, valor]) => ({ mes, valor }))
        .slice(-6);

      setStats({
        totalFaturado,
        orcamentosMes,
        orcamentosAprovados,
        granitoMaisVendido,
        faturamentoMensal,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadDashboardStats(user.id);
  }, [user?.id, loadDashboardStats]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-400">Visão geral do seu negócio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Faturado"
            value={formatCurrency(stats.totalFaturado)}
            icon={DollarSign}
          />
          <StatCard
            title="Orçamentos do Mês"
            value={stats.orcamentosMes}
            icon={FileText}
          />
          <StatCard
            title="Orçamentos Aprovados"
            value={stats.orcamentosAprovados}
            icon={CheckCircle}
          />
          <StatCard
            title="Granito Mais Vendido"
            value={stats.granitoMaisVendido}
            icon={Package}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Faturamento Mensal
            </h3>

            {stats.faturamentoMensal.length > 0 ? (
              <div className="space-y-4">
                {stats.faturamentoMensal.map((item) => (
                  <div
                    key={item.mes}
                    className="flex items-center justify-between"
                  >
                    <span className="text-zinc-400 capitalize">
                      {item.mes}
                    </span>
                    <span className="text-white font-semibold">
                      {formatCurrency(item.valor)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-center py-8">
                Nenhum dado disponível
              </p>
            )}
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ações Rápidas
            </h3>

            <div className="space-y-3">
              <Link
                href="/orcamentos/novo"
                className="block p-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors"
              >
                + Novo Orçamento
              </Link>

              <Link
                href="/granitos"
                className="block p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors"
              >
                Gerenciar Granitos
              </Link>

              <Link
                href="/orcamentos"
                className="block p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors"
              >
                Ver Todos Orçamentos
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}