import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import Food from '../js/Food.js';

describe('Food Model', () => {
  let food;

  beforeEach(() => {
    food = new Food();
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Constructor and Basic Properties', () => {
    test('should initialize with default values', () => {
      expect(food.name).toBe('');
      expect(food.quantity).toBe(1);
    });

    test('should set custom properties', () => {
      food.name = 'Trail Mix';
      food.quantity = 2;
      food.calories = 500;
      food.carbs = 50;
      food.protein = 15;
      food.fat = 30;
      food.netWeight = 100;
      food.servingSize = 50;

      expect(food.name).toBe('Trail Mix');
      expect(food.quantity).toBe(2);
      expect(food.calories).toBe(500);
    });
  });

  describe('Calculated Properties', () => {
    beforeEach(() => {
      food.calories = 500;
      food.carbs = 50;
      food.protein = 15;
      food.fat = 30;
      food.netWeight = 100; // grams
      food.quantity = 2;
      food.servingSize = 50; // grams
    });

    test('should calculate servings correctly', () => {
      // (100g * 2 qty) / 50g serving = 4 servings
      expect(food.servings).toBe(4);
    });

    test('should handle zero serving size', () => {
      food.servingSize = 0;
      expect(food.servings).toBe(Infinity);
    });

    test('should calculate total calories', () => {
      // 500 calories * 4 servings = 2000
      expect(food.totalCalories).toBe(2000);
    });

    test('should calculate total macronutrients', () => {
      expect(food.totalFat).toBe(120); // 30 * 4 servings
      expect(food.totalCarbs).toBe(200); // 50 * 4 servings
      expect(food.totalProtein).toBe(60); // 15 * 4 servings
    });

    test('should calculate calorie per ounce', () => {
      // Total weight: 100g * 2 = 200g = ~7.05 oz
      // Total calories: 2000
      // Calories per ounce: 2000 / 7.05 ≈ 283.7
      const expectedCaloriesPerOunce = 2000 / (200 / 28.3495);
      expect(food.caloriePerOunce).toBeCloseTo(expectedCaloriesPerOunce, 1);
    });

    test('should handle zero weight for calorie per ounce', () => {
      food.netWeight = 0;
      expect(food.caloriePerOunce).toBe(0);
    });

    test('should calculate protein to carbs ratio', () => {
      // 60 protein / 200 carbs = 0.3
      expect(food.proteinToCarbsRatio).toBe(0.3);
    });

    test('should handle zero carbs for protein ratio', () => {
      food.carbs = 0;
      expect(food.proteinToCarbsRatio).toBe(0);
    });
  });

  describe('Database Operations', () => {
    test('should save food to database', async () => {
      const mockId = 123;
      global.db.foods.put.mockResolvedValue(mockId);

      const result = await food.save();

      expect(global.db.foods.put).toHaveBeenCalledWith(food);
      expect(result).toBe(mockId);
    });

    test('should delete food from database', async () => {
      food.id = 123;
      
      await food.delete();

      expect(global.db.foods.delete).toHaveBeenCalledWith(123);
    });

    test('should handle database errors gracefully', async () => {
      const mockError = new Error('Database error');
      global.db.foods.put.mockRejectedValue(mockError);

      await expect(food.save()).rejects.toThrow('Database error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative values', () => {
      food.calories = -100;
      food.netWeight = -50;
      food.quantity = -1;
      food.servingSize = 25;

      expect(food.servings).toBe(2); // Math.abs(-50 * -1) / 25
      expect(food.totalCalories).toBe(-200); // -100 * 2
    });

    test('should handle very small numbers', () => {
      food.calories = 0.1;
      food.netWeight = 0.1;
      food.quantity = 0.1;
      food.servingSize = 0.1;

      expect(food.servings).toBeCloseTo(0.1, 10); // (0.1 * 0.1) / 0.1
      expect(food.totalCalories).toBeCloseTo(0.01, 10); // 0.1 * 0.1
    });

    test('should handle undefined nutrition values', () => {
      food.calories = undefined;
      food.carbs = undefined;
      food.protein = undefined;
      food.fat = undefined;
      food.netWeight = 100;
      food.quantity = 1;
      food.servingSize = 50;

      expect(food.totalCalories).toBeNaN();
      expect(food.totalCarbs).toBeNaN();
      expect(food.totalProtein).toBeNaN();
      expect(food.totalFat).toBeNaN();
    });
  });
});