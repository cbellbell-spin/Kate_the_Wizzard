import { useState, useRef } from 'react';
import { parsePDFFile } from '../utils/pdfParser';

export default function LandingInput({ onAnalyze }) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState('');
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
    } catch (error) {
      console.error('PDF parsing error:', error);
      setUseFallback(true);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = () => {
    const resumeText = useFallback ? resume : pdfText || resume;
    onAnalyze(resumeText, jobDescription);
  };

  const isValid = resume.trim() && jobDescription.trim();

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-left">
          Kate reads your resume the way a hiring committee does.
        </h1>
        <p className="text-lg text-gray-400 mb-12 text-left">
          Paste your resume and the job description. Kate will tell you what they see.
        </p>

        <div className="space-y-8">
          {/* Resume Input Section */}
          <div>
            <label className="block text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
              Resume
            </label>

            {!useFallback ? (
              <div className="space-y-4">
                <div className="border border-gray-700 bg-gray-900 p-4">
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
                    className="w-full py-3 px-4 border border-gray-600 text-left text-gray-300 hover:border-gray-500 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isParsing ? 'Parsing PDF...' : fileName || 'Upload PDF'}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-bg-dark text-gray-500 text-sm">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUseFallback(true)}
                  className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors"
                >
                  If your PDF doesn't parse cleanly, paste your resume text here.
                </button>

                {pdfText && (
                  <div className="mt-4 p-3 bg-gray-900 border border-gray-700 text-sm text-gray-400">
                    PDF parsed successfully. {pdfText.length} characters extracted.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 text-text-offwhite placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseFallback(false);
                    setPdfText('');
                    setFileName('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                >
                  Use PDF upload instead
                </button>
              </div>
            )}
          </div>

          {/* Job Description Input */}
          <div>
            <label className="block text-accent-gold text-sm font-medium mb-3 uppercase tracking-wide">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-700 text-text-offwhite placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors resize-none"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!isValid}
            className="w-full py-4 px-6 bg-accent-gold text-bg-dark font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
