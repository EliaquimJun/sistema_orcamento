import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  clientName: string;
  orcamentoNumber: number;
  pdfUrl: string;
  valorTotal: number;
  validade?: string;
  prazoEntrega?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, clientName, orcamentoNumber, pdfUrl, valorTotal, validade, prazoEntrega }: EmailRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };

    let pdfContent = null;
    if (pdfUrl) {
      const pdfResponse = await fetch(pdfUrl);
      if (pdfResponse.ok) {
        const arrayBuffer = await pdfResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        pdfContent = base64;
      }
    }

    const emailData: any = {
      from: "Gramarmores <orcamentos@gramarmores.com.br>",
      to: [to],
      subject: `Orçamento #${orcamentoNumber} - Gramarmores`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .value {
                font-size: 24px;
                font-weight: bold;
                color: #d97706;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 12px;
              }
              .button {
                display: inline-block;
                background: #d97706;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Gramarmores</h1>
              <p>Marmoraria e Granitos</p>
            </div>
            <div class="content">
              <p>Olá <strong>${clientName}</strong>,</p>

              <p>Segue em anexo o orçamento <strong>#${orcamentoNumber}</strong> conforme solicitado.</p>

              <div class="value">
                Valor Total: ${formatCurrency(valorTotal)}
              </div>

              <p><strong>Condições de Pagamento:</strong></p>
              <ul>
                <li>Entrada de 50% no ato da aprovação</li>
                <li>50% restante na entrega do produto</li>
                <li>Formas: Dinheiro, PIX, Cartão ou Boleto</li>
              </ul>

              <p><strong>Observações Importantes:</strong></p>
              <ul>
                <li>Validade do orçamento: ${validade || '30 dias'}</li>
                <li>Prazo de entrega: ${prazoEntrega || 'A combinar'}</li>
                <li>Valores sujeitos a alteração sem aviso prévio</li>
              </ul>

              <p>Nos colocamos a disposição para qualquer esclarecimento que se faz necessário.</p>

              <p>Atenciosamente,<br>
              <strong>Equipe Gramarmores</strong></p>

              <div class="footer">
                <p>Rua Exemplo, 123 - Centro</p>
                <p>(00) 0000-0000 | contato@gramarmores.com.br</p>
                <p style="margin-top: 10px; font-size: 11px;">
                  Este é um e-mail automático, por favor não responda.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    if (pdfContent) {
      emailData.attachments = [
        {
          filename: `Orcamento-${orcamentoNumber}.pdf`,
          content: pdfContent,
        },
      ];
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Erro ao enviar email: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
