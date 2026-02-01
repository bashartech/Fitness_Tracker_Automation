// Test utilities for end-to-end testing

// Mock data generators
export const generateMockUser = () => ({
  id: Math.random().toString(36).substring(7),
  name: 'Test User',
  email: `test${Math.random().toString(36).substring(7)}@example.com`,
  password: 'Password123!',
});

export const generateMockWorkout = () => ({
  exerciseType: ['Running', 'Swimming', 'Cycling', 'Weight Training'][Math.floor(Math.random() * 4)],
  duration: Math.floor(Math.random() * 120) + 10, // 10-130 minutes
  intensity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
  date: new Date().toISOString().split('T')[0],
  notes: 'Test workout notes'
});

export const generateMockNutrition = () => ({
  meal: ['Breakfast', 'Lunch', 'Dinner', 'Snack'][Math.floor(Math.random() * 4)],
  calories: Math.floor(Math.random() * 1000) + 100, // 100-1100 calories
  protein: Math.floor(Math.random() * 50) + 10, // 10-60g
  carbs: Math.floor(Math.random() * 100) + 20, // 20-120g
  fats: Math.floor(Math.random() * 40) + 5, // 5-45g
  date: new Date().toISOString().split('T')[0],
  notes: 'Test nutrition notes'
});

export const generateMockWeight = () => ({
  weight: Math.floor(Math.random() * 100) + 50, // 50-150 kg
  date: new Date().toISOString().split('T')[0],
  notes: 'Test weight notes'
});

export const generateMockGoal = () => ({
  title: `Lose ${Math.floor(Math.random() * 10) + 1}kg in ${Math.floor(Math.random() * 3) + 1} months`,
  goalType: ['lose-weight', 'gain-weight', 'build-muscle', 'run-distance'][Math.floor(Math.random() * 4)],
  targetValue: `${Math.floor(Math.random() * 10) + 1}kg`,
  deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within 30 days
  description: 'Test goal description',
  currentProgress: '0'
});

// API response mocks
export const mockApiResponse = (data: any, success: boolean = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error occurred'
});

// Test helpers
export const waitForElement = (selector: string, timeout: number = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        requestAnimationFrame(checkElement);
      }
    };
    checkElement();
  });
};

export const simulateInput = (element: HTMLElement, value: string) => {
  // Simulate typing in an input field
  const event = new Event('input', { bubbles: true });
  (element as HTMLInputElement).value = value;
  element.dispatchEvent(event);
};

export const simulateClick = (element: HTMLElement) => {
  // Simulate clicking an element
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  element.dispatchEvent(event);
};

// Form validation helpers
export const validateForm = (formData: any, requiredFields: string[]) => {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Performance testing utilities
export const measureFunctionTime = async (fn: () => any) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    executionTime: end - start
  };
};

// Network simulation utilities
export const simulateNetworkDelay = (delay: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const simulateNetworkResponse = async (data: any, delay: number = 1000, successRate: number = 0.95) => {
  await simulateNetworkDelay(delay);

  if (Math.random() < successRate) {
    return { success: true, data };
  } else {
    throw new Error('Network request failed');
  }
};