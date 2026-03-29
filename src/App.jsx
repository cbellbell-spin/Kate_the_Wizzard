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
};

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
  const [q2Answer, setQ2Answer] = useState(null);
  const [q2Data, setQ2Data] = useState(null);
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async (resumeText, jobDescriptionText) => {
    setFormData({ resume: resumeText, jobDescription: jobDescriptionText });
    setStage(STAGES.LOADING_V1);
    setError(null);

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
      setV1Analysis(data);
      setStage(STAGES.ANALYSIS_V1);
    } catch (err) {
      setError(err.message);
      setStage(STAGES.LANDING);
    }
  }, []);

  const handleQ1Continue = useCallback(async (answer) => {
    setQ1Answer(answer);
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
      setError(err.message);
      setStage(STAGES.ANALYSIS_V1);
    }
  }, [formData, v1Analysis]);

  const handleQ2Continue = useCallback(async (answer) => {
    setQ2Answer(answer);
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
          q1Answer,
          q2Answer: answer,
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
      setError(err.message);
      setStage(STAGES.QUESTION_2);
    }
  }, [formData, v1Analysis, q1Answer]);

  const handleMeetKate = useCallback(() => {
    setStage(STAGES.CONVERSION);
  }, []);

  const handleReset = useCallback(() => {
    setStage(STAGES.LANDING);
    setFormData({ resume: '', jobDescription: '' });
    setV1Analysis(null);
    setQ1Answer(null);
    setQ2Answer(null);
    setQ2Data(null);
    setFinalAnalysis(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-text-offwhite flex flex-col">
      {error && (
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
        <Conversion handoffSummary={finalAnalysis.handoff_summary} />
      )}
    </div>
  );
}

export default App;
