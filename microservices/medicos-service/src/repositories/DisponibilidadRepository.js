const mysql = require('mysql2/promise');

class DisponibilidadRepository {
  constructor() {
    this.pool = null;
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'medicos-db',
        user: process.env.DB_USER || 'medicos_user',
        password: process.env.DB_PASSWORD || 'medicos_pass',
        database: process.env.DB_NAME || 'medicos_db',
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

  async findByMedicoId(medicoId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM disponibilidades WHERE medico_id = ? AND activo = true ORDER BY dia_semana, hora_inicio',
        [medicoId]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByMedicoId:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM disponibilidades WHERE id = ? AND activo = true',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(disponibilidadData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO disponibilidades (medico_id, dia_semana, hora_inicio, hora_fin) 
         VALUES (?, ?, ?, ?)`,
        [
          disponibilidadData.medicoId,
          disponibilidadData.diaSemana,
          disponibilidadData.horaInicio,
          disponibilidadData.horaFin
        ]
      );
      
      return { id: result.insertId, ...disponibilidadData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, disponibilidadData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE disponibilidades 
         SET dia_semana = ?, hora_inicio = ?, hora_fin = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND activo = true`,
        [
          disponibilidadData.diaSemana,
          disponibilidadData.horaInicio,
          disponibilidadData.horaFin,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...disponibilidadData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE disponibilidades SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async deleteByMedicoId(medicoId) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE disponibilidades SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE medico_id = ?',
        [medicoId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en deleteByMedicoId:', error);
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

module.exports = DisponibilidadRepository;
