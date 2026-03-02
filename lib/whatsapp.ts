export function generateWhatsAppLink(
  telefone: string,
  numero: number,
  clienteNome: string,
  valorFinal: number,
  pdfUrl?: string
): string {
  const telefoneFormatado = telefone.replace(/\D/g, '');

  const telefoneComCodigo = telefoneFormatado.startsWith('55')
    ? telefoneFormatado
    : `55${telefoneFormatado}`;

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorFinal);

  let mensagem = `Olá *${clienteNome}*! 👋\n\n`;
  mensagem += `Segue o orçamento *#${numero}* solicitado.\n\n`;
  mensagem += `💰 *Valor Total:* ${valorFormatado}\n\n`;

  if (pdfUrl) {
    mensagem += `📄 *Orçamento Completo em PDF*\n`;
    mensagem += `Clique no link abaixo para visualizar e baixar:\n`;
    mensagem += `${pdfUrl}\n\n`;
    mensagem += `_O link é válido por 7 dias_\n\n`;
  }

  mensagem += `Estamos à disposição para esclarecer qualquer dúvida! 😊\n\n`;
  mensagem += `*Gramarmores* - Excelência em Mármores e Granitos`;

  const mensagemCodificada = encodeURIComponent(mensagem);

  return `https://wa.me/${telefoneComCodigo}?text=${mensagemCodificada}`;
}
