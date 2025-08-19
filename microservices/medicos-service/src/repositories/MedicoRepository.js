const mysql = require('mysql2/promise');

class MedicoRepository {
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

  async findAll() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM medicos WHERE activo = true ORDER BY apellido, nombre'
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
        'SELECT * FROM medicos WHERE id = ? AND activo = true',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByMatricula(matricula) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM medicos WHERE matricula = ? AND activo = true',
        [matricula]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findByMatricula:', error);
      throw error;
    }
  }

  async findByEspecialidad(especialidad) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM medicos WHERE especialidad = ? AND activo = true ORDER BY apellido, nombre',
        [especialidad]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByEspecialidad:', error);
      throw error;
    }
  }

  async create(medicoData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO medicos (matricula, nombre, apellido, especialidad, email, telefono, fecha_nacimiento, direccion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          medicoData.matricula,
          medicoData.nombre,
          medicoData.apellido,
          medicoData.especialidad,
          medicoData.email,
          medicoData.telefono,
          medicoData.fechaNacimiento,
          medicoData.direccion || null
        ]
      );
      
      return { id: result.insertId, ...medicoData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, medicoData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE medicos 
         SET matricula = ?, nombre = ?, apellido = ?, especialidad = ?, email = ?, 
             telefono = ?, fecha_nacimiento = ?, direccion = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND activo = true`,
        [
          medicoData.matricula,
          medicoData.nombre,
          medicoData.apellido,
          medicoData.especialidad,
          medicoData.email,
          medicoData.telefono,
          medicoData.fechaNacimiento,
          medicoData.direccion || null,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...medicoData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async softDelete(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE medicos SET activo = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en softDelete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await this.pool.execute(
        `SELECT * FROM medicos 
         WHERE (nombre LIKE ? OR apellido LIKE ? OR matricula LIKE ? OR especialidad LIKE ?) 
         AND activo = true
         ORDER BY apellido, nombre`,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      console.error('Error en search:', error);
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

module.exports = MedicoRepository;
