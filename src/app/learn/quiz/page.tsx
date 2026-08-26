import QuizSystem from '@/components/quiz/QuizSystem';
import { BottomNav } from '@/components/ui/BottomNav';

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-abyss pb-24">
      <QuizSystem />
      <BottomNav />
    </main>
  );
}
