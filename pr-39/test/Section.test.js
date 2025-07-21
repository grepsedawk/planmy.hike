import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Section from '../js/Section.js';

describe('Section Model', () => {
  let section;

  beforeEach(() => {
    section = new Section();
    jest.clearAllMocks();
    
    // Clear window mocks
    global.window = {
      mileLogger: null,
      gpsTracker: null
    };
  });

  describe('Constructor and Basic Properties', () => {
    test('should initialize with default values', () => {
      expect(section.name).toBe('');
      expect(section.caloriesPerDay).toBe(4000);
      expect(section.gpsTrackingEnabled).toBe(false);
      expect(section.trail).toBe('PCT');
    });

    test('should set custom properties', () => {
      section.name = 'PCT Section A';
      section.startMile = 0;
      section.endMile = 100;
      section.currentMile = 50;
      section.caloriesPerDay = 3500;
      section.days = 5;

      expect(section.name).toBe('PCT Section A');
      expect(section.startMile).toBe(0);
      expect(section.endMile).toBe(100);
      expect(section.currentMile).toBe(50);
      expect(section.caloriesPerDay).toBe(3500);
      expect(section.days).toBe(5);
    });
  });

  describe('Static Methods', () => {
    test('should find section by id', async () => {
      const mockSection = { id: 1, name: 'Test Section' };
      global.db.sections.get.mockResolvedValue(mockSection);

      const result = await Section.find(1);

      expect(global.db.sections.get).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSection);
    });
  });

  describe('Database Operations', () => {
    test('should save section to database', async () => {
      const mockId = 456;
      global.db.sections.put.mockResolvedValue(mockId);

      const result = await section.save();

      expect(global.db.sections.put).toHaveBeenCalledWith(section);
      expect(result).toBe(mockId);
    });

    test('should delete section from database', async () => {
      section.id = 456;
      
      await section.delete();

      expect(global.db.sections.delete).toHaveBeenCalledWith(456);
    });
  });

  describe('Calculated Properties', () => {
    beforeEach(() => {
      section.caloriesPerDay = 3000;
      section.days = 7;
      section.startMile = 100;
      section.endMile = 200;
      section.currentMile = 150;
    });

    test('should calculate required calories', () => {
      expect(section.requiredCalories).toBe(21000); // 3000 * 7
    });

    test('should calculate progress percentage', () => {
      // Total: 200-100 = 100 miles
      // Completed: 150-100 = 50 miles
      // Progress: 50/100 * 100 = 50%
      expect(section.progressPercentage).toBe(50);
    });

    test('should handle progress calculation edge cases', () => {
      // No start/end mile
      section.startMile = null;
      section.endMile = null;
      expect(section.progressPercentage).toBe(0);

      // No current mile
      section.startMile = 100;
      section.endMile = 200;
      section.currentMile = null;
      expect(section.progressPercentage).toBe(0);

      // Over 100% progress
      section.currentMile = 250;
      expect(section.progressPercentage).toBe(100);

      // Negative progress
      section.currentMile = 50;
      expect(section.progressPercentage).toBe(0);
    });

    test('should calculate remaining miles', () => {
      expect(section.remainingMiles).toBe(50); // 200 - 150
    });

    test('should handle remaining miles edge cases', () => {
      // No end mile
      section.endMile = null;
      expect(section.remainingMiles).toBe(-100); // null - 100 = -100

      // No current mile, should use start mile
      section.endMile = 200;
      section.currentMile = null;
      expect(section.remainingMiles).toBe(100); // 200 - 100

      // Current mile past end mile
      section.currentMile = 250;
      expect(section.remainingMiles).toBe(0); // max(0, 200 - 250)
    });
  });

  describe('Foods Relationship', () => {
    test('should get foods for section', () => {
      section.id = 123;
      const mockFoodsQuery = { toArray: jest.fn() };
      global.db.foods.where.mockReturnValue(mockFoodsQuery);

      const foods = section.foods;

      expect(global.db.foods.where).toHaveBeenCalledWith({ sectionId: 123 });
      expect(foods).toBe(mockFoodsQuery);
    });
  });

  describe('Mile Tracking', () => {
    beforeEach(() => {
      section.id = 789;
      section.currentMile = 100;
      global.db.sections.put.mockResolvedValue(789);
    });

    test('should update current mile manually', async () => {
      const newMile = 105;
      
      const result = await section.updateCurrentMile(newMile, 'manual');

      expect(section.currentMile).toBe(newMile);
      expect(global.db.sections.put).toHaveBeenCalledWith(section);
      expect(result).toBe(newMile);
    });

    test('should update current mile via GPS without mile logger', async () => {
      const newMile = 110;
      
      const result = await section.updateCurrentMile(newMile, 'gps');

      expect(section.currentMile).toBe(newMile);
      expect(global.db.sections.put).toHaveBeenCalledWith(section);
      expect(result).toBe(newMile);
    });

    test('should log mile update when GPS tracking and mile logger available', async () => {
      const newMile = 115;
      const mockPosition = { lat: 34.1234, lng: -118.5678 };
      const mockLogMileUpdate = jest.fn();
      const mockGetPosition = jest.fn().mockReturnValue(mockPosition);

      global.window.mileLogger = { logMileUpdate: mockLogMileUpdate };
      global.window.gpsTracker = { getPosition: mockGetPosition };

      await section.updateCurrentMile(newMile, 'gps');

      expect(mockLogMileUpdate).toHaveBeenCalledWith({
        sectionId: 789,
        mile: newMile,
        previousMile: 100,
        position: mockPosition,
        timestamp: expect.any(Date)
      });
    });

    test('should handle database save errors', async () => {
      const mockError = new Error('Save failed');
      global.db.sections.put.mockRejectedValue(mockError);

      await expect(section.updateCurrentMile(105)).rejects.toThrow('Save failed');
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined days for required calories', () => {
      section.caloriesPerDay = 3000;
      section.days = undefined;

      expect(section.requiredCalories).toBeNaN();
    });

    test('should handle zero days', () => {
      section.caloriesPerDay = 3000;
      section.days = 0;

      expect(section.requiredCalories).toBe(0);
    });

    test('should handle negative values', () => {
      section.startMile = 200;
      section.endMile = 100; // End before start
      section.currentMile = 150;

      // Progress calculation: (150-200)/(100-200) * 100 = (-50)/(-100) * 100 = 50%
      expect(section.progressPercentage).toBe(50); 
      expect(section.remainingMiles).toBe(0); // max(0, 100 - 150) = 0
    });
  });
});