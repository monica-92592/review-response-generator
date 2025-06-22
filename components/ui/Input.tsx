import React from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea'
  disabled?: boolean
  error?: string
  helperText?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  required?: boolean
  className?: string
  rows?: number
}

export default function Input({
  label,
  placeholder,
  value = '',
  onChange,
  type = 'text',
  disabled = false,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  required = false,
  className = '',
  rows = 3
}: InputProps) {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
  
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`
  
  const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 text-gray-400'
  const leftIconClasses = `${iconClasses} left-3`
  const rightIconClasses = `${iconClasses} right-3`

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={inputClasses}
        />
      )
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
    )
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className={leftIconClasses} />
        )}
        
        <div className={Icon && iconPosition === 'left' ? 'pl-10' : Icon && iconPosition === 'right' ? 'pr-10' : ''}>
          {renderInput()}
        </div>
        
        {Icon && iconPosition === 'right' && (
          <Icon className={rightIconClasses} />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
} 