import { useState } from 'react';

export default function FinalAnalysis({ analysis, onMeetKate }) {
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Level Inference */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            Level Inference
          </h2>
          <p className="text-xl leading-relaxed font-medium">{analysis.level_inference}</p>
        </section>

        {/* Hiring Committee Read */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            The Hiring Committee's Read
          </h2>
          <p className="text-lg leading-relaxed">{analysis.hiring_committee_read}</p>
        </section>

        {/* Gaps */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            Key Gaps
          </h2>
          <ul className="space-y-5">
            {analysis.gaps.map((gap, index) => (
              <li key={index} className="border-l-2 border-accent-gold pl-4">
                <span className="font-semibold text-lg text-text-offwhite">{gap.label}</span>
                <p className="text-gray-400 mt-1 leading-relaxed">{gap.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* What Strong Looks Like */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            What Strong Looks Like
          </h2>
          <p className="text-lg leading-relaxed">{analysis.what_strong_looks_like}</p>
        </section>

        {/* Priority Action */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            Priority Action
          </h2>
          <p className="text-lg leading-relaxed">{analysis.priority_action}</p>
        </section>

        {/* Handoff Summary */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-accent-gold text-sm font-medium uppercase tracking-wide">
              Handoff Summary
            </h2>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {analysis.handoff_summary}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(analysis.handoff_summary)}
            className="mt-4 py-2 px-4 border border-gray-700 text-gray-400 hover:text-text-offwhite hover:border-gray-600 transition-colors text-sm"
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </section>

        {/* CTA */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <button
            onClick={onMeetKate}
            className="py-4 px-8 bg-accent-gold text-bg-dark font-semibold text-lg hover:bg-yellow-600 transition-colors"
          >
            Meet Kate
          </button>
        </div>
      </div>
    </div>
  );
}
