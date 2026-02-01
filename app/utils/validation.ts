// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

// Number validation
export const validateNumber = (value: string, fieldName: string, min?: number, max?: number): string | null => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== undefined && num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  return null;
};

// Date validation
export const validateDate = (dateString: string, fieldName: string): string | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} is not a valid date`;
  }
  return null;
};

// String length validation
export const validateStringLength = (value: string, fieldName: string, minLength?: number, maxLength?: number): string | null => {
  if (minLength !== undefined && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

// Workout form validation
export const validateWorkoutForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Exercise type validation
  const exerciseTypeError = validateRequired(formData.exerciseType, 'Exercise type');
  if (exerciseTypeError) errors.exerciseType = exerciseTypeError;

  // Duration validation
  if (!formData.duration) {
    errors.duration = 'Duration is required';
  } else {
    const durationError = validateNumber(formData.duration, 'Duration', 1);
    if (durationError) errors.duration = durationError;
  }

  // Intensity validation
  const intensityError = validateRequired(formData.intensity, 'Intensity');
  if (intensityError) errors.intensity = intensityError;

  // Date validation
  const dateError = validateDate(formData.date, 'Date');
  if (dateError) errors.date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Nutrition form validation
export const validateNutritionForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Meal validation
  const mealError = validateRequired(formData.meal, 'Meal');
  if (mealError) errors.meal = mealError;

  // Calories validation
  if (!formData.calories) {
    errors.calories = 'Calories are required';
  } else {
    const caloriesError = validateNumber(formData.calories, 'Calories', 0);
    if (caloriesError) errors.calories = caloriesError;
  }

  // Protein validation
  if (!formData.protein) {
    errors.protein = 'Protein is required';
  } else {
    const proteinError = validateNumber(formData.protein, 'Protein', 0);
    if (proteinError) errors.protein = proteinError;
  }

  // Carbs validation
  if (!formData.carbs) {
    errors.carbs = 'Carbs are required';
  } else {
    const carbsError = validateNumber(formData.carbs, 'Carbs', 0);
    if (carbsError) errors.carbs = carbsError;
  }

  // Fats validation
  if (!formData.fats) {
    errors.fats = 'Fats are required';
  } else {
    const fatsError = validateNumber(formData.fats, 'Fats', 0);
    if (fatsError) errors.fats = fatsError;
  }

  // Date validation
  const dateError = validateDate(formData.date, 'Date');
  if (dateError) errors.date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Weight form validation
export const validateWeightForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Weight validation
  if (!formData.weight) {
    errors.weight = 'Weight is required';
  } else {
    const weightError = validateNumber(formData.weight, 'Weight', 0);
    if (weightError) errors.weight = weightError;
  }

  // Date validation
  const dateError = validateDate(formData.date, 'Date');
  if (dateError) errors.date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Goal form validation
export const validateGoalForm = (formData: any): ValidationResult => {
    const errors: Record<string, string> = {};

  // Title validation
  const titleError = validateRequired(formData.title, 'Goal title');
  if (titleError) errors.title = titleError;

  // Goal type validation
  const goalTypeError = validateRequired(formData.goalType, 'Goal type');
  if (goalTypeError) errors.goalType = goalTypeError;

  // Target value validation
  const targetValueError = validateRequired(formData.targetValue, 'Target value');
  if (targetValueError) errors.targetValue = targetValueError;

  // Deadline validation
  const deadlineError = validateDate(formData.deadline, 'Deadline');
  if (deadlineError) errors.deadline = deadlineError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// User registration validation
export const validateRegistrationForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  const nameError = validateRequired(formData.name, 'Name');
  if (nameError) errors.name = nameError;

  // Email validation
  const emailError = validateRequired(formData.email, 'Email');
  if (emailError) {
    errors.email = emailError;
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordError = validateRequired(formData.password, 'Password');
  if (passwordError) {
    errors.password = passwordError;
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// User login validation
export const validateLoginForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  const emailError = validateRequired(formData.email, 'Email');
  if (emailError) {
    errors.email = emailError;
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordError = validateRequired(formData.password, 'Password');
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generic validation function
export const validateField = (value: string, validations: Array<(val: string) => string | null>): string | null => {
  for (const validation of validations) {
    const error = validation(value);
    if (error) return error;
  }
  return null;
};