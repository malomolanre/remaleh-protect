// Input validation utilities
export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 12) return 'Password must be at least 12 characters long'
  if (password.length > 128) return 'Password must be less than 128 characters'
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return 'Password must contain uppercase, lowercase, numbers, and special characters'
  }
  
  return null
}

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

export const validateLength = (value, fieldName, min, max) => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters long`
  }
  if (value && value.length > max) {
    return `${fieldName} must be less than ${max} characters long`
  }
  return null
}

export const validateURL = (url) => {
  if (!url) return null
  
  try {
    new URL(url)
    return null
  } catch {
    return 'Please enter a valid URL'
  }
}

// Input sanitization utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html
  
  // Remove potentially dangerous HTML tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

export const escapeHTML = (text) => {
  if (typeof text !== 'string') return text
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match])
}

// Common validation schemas
export const commonValidationSchemas = {
  email: validateEmail,
  password: validatePassword,
  required: (value) => validateRequired(value, 'This field'),
  url: validateURL
}

// Create validation schema for forms
export const createValidationSchema = (fields) => {
  const schema = {}
  
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    
    if (field.required) {
      schema[fieldName] = (value) => validateRequired(value, field.label || fieldName)
    }
    
    if (field.type === 'email') {
      schema[fieldName] = validateEmail
    }
    
    if (field.type === 'password') {
      schema[fieldName] = validatePassword
    }
    
    if (field.type === 'url') {
      schema[fieldName] = validateURL
    }
    
    if (field.minLength || field.maxLength) {
      const originalValidator = schema[fieldName]
      schema[fieldName] = (value) => {
        if (originalValidator) {
          const originalError = originalValidator(value)
          if (originalError) return originalError
        }
        return validateLength(value, field.label || fieldName, field.minLength || 0, field.maxLength || Infinity)
      }
    }
    
    if (field.custom) {
      const originalValidator = schema[fieldName]
      schema[fieldName] = (value) => {
        if (originalValidator) {
          const originalError = originalValidator(value)
          if (originalError) return originalError
        }
        return field.custom(value)
      }
    }
  })
  
  return schema
}
