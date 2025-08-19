const mysql = require('mysql2/promise');

class NotificacionRepository {
  constructor() {
    this.pool = null;
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'notificaciones-db',
        user: process.env.DB_USER || 'notificaciones_user',
        password: process.env.DB_PASSWORD || 'notificaciones_pass',
        database: process.env.DB_NAME || 'notificaciones_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        port: process.env.DB_PORT || 3306
      });

      // Verificar conexión
      await this.pool.getConnection();
      console.log('✅ Conexión a MySQL establecida correctamente');
    } catch (error) {
      console.error('❌ Error conectando a MySQL:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones ORDER BY fecha_envio DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByTipo(tipo) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE tipo = ? ORDER BY fecha_envio DESC',
        [tipo]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByTipo:', error);
      throw error;
    }
  }

  async findByEstado(estado) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE estado = ? ORDER BY fecha_envio DESC',
        [estado]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByEstado:', error);
      throw error;
    }
  }

  async findByDestinatario(destinatario) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE destinatario = ? ORDER BY fecha_envio DESC',
        [destinatario]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByDestinatario:', error);
      throw error;
    }
  }

  async findByFechaRango(fechaInicio, fechaFin) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE DATE(fecha_envio) BETWEEN ? AND ? ORDER BY fecha_envio DESC',
        [fechaInicio, fechaFin]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByFechaRango:', error);
      throw error;
    }
  }

  async create(notificacionData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO notificaciones (tipo, destinatario, asunto, contenido, canal, estado, fecha_envio, fecha_entrega, intentos, error_mensaje) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notificacionData.tipo,
          notificacionData.destinatario,
          notificacionData.asunto,
          notificacionData.contenido,
          notificacionData.canal,
          notificacionData.estado || 'PENDIENTE',
          notificacionData.fechaEnvio || new Date(),
          notificacionData.fechaEntrega || null,
          notificacionData.intentos || 0,
          notificacionData.errorMensaje || null
        ]
      );
      
      return { id: result.insertId, ...notificacionData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, notificacionData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE notificaciones 
         SET tipo = ?, destinatario = ?, asunto = ?, contenido = ?, canal = ?, 
             estado = ?, fecha_envio = ?, fecha_entrega = ?, intentos = ?, 
             error_mensaje = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          notificacionData.tipo,
          notificacionData.destinatario,
          notificacionData.asunto,
          notificacionData.contenido,
          notificacionData.canal,
          notificacionData.estado,
          notificacionData.fechaEnvio,
          notificacionData.fechaEntrega,
          notificacionData.intentos,
          notificacionData.errorMensaje,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...notificacionData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async updateEstado(id, estado, fechaEntrega = null, errorMensaje = null) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE notificaciones SET estado = ?, fecha_entrega = ?, error_mensaje = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [estado, fechaEntrega, errorMensaje, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, estado, fechaEntrega, errorMensaje };
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  }

  async incrementarIntentos(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE notificaciones SET intentos = intentos + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, intentos: 'incrementado' };
    } catch (error) {
      console.error('Error en incrementarIntentos:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM notificaciones WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE asunto LIKE ? OR contenido LIKE ? ORDER BY fecha_envio DESC',
        [searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  async getEstadisticas() {
    try {
      const [rows] = await this.pool.execute(
        `SELECT 
           tipo,
           canal,
           estado,
           COUNT(*) as cantidad,
           DATE(fecha_envio) as fecha
         FROM notificaciones 
         WHERE fecha_envio >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY tipo, canal, estado, DATE(fecha_envio)
         ORDER BY fecha DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      throw error;
    }
  }

  async getPendientes() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM notificaciones WHERE estado = "PENDIENTE" AND intentos < 3 ORDER BY fecha_envio ASC'
      );
      return rows;
    } catch (error) {
      console.error('Error en getPendientes:', error);
      throw error;
    }
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async closeConnection() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = NotificacionRepository;
