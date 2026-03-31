import { useState } from 'react';

const CONTEXT_LIMIT = 1000;
const COUNTER_WARNING_THRESHOLD = 200;

export default function Question({ questionData, onContinue }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [skipped, setSkipped] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');
  const [showContext, setShowContext] = useState(false);

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

  const formatAnswerText = (text) => {
    const colonIndex = text.indexOf(':');
    const dashIndex = text.indexOf('—');
    const splitIndex = colonIndex !== -1 && dashIndex !== -1
      ? Math.min(colonIndex, dashIndex)
      : colonIndex !== -1
        ? colonIndex
        : dashIndex;

    if (splitIndex === -1) {
      return <span>{text}</span>;
    }

    return (
      <>
        <span className="font-semibold">{text.slice(0, splitIndex + 1)}</span>
        {text.slice(splitIndex + 1)}
      </>
    );
  };

  const handleOptionSelect = (option, label) => {
    setSelectedOption(option);
    setSelectedLabel(label);
    setShowContext(true);
  };

  const getCounterColor = (current, limit) => {
    const remaining = limit - current.length;
    if (remaining <= 0) return 'text-red-600';
    if (remaining <= COUNTER_WARNING_THRESHOLD) return 'text-[#c9a84c]';
    return 'text-gray-400';
  };

  const handleContinue = () => {
    const contextText = additionalContext.trim() || null;
    onContinue(selectedOption, contextText);
  };

  const handleSkip = () => {
    setSkipped(true);
    setShowContext(true);
    // Don't immediately continue - show context field so user can optionally add context
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-accent-maroon text-sm font-medium uppercase tracking-wide">
              Another Question
            </h2>
            <span className="text-sm text-gray-400">2 of 2</span>
          </div>
          <div className="h-[3px] flex gap-1 mb-6 rounded-full overflow-hidden">
            <div className="flex-1 bg-[#8B2635] rounded-full"></div>
            <div className="flex-1 bg-[#E5E7EB] rounded-full"></div>
          </div>
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
                  isNeutralOption(option)
                    ? 'italic text-[#6B7280] bg-[rgba(0,0,0,0.015)] border-[#E5E0D8]'
                    : 'text-text-black'
                }`}
              >
                <span className="font-medium mr-2">{option.label}.</span>
                {formatAnswerText(option.text)}
              </button>
            ))}
          </div>
        </section>

        {/* Additional Context Field - shown after selection */}
        {showContext && (
          <section className="mb-10">
            <label className="block text-accent-maroon text-sm font-medium mb-3 uppercase tracking-wide">
              Want to add context? (optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Anything Kate should know that isn't in your resume or the JD..."
              className="w-full h-32 px-4 py-3 bg-white border border-gray-300 text-text-black placeholder-gray-400 focus:outline-none focus:border-accent-maroon transition-colors resize-none"
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${getCounterColor(additionalContext.length, CONTEXT_LIMIT)}`}>
                {CONTEXT_LIMIT - additionalContext.length} characters remaining
              </span>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-300">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:bg-[rgba(0,0,0,0.04)] transition-colors text-sm px-2 py-1 underline"
          >
            Skip this question
          </button>
          <button
            onClick={handleContinue}
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
