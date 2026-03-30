import { useState } from 'react';

export default function Conversion({ handoffSummary }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const setupSteps = [
    {
      number: '1',
      title: "You'll need Claude Pro or higher",
      description: 'claude.ai',
    },
    {
      number: '2',
      title: 'Download the Claude desktop app',
      description: null,
    },
    {
      number: '3',
      title: 'Install Cowork',
      description: null,
    },
    {
      number: '4',
      title: 'Add the Kate plugin',
      description: null,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-text-black">
            This is the preview. Here's the full experience.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Kate works through your entire job search with you — positioning, interview prep,
            negotiation, offer evaluation. This analysis is where that conversation starts.
          </p>
        </section>

        {/* Setup Steps */}
        <section className="mb-12">
          <div className="space-y-4">
            {setupSteps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="w-8 h-8 border border-accent-maroon text-accent-maroon flex items-center justify-center font-medium flex-shrink-0">
                  {step.number}
                </div>
                <div className="pt-1">
                  <p className="text-text-black">{step.title}</p>
                  {step.description && (
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Handoff Summary Section */}
        <section>
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            Start your first Kate session with this context
          </h2>
          <div className="bg-white border border-gray-300 p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {handoffSummary}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => copyToClipboard(handoffSummary)}
              className="py-2 px-4 border border-gray-300 text-gray-600 hover:text-text-black hover:border-gray-400 transition-colors text-sm"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <p className="text-sm text-gray-500">
              Paste this into Kate at the start of your first session.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
