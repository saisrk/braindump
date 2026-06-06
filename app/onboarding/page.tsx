'use client';

import { useState, useTransition } from 'react';
import { completeOnboarding } from '@/lib/actions/onboarding';

const TOPICS = ['AI', 'Leadership', 'Coding', 'Design', 'Science', 'Business', 'Personal Dev'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function handleFinish() {
    startTransition(async () => {
      await completeOnboarding(name, selectedTopics);
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Welcome to Braindump</h1>
                <p className="text-muted-foreground text-sm">
                  Capture what you learn, review it at the right time, and actually remember it. Let&apos;s get you set up.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What should we call you?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                  placeholder="Your name"
                  autoFocus
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">What do you want to learn?</h2>
                <p className="text-muted-foreground text-sm">
                  Pick your topics. We&apos;ll seed your library with a few starter learnings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const selected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-border text-foreground font-semibold py-3 rounded-xl text-sm hover:bg-muted transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-4xl">🎉</div>
                <h2 className="text-2xl font-bold text-foreground">
                  You&apos;re all set{name ? `, ${name.split(' ')[0]}` : ''}!
                </h2>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve seeded your library with a few starter learnings based on your topics. The review queue is ready when you are.
                </p>
              </div>

              {selectedTopics.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your topics</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((t) => (
                      <span key={t} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">The loop:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-none">
                  <li>📥 <strong>Capture</strong> — paste a URL or note</li>
                  <li>🔁 <strong>Review</strong> — spaced repetition keeps it fresh</li>
                  <li>🧠 <strong>Teach back</strong> — explain it in your own words</li>
                </ol>
              </div>

              <button
                onClick={handleFinish}
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Setting up your space…
                  </span>
                ) : (
                  'Start learning →'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
