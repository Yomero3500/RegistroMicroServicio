// ============================================
// SERVICE: Email Service con Resend
// ============================================

const { Resend } = require('resend');

class EmailRepository {
  constructor() {
    // Inicializar Resend con la API key
    this.resend = new Resend(process.env.RESEND_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@piweb.com.mx';
  }

  /**
   * Enviar email de encuesta
   */
  async sendSurveyEmail({ student, survey, token, surveyUrl }) {
    try {
      // Verificar configuración
      if (!process.env.RESEND_KEY) {
        throw new Error('RESEND_KEY no está configurada en las variables de entorno');
      }

      const htmlContent = this._generateEmailHTML({
        student,
        survey,
        surveyUrl
      });

      const emailData = {
        from: `Sistema de Encuestas <${this.fromEmail}>`,
        to: [student.email],
        subject: `Nueva Encuesta: ${survey.titulo}`,
        html: htmlContent,
        // Agregar tags para tracking (opcional)
        tags: [
          {
            name: 'category',
            value: 'survey'
          },
          {
            name: 'survey_id',
            value: survey.id?.toString() || 'unknown'
          }
        ]
      };

      console.log(`📧 Enviando email a: ${student.email}`);
      console.log(`📝 Asunto: ${emailData.subject}`);

      const result = await this.resend.emails.send(emailData);

      console.log(`✅ Email enviado exitosamente a ${student.email}`);
      console.log(`📬 ID del mensaje: ${result.data?.id}`);
      
      return {
        success: true,
        messageId: result.data?.id,
        recipient: student.email,
        resendResponse: result.data
      };

    } catch (error) {
      console.error(`❌ Error enviando email a ${student.email}:`, error);
      
      // Manejar diferentes tipos de errores de Resend
      let errorMessage = error.message;
      
      if (error.message?.includes('Invalid API key')) {
        errorMessage = 'API key de Resend inválida o no configurada';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = `Dirección de email inválida: ${student.email}`;
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Límite de envío de emails excedido. Intenta nuevamente en unos minutos.';
      }
      
      return {
        success: false,
        error: errorMessage,
        recipient: student.email,
        originalError: error.message
      };
    }
  }

  /**
   * Enviar múltiples emails de encuesta (batch)
   */
  async sendBatchSurveyEmails(emailsData) {
    const results = [];
    const batchSize = 10; // Procesar de 10 en 10 para evitar rate limits
    
    console.log(`📨 Enviando ${emailsData.length} emails en lotes de ${batchSize}`);

    for (let i = 0; i < emailsData.length; i += batchSize) {
      const batch = emailsData.slice(i, i + batchSize);
      
      console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(emailsData.length/batchSize)}`);

      // Procesar lote en paralelo
      const batchPromises = batch.map(emailData => 
        this.sendSurveyEmail(emailData)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pausa pequeña entre lotes para evitar rate limiting
      if (i + batchSize < emailsData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📊 Resumen del envío masivo:`);
    console.log(`   ✅ Exitosos: ${successful}`);
    console.log(`   ❌ Fallidos: ${failed}`);
    console.log(`   📈 Total: ${results.length}`);

    return {
      total: results.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Enviar email de notificación personalizado
   */
  async sendCustomEmail({ to, subject, htmlContent, tags = [] }) {
    try {
      const emailData = {
        from: `Sistema Educativo <${this.fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: htmlContent,
        tags: [
          { name: 'category', value: 'notification' },
          ...tags
        ]
      };

      const result = await this.resend.emails.send(emailData);

      console.log(`✅ Email personalizado enviado a: ${to}`);
      
      return {
        success: true,
        messageId: result.data?.id,
        recipient: to
      };

    } catch (error) {
      console.error(`❌ Error enviando email personalizado:`, error);
      
      return {
        success: false,
        error: error.message,
        recipient: to
      };
    }
  }

  /**
   * Verificar el estado de un email enviado
   */
  async getEmailStatus(emailId) {
    try {
      const email = await this.resend.emails.get(emailId);
      
      return {
        success: true,
        data: email.data
      };
    } catch (error) {
      console.error(`❌ Error obteniendo estado del email:`, error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar la configuración de Resend
   */
  async verifyConnection() {
    try {
      if (!process.env.RESEND_KEY) {
        console.error('❌ RESEND_KEY no está configurada');
        return false;
      }

      if (!this.fromEmail) {
        console.error('❌ EMAIL_FROM no está configurado');
        return false;
      }

      // Intentar obtener información de la cuenta
      const domains = await this.resend.domains.list();
      
      console.log('✅ Conexión con Resend verificada exitosamente');
      console.log(`📧 Email configurado: ${this.fromEmail}`);
      console.log(`🌐 Dominios disponibles: ${domains.data?.data?.length || 0}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error al verificar conexión con Resend:', error.message);
      
      if (error.message?.includes('Invalid API key')) {
        console.error('   🔑 Verifica que RESEND_KEY sea correcta');
      }
      
      return false;
    }
  }

  /**
   * Obtener estadísticas de emails
   */
  async getEmailStats() {
    try {
      // Nota: Resend no tiene un endpoint de estadísticas directo,
      // pero podemos implementar tracking básico
      console.log('📊 Estadísticas de email disponibles a través del dashboard de Resend');
      
      return {
        success: true,
        message: 'Revisa el dashboard de Resend para estadísticas detalladas',
        dashboardUrl: 'https://resend.com/emails'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Genera el HTML del email (mismo que antes)
   * @private
   */
  _generateEmailHTML({ student, survey, surveyUrl }) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Encuesta</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f5;
    }
    .email-wrapper {
      width: 100%;
      padding: 20px;
      background-color: #f4f4f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #475569;
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .survey-card {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .survey-card h2 {
      font-size: 20px;
      color: #1e293b;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .survey-card p {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    .info-box {
      background-color: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .info-box-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
      font-size: 15px;
    }
    .info-list {
      list-style: none;
      padding: 0;
    }
    .info-list li {
      color: #78350f;
      font-size: 14px;
      padding: 4px 0;
      padding-left: 20px;
      position: relative;
    }
    .info-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #f59e0b;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e2e8f0, transparent);
      margin: 32px 0;
    }
    .student-info {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
    }
    .student-info p {
      font-size: 14px;
      color: #64748b;
      margin: 4px 0;
    }
    .student-info strong {
      color: #334155;
    }
    .link-box {
      background-color: #f1f5f9;
      border: 1px dashed #cbd5e1;
      padding: 12px;
      border-radius: 6px;
      margin-top: 20px;
      word-break: break-all;
    }
    .link-box p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .link-box code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #475569;
      background-color: #ffffff;
      padding: 8px 12px;
      border-radius: 4px;
      display: block;
      overflow-x: auto;
    }
    .footer {
      background-color: #1e293b;
      color: #94a3b8;
      padding: 30px;
      text-align: center;
    }
    .footer p {
      font-size: 13px;
      margin: 8px 0;
      line-height: 1.6;
    }
    .footer-link {
      color: #60a5fa;
      text-decoration: none;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
    .resend-footer {
      background-color: #f8fafc;
      padding: 16px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .resend-footer p {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 10px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .cta-button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <h1>Nueva Encuesta Disponible</h1>
        <p>Tu opinión es importante para nosotros</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <p class="greeting">Hola ${student.nombre},</p>
        
        <p class="message">
          Se te ha asignado una nueva encuesta que requiere tu atención. 
          Tu participación es muy valiosa y nos ayuda a mejorar continuamente.
        </p>
        
        <!-- Survey Card -->
        <div class="survey-card">
          <h2>${survey.titulo}</h2>
          <p>${survey.descripcion || 'Por favor, completa esta encuesta a la brevedad posible. Tus respuestas serán tratadas de forma confidencial.'}</p>
        </div>

        <!-- CTA Button -->
        <div class="button-container">
          <a href="${surveyUrl}" class="cta-button">
            Responder Encuesta Ahora
          </a>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <p class="info-box-title">Información Importante:</p>
          <ul class="info-list">
            <li>Este enlace es único y personal, no lo compartas</li>
            <li>Solo podrás responder la encuesta una vez</li>
            <li>El enlace expirará el ${expirationDate.toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
            <li>Tus respuestas son confidenciales</li>
          </ul>
        </div>

        <div class="divider"></div>

        <!-- Student Info -->
        <div class="student-info">
          <p><strong>Datos de tu participación:</strong></p>
          <p>Matrícula: ${student.matricula || 'N/A'}</p>
          <p>Correo electrónico: ${student.email}</p>
        </div>

        <!-- Alternative Link -->
        <div class="link-box">
          <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
          <code>${surveyUrl}</code>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
        <p>
          Si necesitas ayuda, contacta a 
          <a href="mailto:soporte@piweb.com.mx" class="footer-link">soporte@piweb.com.mx</a>
        </p>
        <p style="margin-top: 16px; opacity: 0.8;">
          &copy; ${new Date().getFullYear()} Sistema de Encuestas. Todos los derechos reservados.
        </p>
      </div>
      
      <!-- Resend Footer -->
      <div class="resend-footer">
        <p>📧 Enviado con Resend</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generar email simple para testing
   */
  generateTestEmail(testData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email de Prueba</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
    <h1 style="color: #333;">🧪 Email de Prueba</h1>
    <p>Este es un email de prueba enviado con Resend.</p>
    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3>Datos de prueba:</h3>
      <ul>
        <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        <li><strong>Datos:</strong> ${JSON.stringify(testData, null, 2)}</li>
      </ul>
    </div>
    <p style="color: #666; font-size: 14px;">
      ✅ Si recibes este email, la configuración de Resend está funcionando correctamente.
    </p>
  </div>
</body>
</html>
    `;
  }
}

module.exports = EmailRepository;