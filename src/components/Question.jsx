import { useState } from 'react';

export default function Question({ questionData, onContinue }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [skipped, setSkipped] = useState(false);

  if (!questionData) return null;

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
        <section className="mb-10">
          <h2 className="text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
            Another Question
          </h2>
          <p className="text-xl mb-8 text-text-black">{questionData.question_text}</p>

          <div className="grid grid-cols-1 gap-4">
            {questionData.options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option.text, option.label)}
                className={`p-6 text-left border transition-all ${
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
