import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Copy, Check, Zap } from 'lucide-react';

export default function JobDescOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const FREE_LIMIT = 2;

  const optimizeJobDesc = async () => {
    if (!input.trim()) {
      setError('Please paste a job description first');
      return;
    }

    if (usageCount >= FREE_LIMIT) {
      setError(`You've used your ${FREE_LIMIT} free optimizations. Time to monetize! 💰`);
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      // This will call your Vercel serverless function
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: input
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Optimization failed');
      }

      const data = await response.json();
      const optimizedText = data.optimized;
      
      setOutput(optimizedText);
      setUsageCount(prev => prev + 1);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Job Description Optimizer</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform boring job posts into compelling opportunities that attract top talent
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm text-gray-600">
                Free uses remaining: <span className="font-bold text-indigo-600">{FREE_LIMIT - usageCount}</span>
              </span>
            </div>
            <div className="inline-block bg-green-100 px-4 py-2 rounded-full">
              <span className="text-sm text-green-800 font-medium flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Powered by Groq - Lightning Fast!
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Original Job Description
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your boring, requirement-heavy job description here...

Example:
Senior Software Engineer

We are seeking a Senior Software Engineer with 10+ years of experience in Java, Python, C++, and JavaScript. Must have experience with cloud infrastructure, microservices, and leading teams. PhD preferred.

Requirements:
- 10+ years software development
- Expert in multiple languages
- Cloud architecture experience
..."
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <button
              onClick={optimizeJobDesc}
              disabled={loading || !input.trim()}
              className="w-full mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Optimize Job Description
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Optimized Version
              </h2>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {output ? (
              <div className="h-96 overflow-y-auto px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                  {output}
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Your optimized job description will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What This Tool Does:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Removes Bias</p>
                <p className="text-sm text-gray-600">Inclusive language that doesn't discourage qualified candidates</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Highlights Impact</p>
                <p className="text-sm text-gray-600">Leads with opportunity and growth, not just requirements</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Clear & Scannable</p>
                <p className="text-sm text-gray-600">Easy-to-read format that respects candidates' time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monetization CTA */}
        {usageCount >= FREE_LIMIT && (
          <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Monetize? 🚀</h3>
            <p className="mb-4">Add Stripe payment and charge $19 for 10 optimizations or $49/month unlimited!</p>
            <p className="text-sm opacity-90">This is your MVP - now go get customers!</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Powered by Groq + Llama 3.3 70B • Lightning fast responses • 100% free to start</p>
        </div>
      </div>
    </div>
  );
}
