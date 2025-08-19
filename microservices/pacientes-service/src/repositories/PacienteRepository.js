const mysql = require('mysql2/promise');

class PacienteRepository {
  constructor() {
    this.pool = null;
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'pacientes-db',
        user: process.env.DB_USER || 'pacientes_user',
        password: process.env.DB_PASSWORD || 'pacientes_pass',
        database: process.env.DB_NAME || 'pacientes_db',
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
        'SELECT * FROM pacientes ORDER BY created_at DESC'
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
        'SELECT * FROM pacientes WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByDni(dni) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM pacientes WHERE dni = ?',
        [dni]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findByDni:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM pacientes WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }

  async create(pacienteData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO pacientes (dni, nombre, apellido, email, telefono, fecha_nacimiento, direccion) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          pacienteData.dni,
          pacienteData.nombre,
          pacienteData.apellido,
          pacienteData.email,
          pacienteData.telefono,
          pacienteData.fechaNacimiento,
          pacienteData.direccion || null
        ]
      );
      
      return { id: result.insertId, ...pacienteData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, pacienteData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE pacientes 
         SET dni = ?, nombre = ?, apellido = ?, email = ?, telefono = ?, 
             fecha_nacimiento = ?, direccion = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          pacienteData.dni,
          pacienteData.nombre,
          pacienteData.apellido,
          pacienteData.email,
          pacienteData.telefono,
          pacienteData.fechaNacimiento,
          pacienteData.direccion || null,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...pacienteData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM pacientes WHERE id = ?',
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
        `SELECT * FROM pacientes 
         WHERE nombre LIKE ? OR apellido LIKE ? OR dni LIKE ? OR email LIKE ?
         ORDER BY nombre, apellido`,
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

module.exports = PacienteRepository;
