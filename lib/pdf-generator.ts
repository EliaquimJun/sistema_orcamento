import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LOGO_GRAMARMORES } from '@/lib/pdf-assets'

export function generateOrcamentoPDF(data: any): Blob {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  /* =========================
     HEADER
  ========================= */

  doc.setFillColor(122, 18, 18)
  doc.rect(0, 0, pageWidth, 45, 'F')

  doc.addImage(LOGO_GRAMARMORES, 'JPEG', 15, 10, 28, 20)

  doc.setTextColor(255, 255, 255)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('GRAMARMORES', 50, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Marmoraria e Granitos', 50, 24)

  doc.setFontSize(8)
  doc.text('CNPJ:40.905.989/0001-05', 50, 29)
  doc.text('R. Trinta e Cinco, 41 - Jardim Olímpico', 50, 33)
  doc.text('Montes Claros - MG | (38) 98823-6569', 50, 37)
  doc.text('marmorariagramarmores@hotmail.com', 50, 41)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Orçamento Gramarmores`, pageWidth - 15, 20, { align: 'right' })

  const dataFormatada = format(
    data.created_at ? new Date(data.created_at) : new Date(),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(dataFormatada, pageWidth - 15, 28, { align: 'right' })

  /* =========================
     DADOS DO CLIENTE (BOX PROFISSIONAL)
  ========================= */

  let yPos = 60

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('DADOS DO CLIENTE', 15, yPos)

  yPos += 6

  // Fundo leve
  doc.setFillColor(245, 245, 245)
  doc.rect(15, yPos, pageWidth - 30, 26, 'F')

  doc.setFontSize(9)

  const leftX = 20
  const rightX = pageWidth / 2 + 5
  let lineY = yPos + 8

  // ===== COLUNA ESQUERDA =====
  doc.setFont('helvetica', 'bold')
  doc.text('Nome: ', leftX, lineY)
  doc.setFont('helvetica', 'normal')
  const nomeLines = doc.splitTextToSize(data.cliente.nome || '-', 60)
  doc.text(nomeLines, leftX + 14, lineY)

  lineY += 6
  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ: ', leftX, lineY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.cliente.documento || '-', leftX + 22, lineY)

  lineY += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Telefone: ', leftX, lineY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.cliente.telefone || '-', leftX + 20, lineY)


  // ===== COLUNA DIREITA =====
  lineY = yPos + 8

  doc.setFont('helvetica', 'bold')
  doc.text('Email: ', rightX, lineY)
  doc.setFont('helvetica', 'normal')
  doc.text(data.cliente.email || '-', rightX + 14, lineY)

  lineY += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Endereço: ', rightX, lineY)
  doc.setFont('helvetica', 'normal')
  const enderecoLines = doc.splitTextToSize(data.cliente.endereco || '-', 60)
  doc.text(enderecoLines, rightX + 22, lineY)

  yPos += 36


  /* =========================
     TABELA
  ========================= */

  const tableData = data.itens.map((item: any) => [
  item.granito_nome,
 (item.m2 ?? item.area ?? 0).toFixed(2),
  item.quantidade.toString(),
  formatCurrency(item.valor_m2),
  formatCurrency(item.subtotal),
])

  autoTable(doc, {
    startY: yPos,
    head: [['Produto', 'M²', 'Qtd', 'Valor/m²', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10

  /* =========================
     VALORES
  ========================= */

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  doc.text(
    `Subtotal: ${formatCurrency(data.valor_total)}`,
    pageWidth - 15,
    finalY,
    { align: 'right' }
  )

  if (data.desconto > 0) {
    doc.setTextColor(200, 0, 0)
    doc.text(
      `Desconto: -${formatCurrency(data.desconto)}`,
      pageWidth - 15,
      finalY + 6,
      { align: 'right' }
    )
  }

  doc.setDrawColor(180, 180, 180)
  doc.line(pageWidth - 60, finalY + 10, pageWidth - 15, finalY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)

  doc.text(
    `TOTAL: ${formatCurrency(data.valor_final)}`,
    pageWidth - 15,
    finalY + 18,
    { align: 'right' }
  )

  /* =========================
     CONDIÇÕES + OBSERVAÇÕES MAIS EMBAIXO
  ========================= */

  const footerBase = pageHeight - 60

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)

  doc.text('Condições de Pagamento', 15, footerBase)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('• Entrada de 50% no ato da aprovação', 15, footerBase + 6)
  doc.text('• 50% restante na entrega', 15, footerBase + 11)

  doc.setFont('helvetica', 'bold')
  doc.text('Observações', pageWidth / 2, footerBase)

  doc.setFont('helvetica', 'normal')
  doc.text(`• Validade: ${data.validade || '30 dias'}`, pageWidth / 2, footerBase + 6)
  doc.text(
    `• Prazo de entrega: ${data.prazo_entrega || 'A combinar'}`,
    pageWidth / 2,
    footerBase + 11
  )

  doc.line(15, pageHeight - 25, 90, pageHeight - 25)

  doc.setFontSize(7)
  doc.text('Assinatura do Cliente', 15, pageHeight - 20)

  doc.setFontSize(7)
  doc.text(
    'Este documento é um orçamento e não representa nota fiscal.',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  return doc.output('blob')
}