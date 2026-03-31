const MODEL_NAME = 'claude-sonnet-4-6';
const API_CONFIG = {
  model: MODEL_NAME,
  anthropicVersion: '2023-06-01',
};

const RESUME_LIMIT = 12000;
const JD_LIMIT = 12000;
const CONTEXT_LIMIT = 1000;

/**
 * Analyze Final - Complete analysis with all context
 * Returns comprehensive final analysis with handoff summary
 *
 * INPUT DELIMITER PATTERN:
 * All user-supplied inputs are wrapped in XML-style delimiters:
 * <resume>{{resume_text}}</resume>
 * <job_description>{{jd_text}}</job_description>
 * <q1_answer>{{q1_answer_text}}</q1_answer>
 * <q2_answer>{{q2_answer_text}}</q2_answer>
 * <additional_context>{{context_text}}</additional_context> (only if provided for either question)
 */
export default async function handler(req, res) {
  console.log('analyze-final invoked, ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDescription, v1Analysis, q2Data, q1Answer, q2Answer, q1QuestionText, q2QuestionText, q1Context, q2Context, honeypot } = req.body;

  // Honeypot check - silently accept but don't process
  if (honeypot && honeypot.trim() !== '') {
    console.log('Honeypot triggered, silently rejecting');
    return res.status(200).json({});
  }

  if (!resume || !jobDescription || !v1Analysis ||
      q1Answer === undefined || q2Answer === undefined) {
    return res.status(400).json({
      error: 'All context (resume, JD, v1, q1, q2) is required'
    });
  }

  // Server-side character limit validation
  if (resume.length > RESUME_LIMIT) {
    return res.status(400).json({
      error: 'Resume exceeds maximum length of ' + RESUME_LIMIT + ' characters'
    });
  }

  if (jobDescription.length > JD_LIMIT) {
    return res.status(400).json({
      error: 'Job description exceeds maximum length of ' + JD_LIMIT + ' characters'
    });
  }

  if (q1Context && q1Context.length > CONTEXT_LIMIT) {
    return res.status(400).json({
      error: 'Q1 context exceeds maximum length of ' + CONTEXT_LIMIT + ' characters'
    });
  }

  if (q2Context && q2Context.length > CONTEXT_LIMIT) {
    return res.status(400).json({
      error: 'Q2 context exceeds maximum length of ' + CONTEXT_LIMIT + ' characters'
    });
  }

  // ============================================
  // RATE LIMITING PLACEHOLDER
  // ============================================
  // Add per-session rate limiting logic here before the API call
  // Example: Check session tokens, implement cooldown, etc.
  // const rateLimitResult = await checkRateLimit(req, 'analyze-final');
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

  // Build user prompt with XML delimiters
  let userPromptContent = `INPUT DELIMITER PATTERN:
All user inputs are wrapped in XML-style tags. Parse these carefully.

<resume>
${resume}
</resume>

<job_description>
${jobDescription}
</job_description>

<q1_answer>
${q1Answer || 'SKIPPED'}
</q1_answer>`;

  if (q1Context && q1Context.trim()) {
    userPromptContent += `

<additional_context>
Q1 Context: ${q1Context}
</additional_context>`;
  }

  userPromptContent += `

<q2_answer>
${q2Answer || 'SKIPPED'}
</q2_answer>`;

  if (q2Context && q2Context.trim()) {
    userPromptContent += `

<additional_context>
Q2 Context: ${q2Context}
</additional_context>`;
  }

  userPromptContent += `

TASK:
Produce the final sharpened analysis incorporating both answers. This is the deliverable the user will see and the basis for their decision to install Kate for a full coaching session.

The analysis must feel like a hiring committee insider briefing — not a resume review, not a gap list, but a strategic read on this candidacy.

The handoff summary must give plugin Kate enough context to start a full session without re-asking what the wizard already covered.

OUTPUT SCHEMA (return valid JSON only):
{
  "level_inference": "string — 1 sentence on level alignment between candidate and role",
  "fit_tier": "Strong Fit | Positioning Play | Uphill Battle",
  "hiring_committee_read": "string — 2-3 sentences: how a hiring committee would likely read this candidate on paper. Be specific about what lands and what raises questions.",
  "gaps": [
    {
      "label": "string — gap name",
      "detail": "string — 1-2 sentences, specific to this resume and JD",
      "severity": "critical | significant | manageable"
    }
  ],
  "what_strong_looks_like": "string — 2-3 sentences describing the version of this candidate that would be a clear hire for this specific role. Not generic VP advice. The delta between where they are and what this section describes should be visible.",
  "complement_skill": "string — 1 sentence: what this candidate brings that the org likely lacks",
  "priority_action": "string — 1 sentence: the single most important thing this candidate should do before applying or interviewing",
  "handoff_summary": "string — A paragraph formatted for pasting into Kate's first session. Should include: fit tier, key gaps identified, positioning direction suggested by the user's MC answers, complement skill, and any open questions the wizard surfaced but did not resolve. Write it as if Kate is reading her own notes from a colleague, not as if the user is summarizing for Kate."
}`;

  const USER_PROMPT = userPromptContent;

  const maxTokens = 2500;
  const temperature = 0.3;

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
          error: 'Failed to generate valid analysis after retry. Please try again.'
        });
      }
      return res.status(200).json(retryParsed);
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Anthropic API error:', error);
    return res.status(500).json({ error: 'Final analysis failed. Please try again.' });
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
      typeof parsed.level_inference === 'string' &&
      typeof parsed.fit_tier === 'string' &&
      ['Strong Fit', 'Positioning Play', 'Uphill Battle'].includes(parsed.fit_tier) &&
      typeof parsed.hiring_committee_read === 'string' &&
      Array.isArray(parsed.gaps) &&
      parsed.gaps.length > 0 &&
      parsed.gaps.every(g =>
        typeof g.label === 'string' &&
        typeof g.detail === 'string' &&
        typeof g.severity === 'string' &&
        ['critical', 'significant', 'manageable'].includes(g.severity)
      ) &&
      typeof parsed.what_strong_looks_like === 'string' &&
      typeof parsed.complement_skill === 'string' &&
      typeof parsed.priority_action === 'string' &&
      typeof parsed.handoff_summary === 'string';

    return isValid ? parsed : null;
  } catch {
    return null;
  }
}
