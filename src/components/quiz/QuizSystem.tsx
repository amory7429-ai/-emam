'use client';

import { useState, useCallback } from 'react';
import { QUIZ_QUESTIONS, QUIZ_CATEGORIES, DIFFICULTY_LEVELS, getQuizByCategory, getQuizByDifficulty } from '@/lib/data/quiz';
import type { QuizQuestion } from '@/lib/data/quiz';
import { BottomNav } from '@/components/ui/BottomNav';

interface QuizState {
  currentQuestion: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  answered: boolean;
  questions: QuizQuestion[];
}

export default function QuizSystem() {
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswer: null,
    showResult: false,
    score: 0,
    answered: false,
    questions: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  const startQuiz = useCallback((category: string | 'all', difficulty: string | 'all') => {
    let questions: QuizQuestion[] = [];
    
    if (category === 'all' && difficulty === 'all') {
      questions = [...QUIZ_QUESTIONS];
    } else if (category === 'all') {
      questions = getQuizByDifficulty(difficulty);
    } else if (difficulty === 'all') {
      questions = getQuizByCategory(category);
    } else {
      questions = QUIZ_QUESTIONS.filter(q => q.category === category && q.difficulty === difficulty);
    }

    // Shuffle and limit questions
    questions = [...questions].sort(() => Math.random() - 0.5).slice(0, questionCount);

    setState({
      currentQuestion: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      answered: false,
      questions,
    });
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
  }, [questionCount]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (state.answered) return;
    const isCorrect = answerIndex === state.questions[state.currentQuestion].correctAnswerIndex;
    setState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      answered: true,
    }));
  }, [state.answered, state.currentQuestion, state.questions]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestion + 1 >= state.questions.length) {
      setState(prev => ({ ...prev, showResult: true }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        showResult: false,
        answered: false,
      }));
    }
  }, [state.currentQuestion, state.questions.length]);

  const restart = useCallback(() => {
    startQuiz(selectedCategory || 'all', selectedDifficulty || 'all');
  }, [startQuiz, selectedCategory, selectedDifficulty]);

  const currentQ = state.questions[state.currentQuestion];

  if (state.questions.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold text-gold font-amiri text-center">اختبار إسلامي</h2>
        <p className="text-ivory/70 text-center">اختر التصنيف والصعوبة</p>
        
        <div className="space-y-3">
          <div>
            <label className="text-ivory/60 text-sm block mb-2">التصنيف</label>
            <div className="grid grid-cols-2 gap-2">
              {QUIZ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border transition-colors font-amiri ${
                    selectedCategory === cat.id 
                      ? 'bg-gold/20 border-gold text-gold' 
                      : 'bg-emerald-dark/30 border-emerald/20 text-ivory hover:bg-emerald-dark/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-ivory/60 text-sm block mb-2">الصعوبة</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                  className={`p-3 rounded-xl border transition-colors font-amiri ${
                    selectedDifficulty === level.id 
                      ? 'bg-gold/20 border-gold text-gold' 
                      : 'bg-emerald-dark/30 border-emerald/20 text-ivory hover:bg-emerald-dark/50'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-ivory/60 text-sm block mb-2">عدد الأسئلة</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-emerald-dark/30 border border-emerald/20 text-ivory"
            >
              <option value={5}>5 أسئلة</option>
              <option value={10}>10 أسئلة</option>
              <option value={15}>15 سؤال</option>
              <option value={20}>20 سؤال</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => startQuiz(selectedCategory || 'all', selectedDifficulty || 'all')}
          className="w-full py-3 rounded-xl bg-gold text-emerald-dark font-bold hover:bg-gold/90 transition-colors"
        >
          ابدأ الاختبار
        </button>
      </div>
    );
  }

  if (state.answered && state.currentQuestion + 1 >= state.questions.length) {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gold font-amiri">النتيجة النهائية</h2>
        <div className="text-6xl font-bold text-gold my-8">{state.score}/{state.questions.length}</div>
        <p className="text-ivory/80 text-lg">
          {state.score === state.questions.length ? 'ممتاز! الله يبارك فيك' :
           state.score >= state.questions.length / 2 ? 'جيد جداً، واصل التعلم' :
           'حاول مرة أخرى، التعلم مستمر'}
        </p>
        <div className="space-y-2">
          <button
            onClick={restart}
            className="w-full px-8 py-3 rounded-xl bg-gold text-emerald-dark font-bold hover:bg-gold/90 transition-colors"
          >
            أعد الاختبار
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, questions: [] }))}
            className="w-full px-8 py-3 rounded-xl bg-emerald-dark/30 border border-emerald/20 text-ivory hover:bg-emerald-dark/50 transition-colors"
          >
            اختار تصنيف جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between text-ivory/60 text-sm">
        <span>السؤال {state.currentQuestion + 1}/{state.questions.length}</span>
        <span>النتيجة: {state.score}</span>
      </div>

      <div className="w-full h-2 bg-emerald-dark/40 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${((state.currentQuestion + 1) / state.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-gold/10 text-gold/80">
          {currentQ.category}
        </span>
        <span className={`px-2 py-1 rounded-full ${
          currentQ.difficulty === 'easy' ? 'bg-emerald/10 text-emerald' :
          currentQ.difficulty === 'medium' ? 'bg-gold/10 text-gold' :
          'bg-red-500/10 text-red-400'
        }`}>
          {currentQ.difficulty === 'easy' ? 'سهل' : currentQ.difficulty === 'medium' ? 'متوسط' : 'صعب'}
        </span>
      </div>

      <h3 className="text-xl font-bold text-ivory font-amiri leading-relaxed">
        {currentQ.question}
      </h3>

      <div className="space-y-3">
        {currentQ.options.map((option, idx) => {
          let classes = "w-full p-4 rounded-xl border text-right font-amiri text-lg transition-all ";
          if (state.answered) {
            if (idx === currentQ.correctAnswerIndex) {
              classes += "bg-emerald/20 border-emerald text-emerald-400 ";
            } else if (idx === state.selectedAnswer) {
              classes += "bg-red-500/20 border-red-500 text-red-400 ";
            } else {
              classes += "bg-emerald-dark/20 border-emerald/10 text-ivory/50 ";
            }
          } else {
            classes += "bg-emerald-dark/30 border-emerald/20 text-ivory hover:bg-emerald-dark/50 hover:border-emerald/40 cursor-pointer ";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={state.answered}
              className={classes}
            >
              <span className="text-gold/80 ml-2">{String.fromCharCode(1571 + idx)})</span>
              {option}
            </button>
          );
        })}
      </div>

      {state.answered && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-dark/20 border border-emerald/10">
          <p className="text-ivory/80 text-sm font-amiri">
            {currentQ.explanation}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80">
              {currentQ.sourceName}
            </span>
          </div>
          <button
            onClick={nextQuestion}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gold text-emerald-dark font-bold hover:bg-gold/90 transition-colors"
          >
            {state.currentQuestion + 1 >= state.questions.length ? 'النتيجة' : 'التالي'}
          </button>
        </div>
      )}
    </div>
  );
}
