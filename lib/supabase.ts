import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      granitos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          valor_m2: number;
          descricao: string;
          categoria: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          valor_m2: number;
          descricao?: string;
          categoria?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          valor_m2?: number;
          descricao?: string;
          categoria?: string;
          created_at?: string;
        };
      };
      orcamentos: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          numero: number;
          cliente_nome: string;
          cliente_documento?: string;
          cliente_telefone?: string;
          cliente_email?: string;
          cliente_endereco?: string;
          valor_total?: number;
          desconto?: number;
          valor_final?: number;
          pdf_path?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          numero?: number;
          cliente_nome?: string;
          cliente_documento?: string;
          cliente_telefone?: string;
          cliente_email?: string;
          cliente_endereco?: string;
          valor_total?: number;
          desconto?: number;
          valor_final?: number;
          pdf_path?: string;
          status?: string;
          created_at?: string;
        };
      };
      itens_orcamento: {
        Row: {
          id: string;
          orcamento_id: string;
          granito_id: string;
          largura: number;
          altura: number;
          quantidade: number;
          area: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          orcamento_id: string;
          granito_id: string;
          largura: number;
          altura: number;
          quantidade?: number;
          area: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          orcamento_id?: string;
          granito_id?: string;
          largura?: number;
          altura?: number;
          quantidade?: number;
          area?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
    };
  };
};
