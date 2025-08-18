const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      // Configuración de Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !authToken || !this.fromNumber) {
        console.warn('⚠️  Credenciales de Twilio no configuradas. El servicio SMS no estará disponible.');
        return;
      }

      this.client = twilio(accountSid, authToken);
      console.log('✅ Servicio SMS inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio SMS:', error);
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.client) {
        throw new Error('Cliente de Twilio no inicializado');
      }

      if (!this.fromNumber) {
        throw new Error('Número de origen de Twilio no configurado');
      }

      // Validar formato del número de teléfono
      const phoneNumber = this.formatPhoneNumber(to);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        response: result
      };
    } catch (error) {
      console.error('Error enviando SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendSMSWithTemplate(to, template, variables) {
    try {
      // Procesar la plantilla con las variables
      const mensajeProcesado = this.processTemplate(template.contenido, variables);
      return await this.sendSMS(to, mensajeProcesado);
    } catch (error) {
      console.error('Error enviando SMS con plantilla:', error);
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

  formatPhoneNumber(phoneNumber) {
    // Asegurar que el número tenga el formato internacional correcto
    let formatted = phoneNumber.replace(/\D/g, ''); // Remover caracteres no numéricos
    
    // Si no empieza con +, agregar código de país (Argentina por defecto)
    if (!phoneNumber.startsWith('+')) {
      if (formatted.startsWith('0')) {
        formatted = formatted.substring(1); // Remover 0 inicial
      }
      if (!formatted.startsWith('54')) {
        formatted = '54' + formatted; // Agregar código de Argentina
      }
      formatted = '+' + formatted;
    }
    
    return formatted;
  }

  async verifyConnection() {
    try {
      if (!this.client) {
        return { success: false, error: 'Cliente de Twilio no inicializado' };
      }

      // Intentar obtener información de la cuenta para verificar la conexión
      const account = await this.client.api.accounts(this.client.accountSid).fetch();
      
      return { 
        success: true, 
        message: 'Conexión a Twilio verificada correctamente',
        accountName: account.friendlyName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Método para enviar SMS de confirmación de cita
  async sendConfirmacionCita(pacienteTelefono, pacienteNombre, fecha, hora, medicoNombre, especialidad) {
    const message = `Hola ${pacienteNombre}! Su cita médica ha sido confirmada para el ${fecha} a las ${hora} con Dr. ${medicoNombre} (${especialidad}). Llegue 15 min antes. Centro Médico.`;
    return await this.sendSMS(pacienteTelefono, message);
  }

  // Método para enviar SMS de modificación de cita
  async sendModificacionCita(pacienteTelefono, pacienteNombre, fechaNueva, horaNueva, medicoNombre) {
    const message = `Hola ${pacienteNombre}! Su cita médica ha sido modificada para el ${fechaNueva} a las ${horaNueva} con Dr. ${medicoNombre}. Disculpe las molestias. Centro Médico.`;
    return await this.sendSMS(pacienteTelefono, message);
  }

  // Método para enviar SMS de cancelación de cita
  async sendCancelacionCita(pacienteTelefono, pacienteNombre, fecha, hora, medicoNombre) {
    const message = `Hola ${pacienteNombre}! Su cita médica del ${fecha} a las ${hora} con Dr. ${medicoNombre} ha sido cancelada. Para reagendar contáctenos. Centro Médico.`;
    return await this.sendSMS(pacienteTelefono, message);
  }

  // Método para enviar recordatorio de cita
  async sendRecordatorioCita(pacienteTelefono, pacienteNombre, fecha, hora, medicoNombre, especialidad) {
    const message = `Hola ${pacienteNombre}! Recordatorio: mañana tiene cita a las ${hora} con Dr. ${medicoNombre} (${especialidad}). Llegue 15 min antes. Centro Médico.`;
    return await this.sendSMS(pacienteTelefono, message);
  }
}

module.exports = SMSService;
