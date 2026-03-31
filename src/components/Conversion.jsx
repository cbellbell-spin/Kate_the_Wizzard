import { useState, useEffect } from 'react';

const TYPEFORM_FORM_ID = '01KKDCN07K8DBXFGPBSXM4359S';

export default function Conversion() {
  const [showTypeform, setShowTypeform] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      label: 'Fit Assessment',
      description: 'Kate interviews you once about your background and goals, then evaluates any role you\'re considering. No more prepping for jobs that were never the right fit.',
    },
    {
      label: 'Interview Prep',
      description: 'Kate helps you build a library of specific, compelling stories from your experience, then pressure-tests them until they\'re tight enough to hold up in the room.',
    },
    {
      label: 'Post-Interview Debrief',
      description: 'Share a transcript and Kate tells you what landed, where you left value on the table, and what the interviewer likely walked away thinking.',
    },
    {
      label: 'Role Monitoring',
      description: 'Tell Kate which companies you care about and she watches for new postings at your level. You stay in the conversations, not on the job boards.',
    },
  ];

  const setupSteps = [
    {
      number: '1',
      title: "You'll need Claude Pro or higher",
      link: 'https://claude.ai',
    },
    {
      number: '2',
      title: 'Download the Claude desktop app',
      link: null,
    },
    {
      number: '3',
      title: 'Enable Cowork in the Claude desktop app',
      link: null,
    },
    {
      number: '4',
      title: 'Install the Kate plugin (link provided with your beta invite)',
      link: null,
    },
  ];

  const handleRequestAccess = () => {
    setShowTypeform(true);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Value Bridge */}
        <section className="mb-12">
          <p className="text-xl md:text-2xl text-text-black leading-relaxed">
            The analysis you just got? That's five minutes with Kate. The full experience works alongside you through every stage of your search.
          </p>
        </section>

        {/* Feature Highlights */}
        <section className="mb-12 space-y-8">
          {features.map((feature) => (
            <div key={feature.label}>
              <h3 className="text-lg font-semibold text-text-black mb-2">
                {feature.label}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* Free + Beta Framing */}
        <section className="mb-10">
          <p className="text-gray-600 leading-relaxed">
            Kate is free. The only cost is a Claude Pro subscription, which you may already have. Kate is currently in private beta, so access is limited.
          </p>
        </section>

        {/* Beta Signup CTA */}
        {!showTypeform && (
          <section className="mb-12">
            <button
              onClick={handleRequestAccess}
              className="py-4 px-8 bg-accent-maroon text-white font-semibold text-lg hover:bg-red-900 transition-colors"
            >
              Request beta access
            </button>
          </section>
        )}

        {/* Typeform Embed */}
        {showTypeform && (
          <section className="mb-12">
            <iframe
              src={`https://form.typeform.com/to/${TYPEFORM_FORM_ID}`}
              className="w-full h-[500px] border border-gray-300"
              title="Request beta access"
            />
          </section>
        )}

        {/* Setup Steps - Secondary/De-emphasized */}
        {showTypeform && (
          <section className="border-t border-gray-300 pt-8">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">
              Once you're accepted, here's how to get started:
            </h4>
            <div className="space-y-3">
              {setupSteps.map((step) => (
                <div key={step.number} className="flex items-start gap-3">
                  <span className="text-gray-400 font-medium">{step.number}.</span>
                  <div>
                    {step.link ? (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-accent-maroon underline transition-colors"
                      >
                        {step.title}
                      </a>
                    ) : (
                      <span className="text-gray-600">{step.title}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
