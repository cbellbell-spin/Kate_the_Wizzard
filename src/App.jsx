import { useState, useCallback } from 'react';
import LandingInput from './components/LandingInput';
import Loading from './components/Loading';
import AnalysisV1 from './components/AnalysisV1';
import Question from './components/Question';
import FinalAnalysis from './components/FinalAnalysis';
import Conversion from './components/Conversion';

const STAGES = {
  LANDING: 0,
  LOADING_V1: 1,
  ANALYSIS_V1: 2,
  LOADING_Q2: 3,
  QUESTION_2: 4,
  LOADING_FINAL: 5,
  FINAL_ANALYSIS: 6,
  CONVERSION: 7,
  VALIDATION_ERROR: 8,
};

const FRIENDLY_ERRORS = {
  overloaded: "Kate is handling a lot of requests right now. Please wait a moment and try again.",
  rate_limit: "You've made too many requests. Please wait a moment and try again.",
  service_unavailable: "Kate is temporarily unavailable. Please try again in a few minutes.",
  network: "Unable to connect. Please check your internet connection and try again.",
  default: "Something unexpected happened. Please try again.",
};

function getFriendlyError(error) {
  const message = error?.message || String(error).toLowerCase();
  const status = error?.status || '';

  if (status === 529 || message.includes('overloaded') || message.includes('overload')) {
    return FRIENDLY_ERRORS.overloaded;
  }
  if (status === 503 || message.includes('service unavailable')) {
    return FRIENDLY_ERRORS.service_unavailable;
  }
  if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
    return FRIENDLY_ERRORS.rate_limit;
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch') || message.includes('econnrefused')) {
    return FRIENDLY_ERRORS.network;
  }
  return FRIENDLY_ERRORS.default;
}

const V1_LOADING_MESSAGES = [
  "Reading your materials...",
  "Checking the hiring committee's likely read...",
  "Identifying the gaps...",
];

const FINAL_LOADING_MESSAGES = [
  "Sharpening the analysis...",
  "Building your Kate handoff...",
];

