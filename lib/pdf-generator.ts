import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrcamentoData {
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
  created_at?: string;
  validade?: string;
  prazo_entrega?: string;
}

export function generateOrcamentoPDF(data: OrcamentoData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAMARMORES', 20, 18);

  doc.setFontSize(10);
  doc.text('Marmoraria e Granitos', 20, 25);

  doc.setFontSize(16);
  doc.text(`Orçamento ${data.cliente.nome}`, pageWidth - 20, 18, { align: 'right' });

  doc.setFontSize(9);
  const dataFormatada = format(
    data.created_at ? new Date(data.created_at) : new Date(),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );
  doc.text(dataFormatada, pageWidth - 20, 25, { align: 'right' });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('R. Trinta e Cinco, 41 - Jardim Olímpico, Montes Claros - MG, 39406-538', 20, 30);
  doc.text('(38) 3216-6569 | contato@gramarmores.com.br', 20, 33);

  let yPos = 45;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 20, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${data.cliente.nome}`, 20, yPos);
  yPos += 5;

  if (data.cliente.documento) {
    doc.text(`CPF/CNPJ: ${data.cliente.documento}`, 20, yPos);
    yPos += 5;
  }

  if (data.cliente.telefone) {
    doc.text(`Telefone: ${data.cliente.telefone}`, 20, yPos);
    yPos += 5;
  }

  if (data.cliente.email) {
    doc.text(`Email: ${data.cliente.email}`, 20, yPos);
    yPos += 5;
  }

  if (data.cliente.endereco) {
    doc.text(`Endereço: ${data.cliente.endereco}`, 20, yPos);
    yPos += 5;
  }

  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS DO ORÇAMENTO', 20, yPos);
  yPos += 5;

  const tableData = data.itens.map((item) => [
    item.granito_nome,
    `${item.largura.toFixed(2)} x ${item.altura.toFixed(2)}`,
    item.area.toFixed(2),
    item.quantidade.toString(),
    formatCurrency(item.valor_m2),
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Produto', 'Medidas (m)', 'Área (m²)', 'Qtd', 'Valor/m²', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 37, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 35 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Subtotal: ${formatCurrency(data.valor_total)}`, pageWidth - 20, finalY, {
    align: 'right',
  });

  if (data.desconto > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`Desconto: -${formatCurrency(data.desconto)}`, pageWidth - 20, finalY + 5, {
      align: 'right',
    });
  }

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 60, finalY + (data.desconto > 0 ? 8 : 3), pageWidth - 20, finalY + (data.desconto > 0 ? 8 : 3));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(217, 119, 6);
  doc.text(`TOTAL: ${formatCurrency(data.valor_final)}`, pageWidth - 20, finalY + (data.desconto > 0 ? 15 : 10), {
    align: 'right',
  });

  const footerY = finalY + 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Condições de Pagamento:', 20, footerY);
  doc.text('• Entrada de 50% no ato da aprovação', 20, footerY + 4);
  doc.text('• 50% restante na entrega do produto', 20, footerY + 8);

  doc.text('Observações:', 110, footerY);
  doc.text(`• Validade: ${data.validade || '30 dias'}`, 110, footerY + 4);
  doc.text(`• Prazo de entrega: ${data.prazo_entrega || 'A combinar'}`, 110, footerY + 8);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, doc.internal.pageSize.getHeight() - 30, 90, doc.internal.pageSize.getHeight() - 30);
  doc.setFontSize(7);
  doc.text('Assinatura do Cliente', 20, doc.internal.pageSize.getHeight() - 25);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Nos colocamos a disposição para qualquer esclarecimento que se faz necessário.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 18,
    { align: 'center' }
  );

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Este documento é um orçamento e não representa uma nota fiscal.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}
