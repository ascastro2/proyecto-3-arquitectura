const mysql = require('mysql2/promise');

class TurnoRepository {
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

  async findAll() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos ORDER BY fecha, hora DESC'
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
        'SELECT * FROM turnos WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByPacienteId(pacienteId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE paciente_id = ? ORDER BY fecha, hora DESC',
        [pacienteId]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByPacienteId:', error);
      throw error;
    }
  }

  async findByMedicoId(medicoId) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE medico_id = ? ORDER BY fecha, hora DESC',
        [medicoId]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByMedicoId:', error);
      throw error;
    }
  }

  async findByEstado(estado) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE estado = ? ORDER BY fecha, hora DESC',
        [estado]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByEstado:', error);
      throw error;
    }
  }

  async findByFecha(fecha) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE DATE(fecha) = ? ORDER BY hora ASC',
        [fecha]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByFecha:', error);
      throw error;
    }
  }

  async findByFechaRango(fechaInicio, fechaFin) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC, hora ASC',
        [fechaInicio, fechaFin]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByFechaRango:', error);
      throw error;
    }
  }

  async findByMedicoAndFecha(medicoId, fecha) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM turnos WHERE medico_id = ? AND DATE(fecha) = ? ORDER BY hora ASC',
        [medicoId, fecha]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByMedicoAndFecha:', error);
      throw error;
    }
  }

  async checkDisponibilidad(medicoId, fecha, hora) {
    try {
      // Considera colisión exacta de hora en la misma fecha para el mismo médico, excepto cancelados/no show
      const [rows] = await this.pool.execute(
        `SELECT 1 FROM turnos 
         WHERE medico_id = ? AND DATE(fecha) = DATE(?) AND hora = ? 
           AND estado NOT IN ('CANCELADO','NO_SHOW')
         LIMIT 1`,
        [medicoId, fecha, hora]
      );
      return rows.length === 0;
    } catch (error) {
      console.error('Error en checkDisponibilidad:', error);
      throw error;
    }
  }

  async create(turnoData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO turnos (paciente_id, medico_id, fecha, hora, dia_semana, estado, motivo, observaciones) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          turnoData.pacienteId,
          turnoData.medicoId,
          turnoData.fecha,
          turnoData.hora,
          turnoData.diaSemana,
          turnoData.estado || 'PENDIENTE',
          turnoData.motivo || null,
          turnoData.observaciones || null
        ]
      );
      
      return { id: result.insertId, ...turnoData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, turnoData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE turnos 
         SET paciente_id = ?, medico_id = ?, fecha = ?, hora = ?, dia_semana = ?, 
             estado = ?, motivo = ?, observaciones = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          turnoData.pacienteId,
          turnoData.medicoId,
          turnoData.fecha,
          turnoData.hora,
          turnoData.diaSemana,
          turnoData.estado,
          turnoData.motivo || null,
          turnoData.observaciones || null,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...turnoData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async cancelarTurno(id, motivo) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE turnos SET estado = \'CANCELADO\', observaciones = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [motivo || 'Turno cancelado', id]
      );
      if (result.affectedRows === 0) return null;
      const turno = await this.findById(id);
      return turno;
    } catch (error) {
      console.error('Error en cancelarTurno:', error);
      throw error;
    }
  }

  async confirmarTurno(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE turnos SET estado = \'CONFIRMADO\', updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) return null;
      return await this.findById(id);
    } catch (error) {
      console.error('Error en confirmarTurno:', error);
      throw error;
    }
  }

  async completarTurno(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE turnos SET estado = \'COMPLETADO\', updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) return null;
      return await this.findById(id);
    } catch (error) {
      console.error('Error en completarTurno:', error);
      throw error;
    }
  }

  async marcarNoShow(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE turnos SET estado = \'NO_SHOW\', updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) return null;
      return await this.findById(id);
    } catch (error) {
      console.error('Error en marcarNoShow:', error);
      throw error;
    }
  }

  async updateEstado(id, estado) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE turnos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [estado, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, estado };
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM turnos WHERE id = ?',
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
        `SELECT t.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, 
                m.nombre as medico_nombre, m.apellido as medico_apellido
         FROM turnos t
         LEFT JOIN pacientes p ON t.paciente_id = p.id
         LEFT JOIN medicos m ON t.medico_id = m.id
         WHERE t.motivo LIKE ? OR t.observaciones LIKE ? 
         ORDER BY t.fecha DESC, t.hora DESC`,
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
           estado,
           COUNT(*) as cantidad,
           DATE(fecha) as fecha
         FROM turnos 
         WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY estado, DATE(fecha)
         ORDER BY fecha DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
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

module.exports = TurnoRepository;
