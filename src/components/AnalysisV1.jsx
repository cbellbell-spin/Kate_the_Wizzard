import { useState } from 'react';
import Question from './Question';

export default function AnalysisV1({ analysis, onContinue }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [skipped, setSkipped] = useState(false);

  if (!analysis) return null;

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Level Inference */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            Level Inference
          </h2>
          <p className="text-lg leading-relaxed">{analysis.level_inference}</p>
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
          <ul className="space-y-4">
            {analysis.gaps.map((gap, index) => (
              <li key={index} className="border-l-2 border-accent-gold pl-4">
                <span className="font-medium text-text-offwhite">{gap.label}</span>
                <p className="text-gray-400 mt-1">{gap.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Question 1 */}
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            A Question
          </h2>
          <p className="text-lg mb-6">{analysis.question_1.text}</p>
          <div className="grid grid-cols-1 gap-3">
            {analysis.question_1.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`p-5 text-left border transition-all ${
                  selectedOption === option
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                } ${
                  option.toLowerCase().includes("haven't figured") ||
                  option.toLowerCase().includes("not sure") ||
                  option.toLowerCase().includes("don't know")
                    ? 'text-gray-400'
                    : 'text-text-offwhite'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <button
            onClick={() => {
              setSkipped(true);
              onContinue(null);
            }}
            className="text-gray-500 hover:text-gray-400 transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={() => onContinue(selectedOption)}
            disabled={!selectedOption && !skipped}
            className="py-3 px-6 bg-accent-gold text-bg-dark font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
