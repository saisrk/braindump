import { Learning, TeachBackFeedback } from './types';

interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  question: string;
  answer: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function summarize(input: string): Promise<SummarizeResult> {
  await delay(1500);

  const lower = input.toLowerCase();

  if (lower.includes('react') || lower.includes('jsx') || lower.includes('component')) {
    return {
      title: 'React Component Patterns & Best Practices',
      summary:
        'React is a JavaScript library for building user interfaces through reusable components. Key concepts include the virtual DOM, one-way data flow, hooks for state and side-effects, and the composition model. Modern React favors functional components with hooks (useState, useEffect, useContext) over class components.',
      tags: ['react', 'javascript', 'frontend', 'components'],
      topic: 'Frontend Development',
      difficulty: 'intermediate',
    };
  }

  if (lower.includes('python') || lower.includes('django') || lower.includes('flask')) {
    return {
      title: 'Python Web Development Fundamentals',
      summary:
        'Python is a versatile high-level programming language widely used in web development, data science, and automation. Frameworks like Django provide a full-stack solution with ORM, templating, and admin interfaces, while Flask is a lightweight micro-framework for more flexible applications.',
      tags: ['python', 'web', 'backend', 'django'],
      topic: 'Backend Development',
      difficulty: 'beginner',
    };
  }

  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('neural') || lower.includes('ai')) {
    return {
      title: 'Introduction to Machine Learning Concepts',
      summary:
        'Machine learning enables computers to learn from data without being explicitly programmed. Core concepts include supervised learning (classification, regression), unsupervised learning (clustering, dimensionality reduction), and reinforcement learning. Neural networks, the basis of deep learning, are inspired by biological neurons and excel at pattern recognition.',
      tags: ['machine-learning', 'ai', 'data-science', 'neural-networks'],
      topic: 'Artificial Intelligence',
      difficulty: 'advanced',
    };
  }

  if (lower.includes('typescript') || lower.includes('type') || lower.includes('interface')) {
    return {
      title: 'TypeScript Type System Deep Dive',
      summary:
        'TypeScript adds static typing to JavaScript, catching errors at compile-time rather than runtime. The type system includes primitives, interfaces, type aliases, generics, union/intersection types, and utility types. TypeScript enables better IDE support, refactoring safety, and self-documenting code.',
      tags: ['typescript', 'javascript', 'types', 'static-analysis'],
      topic: 'Programming Languages',
      difficulty: 'intermediate',
    };
  }

  if (lower.includes('css') || lower.includes('tailwind') || lower.includes('style')) {
    return {
      title: 'Modern CSS & Utility-First Styling',
      summary:
        'Modern CSS has evolved to include powerful layout systems like Flexbox and Grid, custom properties (variables), and animations. Utility-first frameworks like Tailwind CSS provide low-level utility classes that let you build custom designs directly in your markup, reducing context switching and stylesheet bloat.',
      tags: ['css', 'tailwind', 'design', 'frontend'],
      topic: 'Frontend Development',
      difficulty: 'beginner',
    };
  }

  if (lower.includes('http') || lower.includes('api') || lower.includes('rest') || lower.includes('graphql')) {
    return {
      title: 'REST APIs & HTTP Protocol Essentials',
      summary:
        'REST (Representational State Transfer) is an architectural style for designing networked applications using HTTP. Key principles include statelessness, uniform interface, resource-based URLs, and standard HTTP methods (GET, POST, PUT, DELETE). JSON is the de facto standard for data exchange in modern APIs.',
      tags: ['api', 'rest', 'http', 'backend'],
      topic: 'Web Architecture',
      difficulty: 'intermediate',
    };
  }

  // Default fallback
  return {
    title: 'Learning Note',
    summary:
      'This content covers an important concept worth remembering. Key takeaways have been extracted and organized for effective spaced repetition review. Regular review sessions will help solidify this knowledge in long-term memory.',
    tags: ['general', 'notes'],
    topic: 'General Knowledge',
    difficulty: 'beginner',
  };
}

export async function generateQuiz(learning: Learning): Promise<QuizQuestion[]> {
  await delay(800);

  return [
    {
      question: `What is the main concept covered in "${learning.title}"?`,
      answer: learning.summary.split('.')[0] + '.',
    },
    {
      question: `Which topic area does "${learning.title}" belong to?`,
      answer: `It belongs to ${learning.topic}, with a difficulty level of ${learning.difficulty}.`,
    },
    {
      question: `Name at least two key tags associated with "${learning.title}".`,
      answer: `Key tags include: ${learning.tags.slice(0, 3).join(', ')}.`,
    },
  ];
}

export async function gradeTeachBack(
  explanation: string,
  summary: string
): Promise<TeachBackFeedback> {
  await delay(1000);

  const explanationLength = explanation.trim().length;
  const summaryWords = summary.toLowerCase().split(/\s+/);
  const explanationWords = explanation.toLowerCase().split(/\s+/);
  const overlap = summaryWords.filter((w) => w.length > 4 && explanationWords.includes(w)).length;
  const coverageScore = Math.min(100, (overlap / Math.max(summaryWords.length, 1)) * 200);
  const lengthScore = Math.min(100, (explanationLength / 200) * 100);
  const score = Math.round((coverageScore * 0.6 + lengthScore * 0.4));

  return {
    score,
    strengths: [
      'You engaged with the material actively.',
      explanationLength > 100 ? 'Good depth of explanation provided.' : 'You made an attempt to recall the concept.',
    ],
    improvements: [
      score < 70 ? 'Try to include more specific details from the source material.' : 'Consider adding examples to illustrate your point.',
      'Reviewing the original summary may help reinforce key points.',
    ],
    followUpQuestions: [
      score < 70
        ? 'Can you re-read the summary and identify the two most important points?'
        : 'How would you apply this concept in a practical scenario?',
      'What questions do you still have about this topic?',
    ],
    overallFeedback:
      score >= 80
        ? 'Excellent! You have a strong grasp of this material.'
        : score >= 60
        ? 'Good effort. A few more review sessions will solidify this knowledge.'
        : 'Keep practicing. Spaced repetition will help this stick over time.',
  };
}
