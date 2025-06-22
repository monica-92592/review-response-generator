import React from 'react'
import { MessageSquare, Settings, HelpCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Review Response Generator</h1>
              <p className="text-sm text-gray-500">AI-powered customer communication</p>
            </div>
          </div>

          {/* Navigation - Coming Soon */}
          <nav className="hidden md:flex space-x-8">
            <span className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </span>
            <span className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
              History <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Soon</span>
            </span>
            <span className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
              Templates <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Soon</span>
            </span>
            <span className="text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
              Analytics <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Soon</span>
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <button className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 