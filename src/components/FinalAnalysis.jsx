export default function FinalAnalysis({ analysis, onMeetKate }) {
  if (!analysis) return null;

  const severityColors = {
    critical: 'text-red-700 bg-red-50 border-red-200',
    significant: 'text-orange-700 bg-orange-50 border-orange-200',
    manageable: 'text-green-700 bg-green-50 border-green-200',
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Role Fit Spectrum Badge */}
        {analysis.fit_tier && (
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              {/* Uphill Battle */}
              <div
                className={`flex-1 px-4 py-3 text-center border ${
                  analysis.fit_tier === 'Uphill Battle'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.fit_tier === 'Uphill Battle' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Uphill Battle
                </span>
              </div>
              {/* Positioning Play */}
              <div
                className={`flex-1 px-4 py-3 text-center border-t border-b ${
                  analysis.fit_tier === 'Positioning Play'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.fit_tier === 'Positioning Play' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Positioning Play
                </span>
              </div>
              {/* Strong Fit */}
              <div
                className={`flex-1 px-4 py-3 text-center border ${
                  analysis.fit_tier === 'Strong Fit'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.fit_tier === 'Strong Fit' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Strong Fit
                </span>
              </div>
            </div>
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

        {/* CTA */}
        <div className="pt-8 border-t border-gray-300 text-center">
          <p className="text-lg text-gray-600 mb-6 italic">
            Kate just showed you where you stand. She can work with you on what to do about it.
          </p>
          <button
            onClick={onMeetKate}
            className="py-4 px-8 bg-accent-maroon text-white font-semibold text-lg hover:bg-red-900 transition-colors"
          >
            Keep working with Kate
          </button>
        </div>
      </div>
    </div>
  );
}
