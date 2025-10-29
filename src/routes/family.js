const express = require('express');
const router = express.Router();
const database = require('../database/database');
const { validateFamilyMember } = require('../utils/validation');

/**
 * @route GET /api/family
 * @description Get all family members
 * @access Public
 */
router.get('/', async (req, res, next) => {
  try {
    const members = await database.all(`
      SELECT 
        id,
        first_name,
        last_name,
        birth_year,
        death_year,
        generation,
        parent_id,
        photo_url,
        biography,
        is_alive,
        created_at,
        updated_at
      FROM family_members 
      ORDER BY generation, parent_id, id
    `);
    
    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/family/stats
 * @description Get family statistics
 * @access Public
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN is_alive = 1 THEN 1 END) as living_members,
        MAX(generation) as total_generations
      FROM family_members
    `);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/family/:id
 * @description Get a specific family member
 * @access Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid member ID is required'
      });
    }
    
    const member = await database.get(`
      SELECT 
        fm.*,
        p.first_name as parent_first_name,
        p.last_name as parent_last_name
      FROM family_members fm
      LEFT JOIN family_members p ON fm.parent_id = p.id
      WHERE fm.id = ?
    `, [parseInt(id)]);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/family
 * @description Create a new family member
 * @access Public
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = validateFamilyMember(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const {
      first_name,
      last_name,
      birth_year,
      death_year,
      generation,
      parent_id,
      photo_url,
      biography
    } = req.body;
    
    // Check if parent exists if parent_id is provided
    if (parent_id) {
      const parent = await database.get('SELECT id FROM family_members WHERE id = ?', [parent_id]);
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'Parent not found'
        });
      }
    }
    
    const is_alive = !death_year;
    
    const result = await database.run(`
      INSERT INTO family_members (
        first_name, last_name, birth_year, death_year, generation, 
        parent_id, photo_url, biography, is_alive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name,
      last_name,
      birth_year || null,
      death_year || null,
      generation,
      parent_id || null,
      photo_url || null,
      biography || null,
      is_alive
    ]);
    
    // Get the newly created member
    const newMember = await database.get('SELECT * FROM family_members WHERE id = ?', [result.id]);
    
    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Family member created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/family/:id
 * @description Update a family member
 * @access Public
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid member ID is required'
      });
    }
    
    const validation = validateFamilyMember(req.body, true);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    const {
      first_name,
      last_name,
      birth_year,
      death_year,
      generation,
      parent_id,
      photo_url,
      biography
    } = req.body;
    
    // Check if member exists
    const existingMember = await database.get('SELECT id FROM family_members WHERE id = ?', [parseInt(id)]);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    // Check if parent exists if parent_id is provided
    if (parent_id) {
      const parent = await database.get('SELECT id FROM family_members WHERE id = ?', [parent_id]);
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'Parent not found'
        });
      }
    }
    
    const is_alive = !death_year;
    
    await database.run(`
      UPDATE family_members 
      SET 
        first_name = ?,
        last_name = ?,
        birth_year = ?,
        death_year = ?,
        generation = ?,
        parent_id = ?,
        photo_url = ?,
        biography = ?,
        is_alive = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      first_name,
      last_name,
      birth_year || null,
      death_year || null,
      generation,
      parent_id || null,
      photo_url || null,
      biography || null,
      is_alive,
      parseInt(id)
    ]);
    
    // Get the updated member
    const updatedMember = await database.get('SELECT * FROM family_members WHERE id = ?', [parseInt(id)]);
    
    res.json({
      success: true,
      data: updatedMember,
      message: 'Family member updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/family/:id
 * @description Delete a family member
 * @access Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid member ID is required'
      });
    }
    
    // Check if member exists
    const existingMember = await database.get('SELECT id FROM family_members WHERE id = ?', [parseInt(id)]);
    if (!existingMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    // Check if member has children
    const children = await database.all('SELECT id FROM family_members WHERE parent_id = ?', [parseInt(id)]);
    if (children.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete member with children. Please reassign or delete children first.'
      });
    }
    
    await database.run('DELETE FROM family_members WHERE id = ?', [parseInt(id)]);
    
    res.json({
      success: true,
      message: 'Family member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;