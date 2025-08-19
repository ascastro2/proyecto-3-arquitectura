const mysql = require('mysql2/promise');

class HistorialCambioRepository {
  constructor() {
    this.pool = null;
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'agendamiento-db',
        user: process.env.DB_USER || 'agendamiento_user',
        password: process.env.DB_PASSWORD || 'agendamiento_pass',
        database: process.env.DB_NAME || 'agendamiento_db',
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

  async findByTurnoId(turnoId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM historial_cambios WHERE turno_id = ? ORDER BY fecha_cambio DESC',
        [turnoId]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByTurnoId:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM historial_cambios WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(historialData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO historial_cambios (turno_id, tipo_cambio, descripcion, usuario_id, datos_anteriores, datos_nuevos) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          historialData.turnoId,
          historialData.tipoCambio,
          historialData.descripcion,
          historialData.usuarioId || null,
          historialData.datosAnteriores ? JSON.stringify(historialData.datosAnteriores) : null,
          historialData.datosNuevos ? JSON.stringify(historialData.datosNuevos) : null
        ]
      );
      
      return { id: result.insertId, ...historialData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async findByTipoCambio(tipoCambio) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM historial_cambios WHERE tipo_cambio = ? ORDER BY fecha_cambio DESC',
        [tipoCambio]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByTipoCambio:', error);
      throw error;
    }
  }

  async findByFechaRango(fechaInicio, fechaFin) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM historial_cambios WHERE DATE(fecha_cambio) BETWEEN ? AND ? ORDER BY fecha_cambio DESC',
        [fechaInicio, fechaFin]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByFechaRango:', error);
      throw error;
    }
  }

  async getEstadisticasCambios() {
    try {
      const [rows] = await this.pool.execute(
        `SELECT 
           tipo_cambio,
           COUNT(*) as cantidad,
           DATE(fecha_cambio) as fecha
         FROM historial_cambios 
         WHERE fecha_cambio >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY tipo_cambio, DATE(fecha_cambio)
         ORDER BY fecha DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error en getEstadisticasCambios:', error);
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

module.exports = HistorialCambioRepository;
