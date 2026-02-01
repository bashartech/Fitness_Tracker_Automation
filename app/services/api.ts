// API base URL for the Hugging Face backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bashartc14-ftt.hf.space';

// Generic API function to handle requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Only run on the client side
  if (typeof window === 'undefined') {
    throw new Error('API calls are only supported on the client side');
  }

  const token = localStorage.getItem('fitness-token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If the response is not ok, throw an error with the message
  if (!response.ok) {
    // Try to get error message from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON (e.g., HTML error page), create a generic error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // For DELETE requests, there might not be a response body
  if (response.status === 204 || endpoint.includes('/api/auth/logout')) {
    return { success: true };
  }

  return await response.json();
};

// Authentication API functions
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),

  getProfile: () =>
    apiRequest('/api/auth/profile'),
};

// Workout API functions
export const workoutAPI = {
  getAll: () => apiRequest('/api/workouts'),

  getById: (id: string) => apiRequest(`/api/workouts/${id}`),

  create: (workoutData: any) =>
    apiRequest('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    }),

  update: (id: string, workoutData: any) =>
    apiRequest(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    }),

  delete: (id: string) =>
    apiRequest(`/api/workouts/${id}`, {
      method: 'DELETE',
    }),
};

// Nutrition API functions
export const nutritionAPI = {
  getAll: () => apiRequest('/api/nutrition'),

  getById: (id: string) => apiRequest(`/api/nutrition/${id}`),

  create: (nutritionData: any) =>
    apiRequest('/api/nutrition', {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    }),

  update: (id: string, nutritionData: any) =>
    apiRequest(`/api/nutrition/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nutritionData),
    }),

  delete: (id: string) =>
    apiRequest(`/api/nutrition/${id}`, {
      method: 'DELETE',
    }),
};

// Weight API functions
export const weightAPI = {
  getAll: () => apiRequest('/api/weights'),

  getById: (id: string) => apiRequest(`/api/weights/${id}`),

  create: (weightData: any) =>
    apiRequest('/api/weights', {
      method: 'POST',
      body: JSON.stringify(weightData),
    }),

  update: (id: string, weightData: any) =>
    apiRequest(`/api/weights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(weightData),
    }),

  delete: (id: string) =>
    apiRequest(`/api/weights/${id}`, {
      method: 'DELETE',
    }),
};

// Goals API functions
export const goalAPI = {
  getAll: () => apiRequest('/api/goals'),

  getById: (id: string) => apiRequest(`/api/goals/${id}`),

  create: (goalData: any) =>
    apiRequest('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    }),

  update: (id: string, goalData: any) =>
    apiRequest(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    }),

  delete: (id: string) =>
    apiRequest(`/api/goals/${id}`, {
      method: 'DELETE',
    }),

  updateProgress: (id: string, progressData: any) =>
    apiRequest(`/api/goals/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    }),
};

// Progress API functions
export const progressAPI = {
  getData: () => apiRequest('/api/progress/data'),
};