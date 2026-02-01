// End-to-End Test Suite for Fitness Tracker App

const puppeteer = require('puppeteer');
const { generateMockUser, generateMockWorkout, generateMockNutrition, generateMockWeight, generateMockGoal } = require('./app/utils/test-utils');

describe('Fitness Tracker App - End-to-End Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser
      args: ['--no-sandbox', '--disable-bundled-ppapi-flash']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Navigate to the home page
    await page.goto('http://localhost:3000'); // Assuming the app runs on localhost:3000
  });

  describe('Authentication Flow', () => {
    test('should allow user registration', async () => {
      const mockUser = generateMockUser();

      await page.click('a[href="/register"]');
      await page.type('#name', mockUser.name);
      await page.type('#email-address', mockUser.email);
      await page.type('#password', mockUser.password);
      await page.type('#confirm-password', mockUser.password);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForNavigation();
      expect(page.url()).toContain('/dashboard');
    });

    test('should allow user login', async () => {
      const mockUser = generateMockUser();

      await page.click('a[href="/login"]');
      await page.type('#email-address', mockUser.email);
      await page.type('#password', mockUser.password);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForNavigation();
      expect(page.url()).toContain('/dashboard');
    });

    test('should handle invalid login credentials', async () => {
      await page.click('a[href="/login"]');
      await page.type('#email-address', 'invalid@example.com');
      await page.type('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Wait for error message
      await page.waitForSelector('.bg-red-100');
      const errorMessage = await page.$eval('.bg-red-100', el => el.textContent);
      expect(errorMessage).toContain('Invalid credentials');
    });
  });

  describe('Workout Functionality', () => {
    test('should allow user to create workout', async () => {
      // First login
      await page.click('a[href="/login"]');
      await page.type('#email-address', 'test@example.com'); // Use actual test user
      await page.type('#password', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Navigate to workouts
      await page.click('a[href="/workouts"]');
      await page.waitForSelector('[data-testid="workout-form"]');

      const mockWorkout = generateMockWorkout();

      await page.type('#exerciseType', mockWorkout.exerciseType);
      await page.type('#duration', mockWorkout.duration.toString());
      await page.select('#intensity', mockWorkout.intensity);
      await page.type('#date', mockWorkout.date);
      await page.type('#notes', mockWorkout.notes);

      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="workout-list"]');

      // Verify workout was added
      const workoutText = await page.$eval('[data-testid="workout-item"]', el => el.textContent);
      expect(workoutText).toContain(mockWorkout.exerciseType);
    });

    test('should allow user to edit workout', async () => {
      await page.click('a[href="/workouts"]');
      await page.waitForSelector('[data-testid="workout-list"]');

      // Click edit button on first workout
      await page.click('[data-testid="edit-workout-btn"]');
      await page.type('#exerciseType', 'Updated Exercise');
      await page.click('button[type="submit"]');

      // Verify update
      const updatedText = await page.$eval('[data-testid="workout-item"]', el => el.textContent);
      expect(updatedText).toContain('Updated Exercise');
    });

    test('should allow user to delete workout', async () => {
      await page.click('a[href="/workouts"]');
      await page.waitForSelector('[data-testid="workout-list"]');

      // Click delete button and confirm
      await page.click('[data-testid="delete-workout-btn"]');
      page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog

      // Verify deletion
      const workoutCount = await page.$$('.workout-item').length;
      expect(workoutCount).toBeLessThan(previousCount);
    });
  });

  describe('Nutrition Functionality', () => {
    test('should allow user to create nutrition log', async () => {
      await page.click('a[href="/nutrition"]');
      await page.waitForSelector('[data-testid="nutrition-form"]');

      const mockNutrition = generateMockNutrition();

      await page.type('#meal', mockNutrition.meal);
      await page.type('#calories', mockNutrition.calories.toString());
      await page.type('#protein', mockNutrition.protein.toString());
      await page.type('#carbs', mockNutrition.carbs.toString());
      await page.type('#fats', mockNutrition.fats.toString());
      await page.type('#date', mockNutrition.date);
      await page.type('#notes', mockNutrition.notes);

      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="nutrition-list"]');

      // Verify nutrition log was added
      const nutritionText = await page.$eval('[data-testid="nutrition-item"]', el => el.textContent);
      expect(nutritionText).toContain(mockNutrition.meal);
    });
  });

  describe('Weight Tracking Functionality', () => {
    test('should allow user to create weight log', async () => {
      await page.click('a[href="/weights"]');
      await page.waitForSelector('[data-testid="weight-form"]');

      const mockWeight = generateMockWeight();

      await page.type('#weight', mockWeight.weight.toString());
      await page.type('#date', mockWeight.date);
      await page.type('#notes', mockWeight.notes);

      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="weight-list"]');

      // Verify weight log was added
      const weightText = await page.$eval('[data-testid="weight-item"]', el => el.textContent);
      expect(weightText).toContain(mockWeight.weight.toString());
    });
  });

  describe('Goals Functionality', () => {
    test('should allow user to create goal', async () => {
      await page.click('a[href="/goals"]');
      await page.waitForSelector('[data-testid="goal-form"]');

      const mockGoal = generateMockGoal();

      await page.type('#title', mockGoal.title);
      await page.select('#goalType', mockGoal.goalType);
      await page.type('#targetValue', mockGoal.targetValue);
      await page.type('#deadline', mockGoal.deadline);
      await page.type('#description', mockGoal.description);

      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="goal-list"]');

      // Verify goal was added
      const goalText = await page.$eval('[data-testid="goal-item"]', el => el.textContent);
      expect(goalText).toContain(mockGoal.title);
    });
  });

  describe('Progress Visualization', () => {
    test('should display charts on progress page', async () => {
      await page.click('a[href="/progress"]');
      await page.waitForSelector('[data-testid="chart-container"]');

      // Verify charts are rendered
      const chartCount = await page.$$('.chart-element').length;
      expect(chartCount).toBeGreaterThan(0);
    });
  });

  describe('Social Sharing', () => {
    test('should allow user to share achievements', async () => {
      await page.click('a[href="/progress"]');
      await page.waitForSelector('[data-testid="share-button"]');

      // Click share button
      await page.click('[data-testid="share-button"]');

      // Verify share modal appears
      const modalVisible = await page.$eval('[data-testid="share-modal"]', el => el.style.display !== 'none');
      expect(modalVisible).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    test('should be responsive on mobile screens', async () => {
      await page.setViewport({ width: 375, height: 667 }); // iPhone 6/7/8

      // Test navigation on mobile
      await page.click('.hamburger-menu'); // Assuming hamburger menu exists
      const menuVisible = await page.$eval('.mobile-menu', el => el.classList.contains('show'));
      expect(menuVisible).toBe(true);

      // Reset viewport
      await page.setViewport({ width: 1200, height: 800 });
    });
  });

  describe('Error Handling', () => {
    test('should display error messages appropriately', async () => {
      // Test form validation errors
      await page.click('a[href="/workouts"]');
      await page.click('button[type="submit"]'); // Submit empty form

      // Wait for validation errors
      await page.waitForSelector('.error-message');
      const errorCount = await page.$$('.error-message').length;
      expect(errorCount).toBeGreaterThan(0);
    });
  });
});

// Additional helper functions for testing
async function loginUser(page, email, password) {
  await page.click('a[href="/login"]');
  await page.type('#email-address', email);
  await page.type('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

async function logoutUser(page) {
  await page.click('[data-testid="sign-out-btn"]');
  await page.waitForNavigation();
}