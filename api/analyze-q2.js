const MODEL_NAME = 'claude-sonnet-4-6';
const API_CONFIG = {
  model: MODEL_NAME,
  anthropicVersion: '2023-06-01',
};

/**
 * Analyze Q2 - Generate second question based on first answer
 * Returns analysis update and question 2 based on accumulated context
 */
export default async function handler(req, res) {
  console.log('analyze-q2 invoked, ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDescription, v1Analysis, q1Answer, q1QuestionText } = req.body;

  if (!resume || !jobDescription || !v1Analysis || q1Answer === undefined || !q1QuestionText) {
    return res.status(400).json({
      error: 'Resume, job description, v1 analysis, q1 question text, and q1 answer are required'
    });
  }

  // ============================================
  // RATE LIMITING PLACEHOLDER
  // ============================================
  // Add per-session rate limiting logic here before the API call
  // Example: Check session tokens, implement cooldown, etc.
  // const rateLimitResult = await checkRateLimit(req, 'analyze-q2');
  // if (!rateLimitResult.allowed) {
  //   return res.status(429).json({ error: 'Rate limit exceeded' });
  // }
  // ============================================

  const SYSTEM_PROMPT = `You are Kate, a senior career coach running a quick-read analysis for a VP+ job seeker. You have deep experience in executive recruiting, hiring committee evaluation, and candidate positioning. You read job searches the way a hiring committee insider would — not the way a resume coach would.

Your voice is sharp, direct, and specific. You do not manufacture encouragement. You do not say "great experience" when you mean "this won't be enough for the roles you're targeting." You celebrate real strengths but your value is in telling people what polite friends and generic tools won't.

ANALYTICAL FRAMEWORK:
You evaluate fit using these lenses:
- Fit Tier: Strong Fit (strong match, no significant gaps), Positioning Play (credible candidate with one meaningful gap that smart positioning can close), or Uphill Battle (structural gaps that positioning alone won't fix — may still be worth pursuing under specific conditions, but go in with eyes open)
- Complement Skill: The specific capability this organization lacks that this candidate uniquely brings — the gap-fill, not a background summary
- Builder vs. Operator read: Which one does the role require, and which one does the candidate present as?
- Motivation alignment: Does this role match what the candidate likely needs next, or just what looks good on paper?
- Red flag awareness: Tenure gaps, domain mismatches, title inconsistencies — anything a hiring committee will notice before page two

When you identify gaps, name them precisely. "Lacks enterprise SaaS experience" is useful. "Could strengthen their background" is not.

When you reference the resume or JD, cite specific details — company names, years, scope numbers, JD language. The user must be able to see that you read their actual materials, not a template.

CONSTRAINTS:
- This is a wizard preview, not a full coaching session. Be incisive, not exhaustive.
- You are demonstrating Kate's analytical value. Every output should make the user think "this is sharper than what I'd get anywhere else."
- Em dashes are fine in Kate's own analytical voice. Do NOT use em dashes in any text the user would copy and use directly (resume lines, cover letter language, talking points, LinkedIn copy). Hiring committees and recruiters pattern-match AI-generated writing, and em dash overuse is a top tell.
- Kate's voice blends two modes: Boss Lady (she has seen hundreds of searches at this level and speaks with the authority of someone who knows exactly how hiring committees think) and genuine coach (she is unambiguously on the user's side and wants them to win). She is not neutral. She is not detached. She has opinions and she backs them with reasoning. No filler phrases, no hedge stacking, no corporate coaching language.
- All responses must be valid JSON matching the specified output schema. Return ONLY the JSON object — no markdown fencing, no preamble, no commentary outside the JSON.`;

  const USER_PROMPT = `CONTEXT FROM PREVIOUS ANALYSIS:
---
${JSON.stringify(v1Analysis, null, 2)}
---

JOB DESCRIPTION:
---
${jobDescription}
---

USER'S ANSWER TO QUESTION 1:
Question: ${q1QuestionText}
Selected: ${q1Answer || 'SKIPPED'}

TASK:
The user's answer to Question 1 tells you something about their positioning strategy (or lack of one). Use it to:

1. Update or sharpen any element of the initial analysis that this answer affects — a fit signal that gets stronger, a gap that shifts, a tier that should change
2. Generate Question 2: a second positioning diagnostic that probes a DIFFERENT dimension than Question 1

QUESTION 2 REQUIREMENTS:
- Must probe a different analytical dimension than Question 1 (if Q1 was about positioning narrative, Q2 might be about gap management strategy, or builder-vs-operator framing, or motivation alignment)
- Must reference specific details from the JD or the initial analysis
- Must include 4 options (A-D) representing meaningfully different strategic choices
- Include one honest "I haven't figured this out" option
- Should be informed by what the Q1 answer revealed — if Q1 showed the candidate has a clear positioning story, Q2 can probe deeper; if Q1 showed uncertainty, Q2 should probe the root of that uncertainty

OUTPUT SCHEMA (return valid JSON only):
{
  "analysis_update": "string — 2-3 sentences on what the Q1 answer changes or confirms about the initial read",
  "updated_fit_tier": "Strong Fit | Positioning Play | Uphill Battle (may be unchanged)",
  "question_2": {
    "question_text": "string — the question, referencing specifics",
    "context": "string — 1 sentence explaining what this question is designed to surface",
    "dimension": "string — label for what this probes (e.g., 'gap management', 'narrative framing', 'role-type alignment')",
    "options": [
      {"label": "A", "text": "string"},
      {"label": "B", "text": "string"},
      {"label": "C", "text": "string"},
      {"label": "D", "text": "string"}
    ]
  }
}`;

  const maxTokens = 2000;
  const temperature = 0.5;

  try {
    let response = await callAnthropicAPI(SYSTEM_PROMPT, USER_PROMPT, maxTokens, temperature);

    // Validate and retry once if needed
    const parsed = validateAndParse(response);
    if (!parsed) {
      console.log('First response not valid JSON, retrying...');
      const retryPrompt = USER_PROMPT + '\n\nYour previous response was not valid JSON. Return ONLY a JSON object matching the specified schema, with no additional text.';
      response = await callAnthropicAPI(SYSTEM_PROMPT, retryPrompt, maxTokens, temperature);
      const retryParsed = validateAndParse(response);
      if (!retryParsed) {
        return res.status(500).json({
          error: 'Failed to generate valid question after retry. Please try again.'
        });
      }
      return res.status(200).json(retryParsed);
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return res.status(500).json({ error: 'Question generation failed. Please try again.' });
  }
};

async function callAnthropicAPI(systemPrompt, userPrompt, maxTokens, temperature) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': API_CONFIG.anthropicVersion,
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function validateAndParse(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate expected schema
    const isValid =
      typeof parsed.analysis_update === 'string' &&
      typeof parsed.updated_fit_tier === 'string' &&
      ['Strong Fit', 'Positioning Play', 'Uphill Battle'].includes(parsed.updated_fit_tier) &&
      parsed.question_2 &&
      typeof parsed.question_2.question_text === 'string' &&
      typeof parsed.question_2.context === 'string' &&
      typeof parsed.question_2.dimension === 'string' &&
      Array.isArray(parsed.question_2.options) &&
      parsed.question_2.options.length === 4 &&
      parsed.question_2.options.every(o =>
        typeof o.label === 'string' && typeof o.text === 'string'
      );

    return isValid ? parsed : null;
  } catch {
    return null;
  }
}
