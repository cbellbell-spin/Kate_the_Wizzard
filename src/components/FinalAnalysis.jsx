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

  const severityColors = {
    critical: 'text-red-700 bg-red-50 border-red-200',
    significant: 'text-orange-700 bg-orange-50 border-orange-200',
    manageable: 'text-green-700 bg-green-50 border-green-200',
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Fit Tier Badge */}
        {analysis.fit_tier && (
          <section className="mb-6">
            <span className="inline-block px-4 py-2 border border-accent-maroon text-accent-maroon text-sm font-semibold">
              {analysis.fit_tier}
            </span>
          </section>
        )}

        {/* Level Inference */}
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            Level Inference
          </h2>
          <p className="text-xl leading-relaxed text-text-black">{analysis.level_inference}</p>
        </section>

        {/* Hiring Committee Read */}
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            The Hiring Committee's Read
          </h2>
          <p className="text-lg leading-relaxed text-text-black">{analysis.hiring_committee_read}</p>
        </section>

        {/* Complement Skill */}
        {analysis.complement_skill && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Your Complement Skill
            </h2>
            <p className="text-lg leading-relaxed text-text-black">{analysis.complement_skill}</p>
          </section>
        )}

        {/* Gaps */}
        {analysis.gaps && analysis.gaps.length > 0 && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Key Gaps
            </h2>
            <ul className="space-y-5">
              {analysis.gaps.map((gap, index) => (
                <li key={index} className="border-l-2 border-accent-maroon pl-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-lg text-text-black">{gap.label}</span>
                    {gap.severity && (
                      <span className={`text-xs px-2 py-0.5 border ${severityColors[gap.severity] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                        {gap.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{gap.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* What Strong Looks Like */}
        {analysis.what_strong_looks_like && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              What Strong Looks Like
            </h2>
            <p className="text-lg leading-relaxed text-text-black">{analysis.what_strong_looks_like}</p>
          </section>
        )}

        {/* Priority Action */}
        {analysis.priority_action && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Priority Action
            </h2>
            <p className="text-lg leading-relaxed text-text-black">{analysis.priority_action}</p>
          </section>
        )}

        {/* Handoff Summary */}
        {analysis.handoff_summary && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-accent-maroon text-sm font-medium uppercase tracking-wide">
                Handoff Summary
              </h2>
            </div>
            <div className="bg-white border border-gray-300 p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis.handoff_summary}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(analysis.handoff_summary)}
              className="mt-4 py-2 px-4 border border-gray-300 text-gray-600 hover:text-text-black hover:border-gray-400 transition-colors text-sm"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </section>
        )}

        {/* CTA */}
        <div className="pt-8 border-t border-gray-300 text-center">
          <button
            onClick={onMeetKate}
            className="py-4 px-8 bg-accent-maroon text-white font-semibold text-lg hover:bg-red-900 transition-colors"
          >
            Meet Kate
          </button>
        </div>
      </div>
    </div>
  );
}
