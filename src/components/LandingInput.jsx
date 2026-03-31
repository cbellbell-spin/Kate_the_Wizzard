import { useState, useRef } from 'react';
import { parsePDFFile } from '../utils/pdfParser';

const RESUME_LIMIT = 12000;
const JD_LIMIT = 12000;
const COUNTER_WARNING_THRESHOLD = 200;

export default function LandingInput({ onAnalyze }) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({ resume: '', jobDescription: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);

    try {
      const text = await parsePDFFile(file);
      setPdfText(text);
      setResume(text);
      setErrors(prev => ({ ...prev, resume: '' }));
    } catch (error) {
      console.error('PDF parsing error:', error);
      setUseFallback(true);
    } finally {
      setIsParsing(false);
    }
  };

  const validateInputs = () => {
    const newErrors = { resume: '', jobDescription: '' };
    let isValid = true;

    const resumeText = useFallback ? resume : pdfText || resume;
    if (resumeText.length > RESUME_LIMIT) {
      newErrors.resume = "Your resume is longer than Kate needs. Try trimming it to your most recent 10 years.";
      isValid = false;
    }

    if (jobDescription.length > JD_LIMIT) {
      newErrors.jobDescription = "This is longer than needed. Try keeping it to the key requirements and responsibilities.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAnalyze = () => {
    if (!validateInputs()) return;

    const resumeText = useFallback ? resume : pdfText || resume;
    onAnalyze(resumeText, jobDescription, honeypot);
  };

  const isValid = resume.trim() && jobDescription.trim() && !errors.resume && !errors.jobDescription;

  const getCounterColor = (current, limit) => {
    const remaining = limit - current.length;
    if (remaining <= 0) return 'text-red-600';
    if (remaining <= COUNTER_WARNING_THRESHOLD) return 'text-[#c9a84c]';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-left text-text-black">
          Kate is the executive career coach you wish you'd had the whole time.
        </h1>
        <h2 className="text-lg text-gray-500 mb-12 text-left leading-relaxed">
          Kate works with you through every stage of your search. Today, she starts with your resume and a job description.
        </h2>

        {/* Honeypot field - hidden off-screen */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="fixed top-[-9999px] left-[-9999px]"
        />

        <div className="space-y-6">
          {/* Resume Input Section */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <label className="text-accent-maroon text-sm font-medium uppercase tracking-wide">
                Resume
              </label>
              <span className="text-xs text-gray-400">(required)</span>
              <span className="text-xs text-gray-400">--</span>
              {!useFallback ? (
                <button
                  type="button"
                  onClick={() => setUseFallback(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  paste text
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setUseFallback(false);
                    setPdfText('');
                    setFileName('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  upload PDF
                </button>
              )}
            </div>

            {!useFallback ? (
              <div className="space-y-3">
                <div className="border border-gray-300 bg-white p-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                    className="w-full py-3 px-4 border border-gray-300 text-left text-gray-600 hover:border-gray-400 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isParsing ? 'Parsing PDF...' : fileName || 'Upload PDF'}
                  </button>
                </div>

                {pdfText && (
                  <div className="p-3 bg-gray-100 border border-gray-200 text-sm text-gray-600">
                    PDF parsed successfully. {pdfText.length} characters extracted.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={resume}
                  onChange={(e) => {
                    setResume(e.target.value);
                    setErrors(prev => ({ ...prev, resume: '' }));
                  }}
                  placeholder="Paste your resume text here..."
                  className="w-full h-24 px-4 py-3 bg-white border border-gray-300 text-text-black placeholder-gray-400 focus:outline-none focus:border-accent-maroon transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <span className={`text-xs ${getCounterColor(resume.length, RESUME_LIMIT)}`}>
                    {RESUME_LIMIT - resume.length} characters remaining
                  </span>
                </div>
                {errors.resume && (
                  <p className="text-sm text-red-600 mt-1">{errors.resume}</p>
                )}
              </div>
            )}
          </div>

          {/* Job Description Input */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <label className="text-accent-maroon text-sm font-medium uppercase tracking-wide">
                Job Description
              </label>
              <span className="text-xs text-gray-400">(required)</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setErrors(prev => ({ ...prev, jobDescription: '' }));
              }}
              placeholder="Paste the job description here..."
              className="w-full h-24 px-4 py-3 bg-white border border-gray-300 text-text-black placeholder-gray-400 focus:outline-none focus:border-accent-maroon transition-colors resize-none"
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${getCounterColor(jobDescription.length, JD_LIMIT)}`}>
                {JD_LIMIT - jobDescription.length} characters remaining
              </span>
            </div>
            {errors.jobDescription && (
              <p className="text-sm text-red-600 mt-1">{errors.jobDescription}</p>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!isValid}
            className="w-full py-4 px-6 bg-accent-maroon text-white font-semibold hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
