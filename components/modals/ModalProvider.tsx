'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Student, AIInsight } from '@/lib/types';
import { QuickInputModal } from './QuickInputModal';
import { AIPanel } from './AIPanel';
import { RaporGenerator } from './RaporGenerator';
import { ModeKelas } from './ModeKelas';
import { StudentDetail } from './StudentDetail';
import { Toast } from './Toast';

type ToastItem = { id: number; msg: string; kind?: 'good' | 'warn' };

type Ctx = {
  openInput: () => void;
  openAI: () => void;
  openRapor: (s: Student) => void;
  openLive: () => void;
  openStudentDetail: (s: Student) => void;
  pushToast: (msg: string, kind?: 'good' | 'warn') => void;
  insights: AIInsight[];
  students: Student[];
};

const ModalContext = createContext<Ctx | null>(null);

export function useModals() {
  const v = useContext(ModalContext);
  if (!v) throw new Error('useModals outside ModalProvider');
  return v;
}

export function ModalProvider({ children, insights, students }: { children: ReactNode; insights: AIInsight[]; students: Student[] }) {
  const [inputOpen, setInputOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const [raporStudent, setRaporStudent] = useState<Student | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((msg: string, kind?: 'good' | 'warn') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const handleSubmitInput = useCallback(() => {
    setInputOpen(false);
    pushToast('Jurnal mengajar VIII-B tersimpan', 'good');
    setTimeout(() => pushToast('Wani AI memperbarui ringkasan kelas', 'good'), 1200);
  }, [pushToast]);

  return (
    <ModalContext.Provider value={{
      openInput: () => setInputOpen(true),
      openAI: () => setAIOpen(true),
      openRapor: (s) => setRaporStudent(s),
      openLive: () => setLiveOpen(true),
      openStudentDetail: (s) => setDetailStudent(s),
      pushToast, insights, students,
    }}>
      {children}
      <QuickInputModal open={inputOpen} students={students} onClose={() => setInputOpen(false)} onSubmit={handleSubmitInput} />
      <AIPanel open={aiOpen} insights={insights} onClose={() => setAIOpen(false)} />
      <RaporGenerator student={raporStudent} onClose={() => setRaporStudent(null)} />
      <ModeKelas open={liveOpen} students={students} onClose={() => setLiveOpen(false)} />
      <StudentDetail student={detailStudent} onClose={() => setDetailStudent(null)} />
      <Toast items={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
    </ModalContext.Provider>
  );
}
