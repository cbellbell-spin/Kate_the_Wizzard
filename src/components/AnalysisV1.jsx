import { useState } from 'react';

export default function AnalysisV1({ analysis, onContinue }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [skipped, setSkipped] = useState(false);

  if (!analysis) return null;

  const isNeutralOption = (option) => {
    const text = typeof option === 'string' ? option : option.text;
    const lower = text.toLowerCase();
    return (
      lower.includes("haven't figured") ||
      lower.includes("not sure") ||
      lower.includes("don't know") ||
      lower.includes("i haven't")
    );
  };

  const handleOptionSelect = (option, label) => {
    setSelectedOption(option);
    setSelectedLabel(label);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Fit Tier - Spectrum Badge */}
        {analysis.role_fit && (
          <section className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              {/* Uphill Battle */}
              <div
                className={`flex-1 px-4 py-3 text-center border ${
                  analysis.role_fit === 'Uphill Battle'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.role_fit === 'Uphill Battle' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Uphill Battle
                </span>
              </div>
              {/* Positioning Play */}
              <div
                className={`flex-1 px-4 py-3 text-center border-t border-b ${
                  analysis.role_fit === 'Positioning Play'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.role_fit === 'Positioning Play' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Positioning Play
                </span>
              </div>
              {/* Strong Fit */}
              <div
                className={`flex-1 px-4 py-3 text-center border ${
                  analysis.role_fit === 'Strong Fit'
                    ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                    : 'border-gray-300 opacity-30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  analysis.role_fit === 'Strong Fit' ? 'text-text-black' : 'text-gray-500'
                }`}>
                  Strong Fit
                </span>
              </div>
            </div>
            {analysis.role_fit && (
              <p className="mt-3 text-sm text-gray-600 italic">
                Here's what they're seeing:
              </p>
            )}
          </section>
        )}

        {/* Level Inference */}
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            Level Inference
          </h2>
          <p className="text-lg leading-relaxed text-text-black">{analysis.level_inference}</p>
        </section>

        {/* Complement Skill */}
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            Your Complement Skill
          </h2>
          <p className="text-lg leading-relaxed text-text-black">{analysis.complement_skill}</p>
        </section>

        {/* Fit Signals */}
        {analysis.fit_signals && analysis.fit_signals.length > 0 && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Fit Signals
            </h2>
            <ul className="space-y-4">
              {analysis.fit_signals.map((signal, index) => (
                <li key={index} className="border-l-2 border-gray-300 pl-4">
                  <span className="font-medium text-text-black">{signal.signal}</span>
                  <p className="text-gray-600 mt-1">{signal.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gaps */}
        {analysis.gaps && analysis.gaps.length > 0 && (
          <section className="mb-10">
            <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Key Gaps
            </h2>
            <ul className="space-y-4">
              {analysis.gaps.map((gap, index) => (
                <li key={index} className="border-l-2 border-accent-maroon pl-4">
                  <span className="font-medium text-text-black">{gap.gap}</span>
                  <p className="text-gray-600 mt-1">{gap.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Question 1 */}
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            A Question
          </h2>
          <p className="text-lg mb-6 text-text-black">{analysis.question_1.question_text}</p>
          <div className="grid grid-cols-1 gap-3">
            {analysis.question_1.options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option.text, option.label)}
                className={`p-5 text-left border transition-all ${
                  selectedLabel === option.label
                    ? 'border-accent-maroon bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                } ${
                  isNeutralOption(option) ? 'text-gray-400' : 'text-text-black'
                }`}
              >
                <span className="font-medium mr-2">{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-300">
          <button
            onClick={() => {
              setSkipped(true);
              onContinue(null);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={() => onContinue(selectedOption)}
            disabled={!selectedOption && !skipped}
            className="py-3 px-6 bg-accent-maroon text-white font-semibold hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
