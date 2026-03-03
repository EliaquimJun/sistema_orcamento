'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

interface Granito {
  id: string;
  nome: string;
  valor_m2: number;
  descricao: string;
  categoria: string;
  created_at: string;
}

export default function GranitosPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [granitos, setGranitos] = useState<Granito[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGranito, setEditingGranito] = useState<Granito | null>(null);
  const [deleteGranitoId, setDeleteGranitoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor_m2: '',
    descricao: '',
    categoria: '',
  });

  useEffect(() => {
    if (user) {
      loadGranitos();
    }
  }, [user]);

  const loadGranitos = async () => {
    try {
      const { data, error } = await supabase
        .from('granitos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGranitos(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar granitos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGranito) {
        const { error } = await supabase
          .from('granitos')
          .update({
            nome: formData.nome,
            valor_m2: parseFloat(formData.valor_m2),
            descricao: formData.descricao,
            categoria: formData.categoria,
          })
          .eq('id', editingGranito.id)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: 'Granito atualizado com sucesso!',
        });
      } else {
        const { error } = await supabase.from('granitos').insert({
          user_id: user?.id,
          nome: formData.nome,
          valor_m2: parseFloat(formData.valor_m2),
          descricao: formData.descricao,
          categoria: formData.categoria,
        });

        if (error) throw error;

        toast({
          title: 'Granito cadastrado com sucesso!',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadGranitos();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar granito',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (granito: Granito) => {
    setEditingGranito(granito);
    setFormData({
      nome: granito.nome,
      valor_m2: granito.valor_m2.toString(),
      descricao: granito.descricao,
      categoria: granito.categoria,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteGranitoId) return;

    try {
      const { error } = await supabase
        .from('granitos')
        .delete()
        .eq('id', deleteGranitoId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Granito excluído com sucesso!',
      });

      setDeleteDialogOpen(false);
      setDeleteGranitoId(null);
      loadGranitos();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir granito',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      valor_m2: '',
      descricao: '',
      categoria: '',
    });
    setEditingGranito(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Granitos</h1>
            <p className="text-sm md:text-base text-zinc-400">Gerencie o catálogo de produtos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Granito
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingGranito ? 'Editar Granito' : 'Novo Granito'}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Preencha os dados do granito
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-zinc-200">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_m2" className="text-zinc-200">Valor por m²</Label>
                  <Input
                    id="valor_m2"
                    type="number"
                    step="0.01"
                    value={formData.valor_m2}
                    onChange={(e) => setFormData({ ...formData, valor_m2: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-zinc-200">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ex: Importado, Nacional..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-zinc-200">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                    {editingGranito ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {granitos.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum granito cadastrado</h3>
              <p className="text-zinc-400 mb-6">Comece adicionando seu primeiro produto</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Granito
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {granitos.map((granito) => (
              <Card key={granito.id} className="bg-zinc-900/50 border-zinc-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{granito.nome}</h3>
                    <p className="text-sm text-amber-600">{granito.categoria || 'Geral'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(granito)}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDeleteGranitoId(granito.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="bg-zinc-800 border-zinc-700 text-red-400 hover:bg-zinc-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Valor por m²</span>
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(granito.valor_m2)}
                    </span>
                  </div>
                  {granito.descricao && (
                    <p className="text-sm text-zinc-400 mt-3">{granito.descricao}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Tem certeza que deseja excluir este granito? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
