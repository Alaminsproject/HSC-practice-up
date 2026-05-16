import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Settings, 
  History, 
  Bookmark, 
  BarChart3, 
  Upload, 
  Brain, 
  ChevronRight, 
  Atom, 
  FlaskConical, 
  Dna, 
  Binary, 
  Languages, 
  Type,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MCQ, UserStats, ViewState, ExamResult } from './types.ts';
import { SUBJECTS, INITIAL_STATS } from './constants.ts';
import { cn } from './lib/utils.ts';
import confetti from 'canvas-confetti';
import { extractTextFromPDF } from './lib/pdfParser.ts';

// --- Sub-components (Simplified for now, will expand) ---

export default function App() {
  const [view, setView] = useState<ViewState>('splash');
  const [mcqData, setMcqData] = useState<MCQ[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);

  // Load data from LocalStorage
  useEffect(() => {
    const savedMCQs = localStorage.getItem('chorcha_mcqs');
    const savedStats = localStorage.getItem('chorcha_stats');
    
    import('./sampleData.ts').then(({ SAMPLE_MCQS }) => {
      if (savedMCQs) {
        setMcqData(JSON.parse(savedMCQs));
      } else {
        setMcqData(SAMPLE_MCQS);
        localStorage.setItem('chorcha_mcqs', JSON.stringify(SAMPLE_MCQS));
      }
    });

    if (savedStats) setStats(JSON.parse(savedStats));

    // Experience the splash screen
    const timer = setTimeout(() => {
      setView('home');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem('chorcha_stats', JSON.stringify(stats));
  }, [stats]);

  // Save MCQs whenever they change
  useEffect(() => {
    localStorage.setItem('chorcha_mcqs', JSON.stringify(mcqData));
  }, [mcqData]);

  const statsMemo = useMemo(() => {
    const total = stats.totalAttempts || 0;
    const accuracy = total > 0 ? (stats.correctAnswers / total) * 100 : 0;
    return { accuracy: accuracy.toFixed(1) };
  }, [stats]);

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: 'হোম' },
    { id: 'subjects', icon: BookOpen, label: 'বিষয়' },
    { id: 'import', icon: Upload, label: 'ইমপোর্ট' },
    { id: 'stats', icon: BarChart3, label: 'পরিসংখ্যান' },
    { id: 'bookmarks', icon: Bookmark, label: 'বুকমার্ক' },
  ];

  return (
    <div className={cn("min-h-screen font-sans selection:bg-emerald-500/30", isDarkMode ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-950")}>
      <AnimatePresence mode="wait">
        {view === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="relative w-32 h-32 mb-8 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
            >
              <Brain className="w-16 h-16 text-white" />
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold tracking-tighter"
            >
              Chorcha <span className="text-emerald-500">Pro</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="mt-2 text-sm uppercase tracking-widest font-mono"
            >
              Ultimate Learning Experience
            </motion.p>
          </motion.div>
        )}

        {view !== 'splash' && (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-24 pt-4 px-4 max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-2xl font-bold">সুস্বাগতম, আল-আমিন!</h2>
                <p className="text-slate-400 text-sm">আপনার আজকের লক্ষ্য পূরণের জন্য প্রস্তুত হোন।</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border-emerald-500/30">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-emerald-400 font-mono">{stats.streak}</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 glass rounded-full hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Views Switch */}
            <AnimatePresence mode="wait">
              {view === 'home' && <HomeView stats={stats} accuracy={statsMemo.accuracy} setView={setView} />}
              {view === 'subjects' && <SubjectsView onSelect={(id) => { setSelectedSubject(id); setView('chapters'); }} />}
              {view === 'import' && <ImportView setMcqData={setMcqData} />}
              {view === 'stats' && <StatsView stats={stats} />}
              {view === 'bookmarks' && <BookmarksView mcqs={mcqData.filter(m => m.bookmarked)} />}
              {view === 'chapters' && <ChaptersView subjectId={selectedSubject!} mcqs={mcqData} onSelect={(ch) => { setSelectedChapter(ch); setView('exam-setup'); }} />}
              {view === 'exam-setup' && <ExamSetupView subject={selectedSubject!} chapter={selectedChapter!} setView={setView} />}
              {view === 'practice' && <PracticeView subject={selectedSubject!} chapter={selectedChapter!} mcqs={mcqData} setView={setView} setStats={setStats} setMcqData={setMcqData} />}
              {view === 'result' && <ResultView result={stats.examHistory[0]} setView={setView} />}
            </AnimatePresence>

            {/* Navigation Rail */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card flex items-center gap-1 p-2 border-white/5 z-40">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                    view === item.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  {view === item.id && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -top-1 w-1 h-1 bg-white rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- View Components ---

function HomeView({ stats, accuracy, setView }: { stats: UserStats, accuracy: string, setView: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">মোট অনুশীলন</p>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold font-mono">{stats.totalAttempts}</h3>
            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded font-bold">MCQ</div>
          </div>
        </div>
        <div className="glass-card p-5 border-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">সঠিকতার হার</p>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold font-mono">{accuracy}%</h3>
            <BarChart3 className="w-4 h-4 text-blue-500/50" />
          </div>
        </div>
      </div>

      {/* Continue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg">পড়া চালিয়ে যান</h3>
          <button onClick={() => setView('subjects')} className="text-emerald-500 text-sm font-medium flex items-center">
            সবগুলো দেখুন <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => setView('subjects')}
          className="w-full glass-card p-5 flex items-center justify-between group hover:border-emerald-500/40 transition-all border-emerald-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Atom className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-lg">পদার্থবিজ্ঞান</h4>
              <p className="text-emerald-400 text-xs font-medium">১০টি প্রশ্ন বাকি • অধ্যায় ২</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          onClick={() => setView('import')}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 border-dashed border-slate-700 hover:border-emerald-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
          </div>
          <span className="font-bold text-sm">নতুন PDF ইমপোর্ট</span>
        </button>
        
        <button 
          onClick={() => setView('stats')}
          className="glass-card p-6 flex flex-col items-center justify-center gap-3 border-slate-800 hover:border-blue-500/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
            <History className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
          </div>
          <span className="font-bold text-sm">পরীক্ষার ইতিহাস</span>
        </button>
      </div>
    </motion.div>
  );
}

function SubjectsView({ onSelect }: { onSelect: (id: string) => void }) {
  const iconMap: Record<string, any> = {
    physics: Atom,
    chemistry: FlaskConical,
    biology: Dna,
    math: Binary,
    bangla: Languages,
    english: Type,
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="grid grid-cols-2 gap-4"
    >
      {SUBJECTS.map((sub) => {
        const Icon = iconMap[sub.id] || Atom;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className="glass-card p-6 flex flex-col items-center gap-4 text-center group hover:border-emerald-500/50 transition-all"
          >
            <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
              <Icon className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{sub.name}</h4>
              <p className="text-slate-500 text-xs font-mono uppercase">View Chapters</p>
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}

function ImportView({ setMcqData }: { setMcqData: any }) {
  const [importMode, setImportMode] = useState<'pdf' | 'paste' | 'json'>('pdf');
  const [pastedText, setPastedText] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      setPastedText(text);
      setImportMode('paste');
      alert('PDF থেকে টেক্সট এক্সট্রাক্ট করা হয়েছে! এখন "AI এর মাধ্যমে MCQ এক্সট্রাক্ট করুন" বাটনে ক্লিক করুন।');
    } catch (error) {
      console.error(error);
      alert('PDF রিড করতে সমস্যা হয়েছে।');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSmartExtract = async () => {
    if (!pastedText) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/extract-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const newData = data.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) }));
        setMcqData((prev: any) => [...prev, ...newData]);
        alert(`সফলভাবে ${data.length}টি MCQ ইমপোর্ট করা হয়েছে!`);
        setPastedText('');
      } else {
        alert('সঠিক ফরম্যাটে MCQ পাওয়া যায়নি।');
      }
    } catch (e) {
      console.error(e);
      alert('ইমপোর্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        const newData = data.map((m: any) => ({ 
          ...m, 
          id: m.id || Math.random().toString(36).substr(2, 9),
          bookmarked: false
        }));
        setMcqData((prev: any) => [...prev, ...newData]);
        alert(`সফলভাবে ${newData.length}টি MCQ যুক্ত করা হয়েছে!`);
        setJsonInput('');
      } else {
        alert('ভুল ফরম্যাট! দয়া করে একটি JSON অ্যারে প্রদান করুন।');
      }
    } catch (e) {
      alert('ভুল JSON ফরম্যাট!');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass p-1 rounded-2xl flex gap-1">
        {['pdf', 'paste', 'json'].map((m) => (
          <button
            key={m}
            onClick={() => setImportMode(m as any)}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all",
              importMode === m ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400"
            )}
          >
            {m === 'pdf' ? 'PDF আপলোড' : m === 'paste' ? 'টেক্সট পেস্ট' : 'JSON ইমপোর্ট'}
          </button>
        ))}
      </div>

      <div className="glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-slate-700 min-h-[300px]">
        {importMode === 'pdf' && (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              {isExtracting ? (
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-emerald-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">PDF ফাইল সিলেক্ট করুন</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">আপনার ফোন বা কম্পিউটার থেকে MCQ PDF ফাইল আপলোড করুন।</p>
            </div>
            <label className="inline-block mt-4 text-emerald-500 bg-emerald-500/10 px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-500 hover:text-white transition-all">
              ফাইল পছন্দ করুন
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isExtracting} />
            </label>
          </div>
        )}

        {importMode === 'paste' && (
          <div className="w-full space-y-4">
            <textarea 
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="এখানে PDF থেকে টেক্সট কপি করে পেস্ট করুন..."
              className="w-full h-48 bg-slate-900/50 rounded-2xl border border-white/5 p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
            />
            <button 
              onClick={handleSmartExtract}
              disabled={isExtracting || !pastedText}
              className="w-full py-4 bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isExtracting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              AI এর মাধ্যমে MCQ এক্সট্রাক্ট করুন
            </button>
          </div>
        )}

        {importMode === 'json' && (
          <div className="w-full space-y-4">
             <textarea 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"question": "...", "options": [...], "answer": 0, "subject": "...", "chapter": "..."}]'
              className="w-full h-48 bg-slate-900/50 rounded-2xl border border-white/5 p-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
            />
            <button 
              onClick={handleJsonImport}
              className="w-full py-4 bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-500/20"
            >
              ডাটাবেজে যুক্ত করুন
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChaptersView({ subjectId, mcqs, onSelect }: { subjectId: string, mcqs: MCQ[], onSelect: (ch: string) => void }) {
  const chapters = useMemo(() => {
    const subjectMcqs = mcqs.filter(m => m.subject.toLowerCase() === subjectId.toLowerCase());
    const uniqueChapters = Array.from(new Set(subjectMcqs.map(m => m.chapter)));
    return uniqueChapters;
  }, [subjectId, mcqs]);

  if (chapters.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-400">এই বিষয়ের জন্য কোন অধ্যায় পাওয়া যায়নি। দয়া করে ইমপোর্ট করুন।</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
       <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold capitalize">{subjectId} Chapters</h3>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>
      {chapters.map((ch, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(ch)}
          className="w-full glass-card p-5 flex items-center justify-between group hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-bold font-mono text-slate-500">
                {String(idx + 1).padStart(2, '0')}
             </div>
             <div className="text-left">
                <h4 className="font-bold">{ch}</h4>
                <p className="text-xs text-slate-500">{mcqs.filter(m => m.chapter === ch).length}টি প্রশ্ন উপলব্ধ</p>
             </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      ))}
    </motion.div>
  );
}

function ExamSetupView({ subject, chapter, setView }: { subject: string, chapter: string, setView: any }) {
  const [qCount, setQCount] = useState(25);
  const [time, setTime] = useState(15);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold">পরীক্ষা শুরু করুন</h3>
        <p className="text-slate-400 text-sm mt-2">{subject} • {chapter}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">প্রশ্ন সংখ্যা</label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map(n => (
              <button 
                key={n}
                onClick={() => setQCount(n)}
                className={cn(
                  "py-3 rounded-xl font-bold border transition-all",
                  qCount === n ? "bg-emerald-500 border-emerald-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-400"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">সময় (মিনিট)</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map(m => (
              <button 
                key={m}
                onClick={() => setTime(m)}
                className={cn(
                  "py-3 rounded-xl font-bold border transition-all",
                  time === m ? "bg-emerald-500 border-emerald-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-400"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setView('practice')}
        className="w-full py-5 bg-emerald-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        পরীক্ষা শুরু করুন
      </button>
    </motion.div>
  );
}

function PracticeView({ subject, chapter, mcqs, setView, setStats, setMcqData }: { subject: string, chapter: string, mcqs: MCQ[], setView: any, setStats: any, setMcqData: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<{ id: string, correct: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(60 * 15); // Default 15 mins for now

  // Effect for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredMcqs = useMemo(() => {
    return mcqs.filter(m => m.subject.toLowerCase() === subject.toLowerCase() && m.chapter === chapter);
  }, [mcqs, subject, chapter]);

  const currentMcq = filteredMcqs[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    const isCorrect = idx === currentMcq.answer;
    setResults(prev => [...prev, { id: currentMcq.id, correct: isCorrect }]);
    
    // Auto next after 1.5s if correct
    if (isCorrect) {
      setTimeout(() => {
        if (currentIdx < filteredMcqs.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setSelectedAns(null);
          setShowExplanation(false);
        } else {
          finishExam();
        }
      }, 1500);
    }
  };

  const finishExam = () => {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = (correctCount / filteredMcqs.length) * 100;
    
    const newResult: ExamResult = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      subject: subject,
      score: correctCount,
      total: filteredMcqs.length,
      timeSpent: 60 * 15 - timeLeft,
      accuracy: accuracy
    };

    setStats((prev: UserStats) => {
      const newSubjectAccuracy = { ...prev.subjectAccuracy };
      const newChapterAccuracy = { ...prev.chapterAccuracy };
      
      // Basic weighted update: (old_acc + new_acc) / 2 or just keep newest for simplicity
      // Let's do a simple update for now
      newSubjectAccuracy[subject] = accuracy;
      newChapterAccuracy[chapter] = accuracy;

      return {
        ...prev,
        totalAttempts: prev.totalAttempts + filteredMcqs.length,
        correctAnswers: prev.correctAnswers + correctCount,
        wrongAnswers: prev.wrongAnswers + (filteredMcqs.length - correctCount),
        streak: prev.streak + 1,
        lastActive: new Date().toISOString(),
        subjectAccuracy: newSubjectAccuracy,
        chapterAccuracy: newChapterAccuracy,
        examHistory: [newResult, ...prev.examHistory]
      };
    });

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    });
    
    setView('result');
  };

  const toggleBookmark = () => {
    const isBookmarked = !!currentMcq.bookmarked;
    const updated = mcqs.map(m => m.id === currentMcq.id ? { ...m, bookmarked: !isBookmarked } : m);
    setMcqData(updated);
  };

  if (!currentMcq) return <div>No Questions</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => setView('exam-setup')} className="text-slate-400 p-2 glass rounded-xl"><XCircle className="w-5 h-5" /></button>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border-emerald-500/20">
          <Timer className="w-4 h-4 text-emerald-500" />
          <span className="font-mono font-bold text-emerald-400">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
        <button 
          onClick={toggleBookmark}
          className={cn("p-2 glass rounded-xl transition-all", currentMcq.bookmarked ? "text-emerald-500 bg-emerald-500/10" : "text-slate-400")}
        >
          <Bookmark className={cn("w-5 h-5", currentMcq.bookmarked && "fill-emerald-500")} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / filteredMcqs.length) * 100}%` }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>

      {/* Question Card */}
      <div className="glass-card p-8 space-y-8">
        <h3 className="text-xl font-medium leading-relaxed">{currentMcq.question}</h3>
        
        <div className="space-y-3">
          {currentMcq.options.map((opt, idx) => {
             const isSelected = selectedAns === idx;
             const isCorrect = idx === currentMcq.answer;
             const isWrong = isSelected && !isCorrect;

             return (
               <button
                 key={idx}
                 onClick={() => handleSelect(idx)}
                 className={cn(
                   "w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-300",
                   isSelected ? (isCorrect ? "bg-emerald-500 border-emerald-400 text-white shadow-xl scale-[1.02]" : "bg-red-500 border-red-400 text-white shadow-xl scale-[1.02]") 
                              : (selectedAns !== null && isCorrect ? "bg-emerald-500/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/5 hover:bg-white/10")
                 )}
               >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                      isSelected ? "bg-white/20" : "bg-white/5"
                    )}>
                      {['ক', 'খ', 'গ', 'ঘ'][idx]}
                    </div>
                    <span className="font-medium">{opt}</span>
                 </div>
                 {isSelected && (isCorrect ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />)}
               </button>
             );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            disabled={selectedAns === null}
            className="flex-1 py-4 glass rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-20"
          >
            <Brain className="w-5 h-5 text-blue-500" /> ব্যাখ্যা
          </button>
          <button 
            onClick={() => {
              if (currentIdx < filteredMcqs.length - 1) {
                setCurrentIdx(prev => prev + 1);
                setSelectedAns(null);
                setShowExplanation(false);
              } else {
                finishExam();
              }
            }}
            className="flex-[2] py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            পরবর্তী <ChevronRight className="w-5 h-5" />
          </button>
      </div>

      {/* Explanation Panel */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm uppercase tracking-wider">
               <Brain className="w-4 h-4" /> ব্যাখ্যা
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              {currentMcq.explanation || 'এই প্রশ্নের জন্য কোন ব্যাখ্যা পাওয়া যায়নি। বিস্তারিত জানতে আমাদের টেক্সট বুক ফলো করুন।'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatsView({ stats }: { stats: UserStats }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="glass-card p-8 text-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
             <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">আপনার অগ্রগতি</h2>
          <p className="text-slate-400">অবিশ্বাস্য কাজ! আপনি নিয়মিত শিখছেন।</p>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 space-y-1">
             <span className="text-xs font-bold text-emerald-500 uppercase">সঠিক</span>
             <h3 className="text-3xl font-bold font-mono">{stats.correctAnswers}</h3>
          </div>
          <div className="glass-card p-6 space-y-1">
             <span className="text-xs font-bold text-red-500 uppercase">ভুল</span>
             <h3 className="text-3xl font-bold font-mono">{stats.wrongAnswers}</h3>
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="font-bold text-lg">দুর্বল অধ্যায় (সংকেত)</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.chapterAccuracy)
              .filter(([_, acc]) => acc < 60)
              .map(([ch, acc]) => (
                <div key={ch} className="glass px-4 py-2 rounded-xl flex items-center gap-2 border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{ch}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded">{Math.round(acc)}%</span>
                </div>
              ))}
            {Object.entries(stats.chapterAccuracy).filter(([_, acc]) => acc < 60).length === 0 && (
              <p className="text-slate-500 text-sm italic">সেরা পারফরম্যান্স! আপনার কোন দুর্বল অধ্যায় নেই।</p>
            )}
          </div>
       </div>

       <div className="space-y-4">
          <h4 className="font-bold text-lg">সর্বশেষ পরীক্ষাগুলো</h4>
          {stats.examHistory.length === 0 ? (
            <p className="text-center text-slate-500 py-10 glass rounded-2xl">এখনো কোন পরীক্ষা দেওয়া হয়নি।</p>
          ) : (
            stats.examHistory.map((res) => (
              <div key={res.id} className="glass-card p-4 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-emerald-500">
                     {Math.round(res.accuracy)}%
                   </div>
                   <div>
                     <h5 className="font-bold text-sm capitalize">{res.subject}</h5>
                     <p className="text-[10px] text-slate-500">{new Date(res.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-sm">{res.score}/{res.total}</p>
                   <p className="text-[10px] text-slate-500">{Math.floor(res.timeSpent / 60)}মিনিট</p>
                 </div>
              </div>
            ))
          )}
       </div>
    </motion.div>
  );
}

function BookmarksView({ mcqs }: { mcqs: MCQ[] }) {
  return (
    <div className="space-y-4">
      {mcqs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">কোন বুকমার্ক করা প্রশ্ন নেই।</p>
        </div>
      ) : (
        mcqs.map(m => (
          <div key={m.id} className="glass-card p-6 space-y-3">
             <div className="flex items-center justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
               <span>{m.subject} • {m.chapter}</span>
               <Bookmark className="w-3 h-3 fill-emerald-500" />
             </div>
             <p className="font-medium text-sm">{m.question}</p>
          </div>
        ))
      )}
    </div>
  );
}

function ResultView({ result, setView }: { result: ExamResult | undefined, setView: any }) {
  if (!result) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 text-center space-y-8"
    >
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full border-8 border-emerald-500/20 flex items-center justify-center mx-auto">
          <div className="text-4xl font-black text-emerald-500 font-mono italic">
            {Math.round(result.accuracy)}%
          </div>
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-emerald-500 border-t-transparent animate-pulse" />
      </div>

      <div>
        <h2 className="text-3xl font-bold">চমৎকার ফলাফল!</h2>
        <p className="text-slate-400 mt-2">আপনি {result.total}টি প্রশ্নের মধ্যে {result.score}টি সঠিক উত্তর দিয়েছেন।</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="glass p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">সময় লেগেছে</p>
            <p className="text-xl font-bold font-mono">{Math.floor(result.timeSpent / 60)}মি. {result.timeSpent % 60}সে.</p>
         </div>
         <div className="glass p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">সঠিক উত্তর</p>
            <p className="text-xl font-bold font-mono text-emerald-500">{result.score}/{result.total}</p>
         </div>
      </div>

      <div className="space-y-3 pt-4">
        <button 
          onClick={() => setView('subjects')}
          className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20"
        >
          নতুন অধ্যায় শুরু করুন
        </button>
        <button 
          onClick={() => setView('home')}
          className="w-full py-4 glass text-slate-300 font-bold rounded-2xl"
        >
          হোম ড্যাশবোর্ড
        </button>
      </div>
    </motion.div>
  );
}
