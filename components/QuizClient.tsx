'use client'

import { useState } from 'react';
import Quiz from '@/components/Quiz';
import Results from '@/components/Results';
import { Question, Denomination, Scores, ResultItem } from '@/lib/types';

interface QuizClientProps {
  questions: Question[];
  denominations: Denomination[];
}

export default function QuizClient({ questions, denominations }: QuizClientProps) {
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  const handleQuizSubmit = (answers: { [key: string]: string }) => {
    const answered = Object.keys(answers);
    if (answered.length === 0) {
      alert("Por favor, responda a pelo menos uma pergunta.");
      return;
    }

    const scores: Scores = {};
    denominations.forEach((denom) => {
      scores[denom.name] = 0;
      for (const questionId in denom.beliefs) {
        if (answers[questionId] && answers[questionId] === denom.beliefs[questionId]) {
          scores[denom.name]++;
        }
      }
    });

    // O cálculo de porcentagem já é feito aqui
    const sortedDenominations = Object.entries(scores)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, score]): ResultItem => {
        const denomProfile = denominations.find(d => d.name === name);
        let matchedAnswers = 0;
        let relevantQuestionsCount = 0;

        if (denomProfile) {
          Object.keys(answers).forEach(qId => {
            if (denomProfile.beliefs[qId] !== undefined) {
              relevantQuestionsCount++;
              if (answers[qId] === denomProfile.beliefs[qId]) {
                matchedAnswers++;
              }
            }
          });
        }

        const percentage = relevantQuestionsCount > 0
          ? Math.round((matchedAnswers / relevantQuestionsCount) * 100)
          : 0;

        return { name, score, percentage };
      });

    setUserAnswers(answers);
    setResults(sortedDenominations);

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Quiz questions={questions} onSubmit={handleQuizSubmit} />
      
      {/* VERSÃO CORRIGIDA: Removido userAnswers e denominations */}
      {results && (
        <Results
          results={results}
          answeredCount={Object.keys(userAnswers).length}
        />
      )}
    </>
  );
}