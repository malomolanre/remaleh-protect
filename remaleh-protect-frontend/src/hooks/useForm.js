import { useState, useCallback } from 'react'

export function useForm(initialValues = {}, validationSchema = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [errors])

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field on blur if validation schema exists
    if (validationSchema[name]) {
      const fieldError = validationSchema[name](values[name])
      setErrors(prev => ({ ...prev, [name]: fieldError }))
    }
  }, [validationSchema, values])

  const validateField = useCallback((name) => {
    if (validationSchema[name]) {
      const fieldError = validationSchema[name](values[name])
      setErrors(prev => ({ ...prev, [name]: fieldError }))
      return fieldError
    }
    return null
  }, [validationSchema, values])

  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(fieldName => {
      const fieldError = validationSchema[fieldName](values[fieldName])
      if (fieldError) {
        newErrors[fieldName] = fieldError
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validationSchema, values])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const handleSubmit = useCallback(async (onSubmit) => {
    if (!validateForm()) {
      return false
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm, values])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    handleSubmit,
    setValues,
    setErrors
  }
}
