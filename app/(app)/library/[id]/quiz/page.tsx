'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { BookLoader } from '@/components/ui/book-loader';
import { getQuizQuestions, submitQuizAttempt } from '@/lib/actions/quiz';
import type { QuizQuestion, QuizAnswer } from '@/db/schema';

type Stage = 'loading' | 'cooldown' | 'quiz' | 'submitting' | 'results' | 'error' | 'locked';

const MIN_LOADER_MS = 2500;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const learningId = params.id as string;

  const [stage, setStage] = useState<Stage>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [cooldownHours, setCooldownHours] = useState(0);
  const [results, setResults] = useState<{ score: number; answers: QuizAnswer[]; reviewItemsAdded: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const start = Date.now();
    getQuizQuestions(learningId).then((res) => {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, MIN_LOADER_MS - elapsed);
      setTimeout(() => {
        if (!res.ok) {
          if (res.errorCode === 'pro_required') {
            setStage('locked');
          } else if (res.cooldownHours) {
            setCooldownHours(res.cooldownHours);
            setStage('cooldown');
          } else {
            setErrorMsg(res.error ?? 'Failed to load quiz.');
            setStage('error');
          }
          return;
        }
        setQuestions(res.questions ?? []);
        setStage('quiz');
      }, delay);
    });
  }, [learningId]);

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  function handleSelectOption(opt: string) {
    setSelectedOption(opt);
  }

  function handleNext() {
    const answer = currentQ.type === 'mcq' ? (selectedOption ?? '') : textAnswer;
    const next = { ...answers, [currentQ.id]: answer };
    setAnswers(next);

    if (isLastQuestion) {
      handleSubmit(next);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setTextAnswer('');
    }
  }

  async function handleSubmit(finalAnswers: Record<string, string>) {
    setStage('submitting');
    const res = await submitQuizAttempt({ learningId, questions, userAnswers: finalAnswers });
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Submission failed.');
      setStage('error');
      return;
    }
    setResults({ score: res.score!, answers: res.answers!, reviewItemsAdded: res.reviewItemsAdded! });
    setStage('results');
  }

  const canAdvance = currentQ?.type === 'mcq' ? !!selectedOption : textAnswer.trim().length > 0;

  // ── Loading ──────────────────────────────────────────────────────────
  if (stage === 'loading' || stage === 'submitting') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <BookLoader variant="quiz" />
        </div>
      </div>
    );
  }

  // ── Locked (Pro feature) ──────────────────────────────────────────────
  if (stage === 'locked') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <PageHeader title="Quiz" className="mb-4" />
          <div className="max-w-xl mx-auto">
            <Card className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto" style={{ background: 'rgba(181,70,47,0.12)' }}>
                <Lock className="h-6 w-6" style={{ color: '#b5462f' }} />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Quizzes are a Pro feature</h2>
              <p className="text-sm text-muted-foreground">
                Test yourself with auto-generated multiple-choice and short-answer quizzes — and feed missed questions straight into your review queue. Upgrade to Pro to unlock.
              </p>
              <div className="flex gap-3 justify-center pt-1">
                <Button variant="outline" onClick={() => router.push(`/library/${learningId}`)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Link href="/pricing">
                  <Button>Upgrade to Pro</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Cooldown ─────────────────────────────────────────────────────────
  if (stage === 'cooldown') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <PageHeader title="Quiz" className="mb-4" />
          <div className="max-w-xl mx-auto">
            <Card className="p-8 text-center space-y-4">
              <RotateCcw className="h-10 w-10 text-muted-foreground mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Come back later</h2>
              <p className="text-sm text-muted-foreground">
                You already tested yourself on this. Next attempt available in{' '}
                <span className="font-semibold text-foreground">{cooldownHours}h</span>.
              </p>
              <Button variant="outline" onClick={() => router.push(`/library/${learningId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learning
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <PageHeader title="Quiz" className="mb-4" />
          <div className="max-w-xl mx-auto">
            <Card className="p-8 text-center space-y-4">
              <p className="text-sm text-red-500">{errorMsg}</p>
              <Button variant="outline" onClick={() => router.push(`/library/${learningId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learning
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────
  if (stage === 'results' && results) {
    const scoreColor =
      results.score >= 80 ? 'text-green-500' : results.score >= 50 ? 'text-amber-500' : 'text-red-400';
    const scoreLabel = results.score >= 80 ? 'Great job!' : results.score >= 50 ? 'Getting there!' : 'Keep reviewing!';

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <PageHeader title="Quiz Results" className="mb-4" />
          <div className="max-w-xl mx-auto space-y-4">

            {/* Score card */}
            <Card className="p-6 text-center space-y-2">
              <p className={`text-5xl font-bold ${scoreColor}`}>{results.score}%</p>
              <p className="text-sm text-muted-foreground">{scoreLabel}</p>
              {results.reviewItemsAdded > 0 && (
                <p className="text-xs text-primary pt-1">
                  {results.reviewItemsAdded} missed question{results.reviewItemsAdded > 1 ? 's' : ''} added to your review queue
                </p>
              )}
            </Card>

            {/* Per-question breakdown */}
            <div className="space-y-3">
              {questions.map((q, i) => {
                const answer = results.answers.find((a) => a.questionId === q.id);
                const correct = answer?.correct ?? false;
                return (
                  <Card key={q.id} className={`p-4 border-l-4 ${correct ? 'border-l-green-500' : 'border-l-red-400'}`}>
                    <div className="flex items-start gap-2">
                      {correct
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground">{q.question}</p>
                        <p className="text-xs text-muted-foreground">
                          Your answer: <span className="text-foreground">{answer?.userAnswer || '—'}</span>
                        </p>
                        {!correct && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Correct: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push(`/library/${learningId}`)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => router.push('/review')} className="flex-1">
                <BookOpen className="mr-2 h-4 w-4" />
                Review Queue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  const progress = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          title="Test Yourself"
          subtitle={`Question ${currentIdx + 1} of ${questions.length}`}
          className="mb-4"
        />
        <div className="max-w-xl mx-auto space-y-4">

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {/* Question card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
              </Badge>
            </div>

            <p className="text-base font-medium text-foreground leading-relaxed">{currentQ.question}</p>

            {/* MCQ options */}
            {currentQ.type === 'mcq' && (
              <div className="space-y-2">
                {(currentQ.options ?? []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                      selectedOption === opt
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* One-liner input */}
            {currentQ.type === 'oneliner' && (
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer…"
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            )}
          </Card>

          {/* Next / Submit */}
          <Button onClick={handleNext} disabled={!canAdvance} className="w-full">
            {isLastQuestion ? 'Submit Quiz' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
