import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useScamAnalysis } from '../hooks/useScamAnalysis'

export default function ScamAnalysis() {
  const [text, setText] = useState('')
  const { isAnalyzing, resultHtml, analyze } = useScamAnalysis()

  const onSubmit = async (e) => {
    e.preventDefault()
    await analyze(text)
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center mb-4">
          <div className="bg-[#21a1ce] p-2 rounded-lg mr-3">
            <MessageSquare className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold">Advanced Text Message Analysis</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Comprehensive scam detection using multiple AI services, link analysis, and breach checking
        </p>

        <form onSubmit={onSubmit}>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32"
            placeholder="Paste your message here for comprehensive security analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#21a1ce] to-[#1a80a3] text-white py-3 px-6 rounded-lg font-medium w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing Message...' : 'Analyze Message'}
          </button>
        </form>

        {resultHtml && (
          <div className="mt-6">
            <div dangerouslySetInnerHTML={{ __html: resultHtml }} />
          </div>
        )}
      </div>
    </div>
  )
}
