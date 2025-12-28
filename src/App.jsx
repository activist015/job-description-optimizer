import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Copy, Check, Zap, Mail, MessageCircle, Key, X } from 'lucide-react';

export default function JobDescOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState(''); // '10pack' or 'unlimited'
  const [remainingOptimizations, setRemainingOptimizations] = useState(0);

  const FREE_LIMIT = 2;
  const ACTIVATION_CODES = {
    // 10-pack codes
    'JOB10-': '10pack',
    // Unlimited monthly codes
    'JOBUNLIMITED-': 'unlimited'
  };

  // Load saved state from memory
  useEffect(() => {
    const saved = {
      usageCount: parseInt(sessionStorage.getItem('usageCount') || '0'),
      isPremium: sessionStorage.getItem('isPremium') === 'true',
      premiumType: sessionStorage.getItem('premiumType') || '',
      remainingOptimizations: parseInt(sessionStorage.getItem('remainingOptimizations') || '0')
    };
    
    setUsageCount(saved.usageCount);
    setIsPremium(saved.isPremium);
    setPremiumType(saved.premiumType);
    setRemainingOptimizations(saved.remainingOptimizations);
  }, []);

  // Save state to memory
  const saveState = (updates) => {
    if (updates.usageCount !== undefined) {
      sessionStorage.setItem('usageCount', updates.usageCount.toString());
      setUsageCount(updates.usageCount);
    }
    if (updates.isPremium !== undefined) {
      sessionStorage.setItem('isPremium', updates.isPremium.toString());
      setIsPremium(updates.isPremium);
    }
    if (updates.premiumType !== undefined) {
      sessionStorage.setItem('premiumType', updates.premiumType);
      setPremiumType(updates.premiumType);
    }
    if (updates.remainingOptimizations !== undefined) {
      sessionStorage.setItem('remainingOptimizations', updates.remainingOptimizations.toString());
      setRemainingOptimizations(updates.remainingOptimizations);
    }
  };

  const handleActivation = () => {
    const code = activationCode.trim().toUpperCase();
    
    // Check for 10-pack codes
    if (code.startsWith('JOB10-')) {
      saveState({
        isPremium: true,
        premiumType: '10pack',
        remainingOptimizations: 10,
        usageCount: 0
      });
      setShowActivation(false);
      setShowPricing(false);
      setActivationCode('');
      alert('✅ 10-Pack activated! You now have 10 optimizations.');
    }
    // Check for unlimited codes
    else if (code.startsWith('JOBUNLIMITED-')) {
      saveState({
        isPremium: true,
        premiumType: 'unlimited',
        remainingOptimizations: 999999,
        usageCount: 0
      });
      setShowActivation(false);
      setShowPricing(false);
      setActivationCode('');
      alert('✅ Unlimited plan activated! Enjoy unlimited optimizations.');
    }
    else {
      setError('Invalid activation code. Please check and try again.');
    }
  };

  const optimizeJobDesc = async () => {
    if (!input.trim()) {
      setError('Please paste a job description first');
      return;
    }

    // Check if user has available optimizations
    if (!isPremium && usageCount >= FREE_LIMIT) {
      setShowPricing(true);
      return;
    }

    if (isPremium && premiumType === '10pack' && remainingOptimizations <= 0) {
      setShowPricing(true);
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
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
      
      // Update usage counts
      if (!isPremium) {
        saveState({ usageCount: usageCount + 1 });
      } else if (premiumType === '10pack') {
        saveState({ 
          remainingOptimizations: remainingOptimizations - 1,
          usageCount: usageCount + 1
        });
      } else {
        saveState({ usageCount: usageCount + 1 });
      }
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

  const getRemainingUses = () => {
    if (isPremium && premiumType === 'unlimited') return '∞';
    if (isPremium && premiumType === '10pack') return remainingOptimizations;
    return FREE_LIMIT - usageCount;
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
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm text-gray-600">
                {isPremium ? (
                  <>
                    {premiumType === 'unlimited' ? (
                      <span className="font-bold text-green-600">✨ Unlimited Plan</span>
                    ) : (
                      <>Remaining: <span className="font-bold text-indigo-600">{getRemainingUses()}</span></>
                    )}
                  </>
                ) : (
                  <>Free uses: <span className="font-bold text-indigo-600">{getRemainingUses()}</span></>
                )}
              </span>
            </div>
            <div className="inline-block bg-green-100 px-4 py-2 rounded-full">
              <span className="text-sm text-green-800 font-medium flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Powered by Groq AI
              </span>
            </div>
            {!isPremium && (
              <button
                onClick={() => setShowPricing(true)}
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition"
              >
                Upgrade to Premium
              </button>
            )}
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

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Powered by Groq + Llama 3.3 70B • Lightning fast responses</p>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
                <button
                  onClick={() => setShowPricing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* 10-Pack Plan */}
                <div className="border-2 border-indigo-200 rounded-lg p-6 hover:border-indigo-400 transition">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">10-Pack</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-indigo-600">$19</span>
                    </div>
                    <p className="text-gray-600 mt-2">10 Job Optimizations</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">10 AI-powered optimizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Perfect for small teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">$1.90 per optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Never expires</span>
                    </li>
                  </ul>
                  <a
                    href="mailto: jibrinfaisal606@gmail.com?subject=Job Optimizer - 10 Pack Purchase&body=Hi! I'd like to purchase the 10-pack for $19. Please send me the activation code."
                    className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
                  >
                    <Mail className="w-5 h-5 inline mr-2" />
                    Contact via Email
                  </a>
                  <a
                    href="https://wa.me/2348105131734?text=Hi!%20I'd%20like%20to%20purchase%20the%2010-pack%20for%20$19"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-3 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition text-center"
                  >
                    <MessageCircle className="w-5 h-5 inline mr-2" />
                    Contact via WhatsApp
                  </a>
                </div>

                {/* Unlimited Plan */}
                <div className="border-2 border-purple-300 rounded-lg p-6 hover:border-purple-500 transition relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Unlimited</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-purple-600">$49</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-gray-600 mt-2">Unlimited Optimizations</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited optimizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Perfect for agencies & recruiters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Cancel anytime</span>
                    </li>
                  </ul>
                  <a
                    href="mailto:your-email@example.com?subject=Job Optimizer - Unlimited Plan&body=Hi! I'd like to subscribe to the unlimited plan for $49/month. Please send me the activation code."
                    className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition text-center"
                  >
                    <Mail className="w-5 h-5 inline mr-2" />
                    Contact via Email
                  </a>
                  <a
                    href="https://wa.me/YOUR_WHATSAPP_NUMBER?text=Hi!%20I'd%20like%20to%20subscribe%20to%20the%20unlimited%20plan%20for%20$49/month"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-3 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition text-center"
                  >
                    <MessageCircle className="w-5 h-5 inline mr-2" />
                    Contact via WhatsApp
                  </a>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <button
                  onClick={() => {
                    setShowPricing(false);
                    setShowActivation(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  Already have an activation code?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Enter Activation Code</h2>
              <button
                onClick={() => setShowActivation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Enter the activation code you received after purchase.
            </p>
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="JOB10-XXXXX or JOBUNLIMITED-XXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleActivation()}
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleActivation}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Activate
            </button>
            <button
              onClick={() => {
                setShowActivation(false);
                setShowPricing(true);
              }}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
