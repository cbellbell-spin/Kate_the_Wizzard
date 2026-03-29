import { useState } from 'react';

export default function Question({ questionData, onContinue }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [skipped, setSkipped] = useState(false);

  if (!questionData) return null;

  const isNeutralOption = (option) => {
    const lower = option.toLowerCase();
    return (
      lower.includes("haven't figured") ||
      lower.includes("not sure") ||
      lower.includes("don't know") ||
      lower.includes("i don't")
    );
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <section className="mb-10">
          <h2 className="text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
            Another Question
          </h2>
          <p className="text-xl mb-8">{questionData.text}</p>

          <div className="grid grid-cols-1 gap-4">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`p-6 text-left border transition-all ${
                  selectedOption === option
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                } ${
                  isNeutralOption(option) ? 'text-gray-400' : 'text-text-offwhite'
                }`}
              >
                <span className="text-lg">{option}</span>
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
