const mysql = require('mysql2/promise');

class PlantillaRepository {
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
        'SELECT * FROM plantillas ORDER BY fecha_creacion DESC'
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
        'SELECT * FROM plantillas WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async findByNombre(nombre) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE nombre = ?',
        [nombre]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findByNombre:', error);
      throw error;
    }
  }

  async findByTipo(tipo) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE tipo = ? ORDER BY fecha_creacion DESC',
        [tipo]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByTipo:', error);
      throw error;
    }
  }

  async findByCanal(canal) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE canal = ? ORDER BY fecha_creacion DESC',
        [canal]
      );
      return rows;
    } catch (error) {
      console.error('Error en findByCanal:', error);
      throw error;
    }
  }

  async findActivas() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE activa = true ORDER BY fecha_creacion DESC',
        []
      );
      return rows;
    } catch (error) {
      console.error('Error en findActivas:', error);
      throw error;
    }
  }

  async findByTipoYCanal(tipo, canal) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE tipo = ? AND canal = ? AND activa = true LIMIT 1',
        [tipo, canal]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error en findByTipoYCanal:', error);
      throw error;
    }
  }

  async create(plantillaData) {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO plantillas (nombre, tipo, canal, asunto, contenido, activa) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          plantillaData.nombre,
          plantillaData.tipo,
          plantillaData.canal,
          plantillaData.asunto,
          plantillaData.contenido,
          plantillaData.activa || true
        ]
      );
      
      return { id: result.insertId, ...plantillaData };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, plantillaData) {
    try {
      const [result] = await this.pool.execute(
        `UPDATE plantillas 
         SET nombre = ?, tipo = ?, canal = ?, asunto = ?, contenido = ?, activa = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          plantillaData.nombre,
          plantillaData.tipo,
          plantillaData.canal,
          plantillaData.asunto,
          plantillaData.contenido,
          plantillaData.activa,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, ...plantillaData };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM plantillas WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async activate(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE plantillas SET activa = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, activa: true };
    } catch (error) {
      console.error('Error en activate:', error);
      throw error;
    }
  }

  async deactivate(id) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE plantillas SET activa = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { id, activa: false };
    } catch (error) {
      console.error('Error en deactivate:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await this.pool.execute(
        'SELECT * FROM plantillas WHERE nombre LIKE ? OR contenido LIKE ? OR asunto LIKE ? ORDER BY fecha_creacion DESC',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows;
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  async getEstadisticas() {
    try {
      const [totalRows] = await this.pool.execute('SELECT COUNT(*) as total FROM plantillas');
      const [activasRows] = await this.pool.execute('SELECT COUNT(*) as activas FROM plantillas WHERE activa = true');
      const [inactivasRows] = await this.pool.execute('SELECT COUNT(*) as inactivas FROM plantillas WHERE activa = false');
      const [porTipoRows] = await this.pool.execute('SELECT tipo, COUNT(*) as cantidad FROM plantillas GROUP BY tipo');
      const [porCanalRows] = await this.pool.execute('SELECT canal, COUNT(*) as cantidad FROM plantillas GROUP BY canal');

      return {
        total: totalRows[0].total,
        activas: activasRows[0].activas,
        inactivas: inactivasRows[0].inactivas,
        porTipo: porTipoRows,
        porCanal: porCanalRows
      };
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

module.exports = PlantillaRepository;

