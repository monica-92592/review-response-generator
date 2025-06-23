import React from 'react'
import { Sliders } from 'lucide-react'

interface ToneAdjustmentsProps {
  formality: number
  empathy: number
  enthusiasm: number
  professionalism: number
  onFormalityChange: (value: number) => void
  onEmpathyChange: (value: number) => void
  onEnthusiasmChange: (value: number) => void
  onProfessionalismChange: (value: number) => void
  disabled?: boolean
}

export default function ToneAdjustments({
  formality,
  empathy,
  enthusiasm,
  professionalism,
  onFormalityChange,
  onEmpathyChange,
  onEnthusiasmChange,
  onProfessionalismChange,
  disabled = false
}: ToneAdjustmentsProps) {
  const getSliderColor = (value: number) => {
    if (value <= 3) return 'bg-red-500'
    if (value <= 6) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getLabel = (value: number, type: string) => {
    if (value <= 2) return `Very Low ${type}`
    if (value <= 4) return `Low ${type}`
    if (value <= 6) return `Medium ${type}`
    if (value <= 8) return `High ${type}`
    return `Very High ${type}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sliders className="w-4 h-4 text-gray-500" />
        <h4 className="text-sm font-semibold text-gray-900">Tone Adjustments</h4>
      </div>
      
      <div className="space-y-4">
        {/* Formality */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Formality</label>
            <span className="text-xs text-gray-500">{getLabel(formality, 'Formality')}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              value={formality}
              onChange={(e) => onFormalityChange(Number(e.target.value))}
              disabled={disabled}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: `linear-gradient(to right, ${getSliderColor(formality)} 0%, ${getSliderColor(formality)} ${formality * 10}%, #e5e7eb ${formality * 10}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Casual</span>
              <span>Formal</span>
            </div>
          </div>
        </div>

        {/* Empathy */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Empathy</label>
            <span className="text-xs text-gray-500">{getLabel(empathy, 'Empathy')}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              value={empathy}
              onChange={(e) => onEmpathyChange(Number(e.target.value))}
              disabled={disabled}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: `linear-gradient(to right, ${getSliderColor(empathy)} 0%, ${getSliderColor(empathy)} ${empathy * 10}%, #e5e7eb ${empathy * 10}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Detached</span>
              <span>Caring</span>
            </div>
          </div>
        </div>

        {/* Enthusiasm */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Enthusiasm</label>
            <span className="text-xs text-gray-500">{getLabel(enthusiasm, 'Enthusiasm')}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              value={enthusiasm}
              onChange={(e) => onEnthusiasmChange(Number(e.target.value))}
              disabled={disabled}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: `linear-gradient(to right, ${getSliderColor(enthusiasm)} 0%, ${getSliderColor(enthusiasm)} ${enthusiasm * 10}%, #e5e7eb ${enthusiasm * 10}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Reserved</span>
              <span>Excited</span>
            </div>
          </div>
        </div>

        {/* Professionalism */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Professionalism</label>
            <span className="text-xs text-gray-500">{getLabel(professionalism, 'Professionalism')}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              value={professionalism}
              onChange={(e) => onProfessionalismChange(Number(e.target.value))}
              disabled={disabled}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: `linear-gradient(to right, ${getSliderColor(professionalism)} 0%, ${getSliderColor(professionalism)} ${professionalism * 10}%, #e5e7eb ${professionalism * 10}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Relaxed</span>
              <span>Polished</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 