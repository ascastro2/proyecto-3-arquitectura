const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configuración del transportador de email
    // En producción, usar variables de entorno para credenciales
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER || 'tu-email@gmail.com',
        pass: process.env.SMTP_PASS || 'tu-password-app'
      }
    });
  }

  async sendEmail(to, subject, content, from = null) {
    try {
      if (!this.transporter) {
        throw new Error('Transportador de email no inicializado');
      }

      const mailOptions = {
        from: from || process.env.SMTP_FROM || 'Centro Médico <noreply@centromedico.com>',
        to: to,
        subject: subject,
        html: content,
        text: this.stripHtml(content) // Versión de texto plano
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendEmailWithTemplate(to, template, variables) {
    try {
      // Procesar la plantilla con las variables
      const contenidoProcesado = this.processTemplate(template.contenido, variables);
      const asuntoProcesado = template.asunto ? this.processTemplate(template.asunto, variables) : '';

      return await this.sendEmail(to, asuntoProcesado, contenidoProcesado);
    } catch (error) {
      console.error('Error enviando email con plantilla:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  processTemplate(template, variables) {
    let processedTemplate = template;
    
    // Reemplazar variables en la plantilla
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, variables[key] || '');
    });

    return processedTemplate;
  }

  stripHtml(html) {
    // Convertir HTML a texto plano básico
    return html
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/&nbsp;/g, ' ') // Reemplazar espacios HTML
      .replace(/&amp;/g, '&') // Reemplazar ampersand HTML
      .replace(/&lt;/g, '<') // Reemplazar menor que HTML
      .replace(/&gt;/g, '>') // Reemplazar mayor que HTML
      .replace(/&quot;/g, '"') // Reemplazar comillas HTML
      .trim();
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        return { success: false, error: 'Transportador no inicializado' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Conexión SMTP verificada correctamente' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Método para enviar email de confirmación de cita
  async sendConfirmacionCita(pacienteEmail, pacienteNombre, fecha, hora, medicoNombre, especialidad) {
    const subject = 'Confirmación de Cita Médica';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Confirmación de Cita Médica</h2>
        <p>Estimado/a <strong>${pacienteNombre}</strong>,</p>
        <p>Su cita médica ha sido confirmada exitosamente.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Detalles de la Cita</h3>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Médico:</strong> Dr. ${medicoNombre}</p>
          <p><strong>Especialidad:</strong> ${especialidad}</p>
        </div>
        
        <p>Por favor, llegue 15 minutos antes de su hora programada.</p>
        <p>Si necesita cancelar o reprogramar su cita, contáctenos con anticipación.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Centro Médico</strong></p>
      </div>
    `;

    return await this.sendEmail(pacienteEmail, subject, content);
  }

  // Método para enviar email de modificación de cita
  async sendModificacionCita(pacienteEmail, pacienteNombre, fechaAnterior, horaAnterior, fechaNueva, horaNueva, medicoNombre) {
    const subject = 'Modificación de Cita Médica';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e67e22;">Modificación de Cita Médica</h2>
        <p>Estimado/a <strong>${pacienteNombre}</strong>,</p>
        <p>Su cita médica ha sido modificada.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Cambios Realizados</h3>
          <p><strong>Fecha Anterior:</strong> ${fechaAnterior} a las ${horaAnterior}</p>
          <p><strong>Nueva Fecha:</strong> ${fechaNueva} a las ${horaNueva}</p>
          <p><strong>Médico:</strong> Dr. ${medicoNombre}</p>
        </div>
        
        <p>Disculpe las molestias ocasionadas.</p>
        <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Centro Médico</strong></p>
      </div>
    `;

    return await this.sendEmail(pacienteEmail, subject, content);
  }

  // Método para enviar email de cancelación de cita
  async sendCancelacionCita(pacienteEmail, pacienteNombre, fecha, hora, medicoNombre) {
    const subject = 'Cancelación de Cita Médica';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Cancelación de Cita Médica</h2>
        <p>Estimado/a <strong>${pacienteNombre}</strong>,</p>
        <p>Su cita médica ha sido cancelada.</p>
        
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #721c24; margin-top: 0;">Cita Cancelada</h3>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Médico:</strong> Dr. ${medicoNombre}</p>
        </div>
        
        <p>Para reagendar su cita, por favor contáctenos.</p>
        <p>Gracias por su comprensión.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Centro Médico</strong></p>
      </div>
    `;

    return await this.sendEmail(pacienteEmail, subject, content);
  }

  // Método para enviar recordatorio de cita
  async sendRecordatorioCita(pacienteEmail, pacienteNombre, fecha, hora, medicoNombre, especialidad) {
    const subject = 'Recordatorio de Cita Médica - Mañana';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Recordatorio de Cita Médica</h2>
        <p>Estimado/a <strong>${pacienteNombre}</strong>,</p>
        <p>Le recordamos que mañana tiene una cita médica programada.</p>
        
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c5460; margin-top: 0;">Detalles de la Cita</h3>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Médico:</strong> Dr. ${medicoNombre}</p>
          <p><strong>Especialidad:</strong> ${especialidad}</p>
        </div>
        
        <p>Por favor, llegue 15 minutos antes de su hora programada.</p>
        <p>Si necesita cancelar o reprogramar su cita, contáctenos inmediatamente.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Centro Médico</strong></p>
      </div>
    `;

    return await this.sendEmail(pacienteEmail, subject, content);
  }
}

module.exports = EmailService;
