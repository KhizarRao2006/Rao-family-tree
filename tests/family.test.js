const request = require('supertest');
const app = require('../src/server');
const database = require('../src/database/database');

// Mock the database to use our test database
jest.mock('../src/database/database', () => {
  return {
    getDb: jest.fn(() => global.testDb),
    init: jest.fn(),
    close: jest.fn()
  };
});

describe('Family API', () => {
  describe('GET /api/family', () => {
    it('should return all family members', async () => {
      const response = await request(app)
        .get('/api/family')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/family/stats', () => {
    it('should return family statistics', async () => {
      const response = await request(app)
        .get('/api/family/stats')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_members).toBeGreaterThan(0);
      expect(response.body.data.living_members).toBeGreaterThan(0);
      expect(response.body.data.total_generations).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/family', () => {
    it('should create a new family member', async () => {
      const newMember = {
        first_name: 'John',
        last_name: 'Doe',
        birth_year: 1995,
        generation: 2,
        biography: 'Test member'
      };
      
      const response = await request(app)
        .post('/api/family')
        .send(newMember)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe(newMember.first_name);
      expect(response.body.data.last_name).toBe(newMember.last_name);
    });
    
    it('should return validation errors for invalid data', async () => {
      const invalidMember = {
        first_name: '', // Empty first name
        last_name: 'Doe',
        generation: 'invalid' // Invalid generation
      };
      
      const response = await request(app)
        .post('/api/family')
        .send(invalidMember)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/family/:id', () => {
    it('should return a specific family member', async () => {
      const response = await request(app)
        .get('/api/family/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });
    
    it('should return 404 for non-existent member', async () => {
      await request(app)
        .get('/api/family/9999')
        .expect(404);
    });
  });
});