function App() {
  const [stage, setStage] = useState(STAGES.LANDING);
  const [formData, setFormData] = useState({
    resume: '',
    jobDescription: '',
  });
  const [v1Analysis, setV1Analysis] = useState(null);
  const [q1Answer, setQ1Answer] = useState(null);
  const [q1Context, setQ1Context] = useState(null);
  const [q2Answer, setQ2Answer] = useState(null);
  const [q2Context, setQ2Context] = useState(null);
  const [q2Data, setQ2Data] = useState(null);
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleAnalyze = useCallback(async (resumeText, jobDescriptionText, honeypot) => {
    // Honeypot check - if filled, silently fail
    if (honeypot && honeypot.trim() !== '') {
      // Simulate brief processing then neutral error
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValidationError("Something went wrong. Please try again.");
      setStage(STAGES.VALIDATION_ERROR);
      return;
    }

    setFormData({ resume: resumeText, jobDescription: jobDescriptionText });
    setStage(STAGES.LOADING_V1);
    setError(null);
    setValidationError(null);

    try {
      const response = await fetch('/api/analyze-v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescriptionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();

      // Check valid_input flag
      if (data.valid_input === false) {
        setValidationError("Kate couldn't find a resume and job description in what you shared. Double-check your inputs and try again.");
        setStage(STAGES.VALIDATION_ERROR);
        return;
      }

      setV1Analysis(data);
      setStage(STAGES.ANALYSIS_V1);
    } catch (err) {
      setValidationError(getFriendlyError(err));
      setStage(STAGES.VALIDATION_ERROR);
    }
  }, []);

  const handleQ1Continue = useCallback(async (answer, additionalContext = null) => {
    setQ1Answer(answer);
    setQ1Context(additionalContext);
    setStage(STAGES.LOADING_Q2);
    setError(null);

    try {
      const response = await fetch('/api/analyze-q2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: formData.resume,
          jobDescription: formData.jobDescription,
          v1Analysis,
          q1Answer: answer,
          q1QuestionText: v1Analysis.question_1.question_text,
          additionalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Question generation failed');
      }

      const data = await response.json();
      setQ2Data(data);
      setStage(STAGES.QUESTION_2);
    } catch (err) {
      setError(getFriendlyError(err));
      setStage(STAGES.ANALYSIS_V1);
    }
  }, [formData, v1Analysis]);

  const handleQ2Continue = useCallback(async (answer, additionalContext = null) => {
    setQ2Answer(answer);
    setQ2Context(additionalContext);
    setStage(STAGES.LOADING_FINAL);
    setError(null);

    try {
      const response = await fetch('/api/analyze-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: formData.resume,
          jobDescription: formData.jobDescription,
          v1Analysis,
          q2Data,
          q1Answer,
          q1Context,
          q2Answer: answer,
          q2Context: additionalContext,
          q1QuestionText: v1Analysis.question_1.question_text,
          q2QuestionText: q2Data.question_2.question_text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Final analysis failed');
      }

      const data = await response.json();
      setFinalAnalysis(data);
      setStage(STAGES.FINAL_ANALYSIS);
    } catch (err) {
      setError(getFriendlyError(err));
      setStage(STAGES.QUESTION_2);
    }
  }, [formData, v1Analysis, q2Data, q1Answer, q1Context]);

  const handleMeetKate = useCallback(() => {
    setStage(STAGES.CONVERSION);
  }, []);

  const handleReset = useCallback(() => {
    setStage(STAGES.LANDING);
    setFormData({ resume: '', jobDescription: '' });
    setV1Analysis(null);
    setQ1Answer(null);
    setQ1Context(null);
    setQ2Answer(null);
    setQ2Context(null);
    setQ2Data(null);
    setFinalAnalysis(null);
    setError(null);
    setValidationError(null);
  }, []);

  const handleTryAgain = useCallback(() => {
    // Preserve form data, return to landing
    setStage(STAGES.LANDING);
    setValidationError(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-bg-offwhite text-text-black flex flex-col">
      {/* Validation Error State */}
      {stage === STAGES.VALIDATION_ERROR && (
        <div className="min-h-screen px-6 py-12 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-xl mb-8 text-text-black leading-relaxed">
              {validationError || error || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={handleTryAgain}
              className="py-4 px-8 bg-accent-maroon text-white font-semibold text-lg hover:bg-red-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Standard Error Banner */}
      {error && stage !== STAGES.VALIDATION_ERROR && (
        <div className="fixed top-0 left-0 right-0 bg-red-900/80 text-white px-4 py-3 text-center z-50">
          {error}
          <button
            onClick={handleReset}
            className="ml-4 underline hover:no-underline"
          >
            Start over
          </button>
        </div>
      )}

      {stage === STAGES.LANDING && (
        <LandingInput onAnalyze={handleAnalyze} />
      )}

      {stage === STAGES.LOADING_V1 && (
        <Loading messages={V1_LOADING_MESSAGES} />
      )}

      {stage === STAGES.ANALYSIS_V1 && v1Analysis && (
        <AnalysisV1
          analysis={v1Analysis}
          onContinue={handleQ1Continue}
        />
      )}

      {stage === STAGES.LOADING_Q2 && (
        <Loading messages={["Generating next question..."]} />
      )}

      {stage === STAGES.QUESTION_2 && q2Data && (
        <Question
          questionData={q2Data.question_2}
          onContinue={handleQ2Continue}
        />
      )}

      {stage === STAGES.LOADING_FINAL && (
        <Loading messages={FINAL_LOADING_MESSAGES} />
      )}

      {stage === STAGES.FINAL_ANALYSIS && finalAnalysis && (
        <FinalAnalysis
          analysis={finalAnalysis}
          onMeetKate={handleMeetKate}
        />
      )}

      {stage === STAGES.CONVERSION && finalAnalysis && (
        <Conversion />
      )}
    </div>
  );
}

export default App;
