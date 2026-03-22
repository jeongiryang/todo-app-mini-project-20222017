import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ UI 감성 모드 및 언어 설정 (localStorage 저장)
  const [uiMode, setUiMode] = useState(() => localStorage.getItem('cwnu_ui_mode') || 'casual');
  const [lang, setLang] = useState(() => localStorage.getItem('cwnu_lang') || 'ko');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('cwnu_dark_mode') === 'true');

  // ✅ 토스트 알림 상태
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => { localStorage.setItem('cwnu_ui_mode', uiMode); }, [uiMode]);
  useEffect(() => { localStorage.setItem('cwnu_lang', lang); }, [lang]);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cwnu_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cwnu_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // ✅ 토스트 표시 함수
  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  };

  const [timerMode, setTimerMode] = useState('timer'); 
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerTime((prev) => {
          if (timerMode === 'timer') {
            if (prev <= 10) { setTimerIsRunning(false); return 0; }
            return prev - 10;
          } else { return prev + 10; }
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerMode]);

  // ✅ 다국어 번역 데이터 (Header 전용)
  const t = {
    ko: {
      casual: "😊 캐주얼", formal: "👔 포멀",
      light: "라이트", dark: "다크",
      food: "🍱 학식", lib: "📚 도서관", insta: "📸 인스타",
      toast_casual: "친근한 감성 모드가 활성화되었습니다. 😊",
      toast_formal: "공식 시스템 모드가 활성화되었습니다. 👔",
      toast_lang: "언어가 한국어로 변경되었습니다."
    },
    en: {
      casual: "😊 Casual", formal: "👔 Formal",
      light: "Light", dark: "Dark",
      food: "Food", lib: "Lib", insta: "Insta",
      toast_casual: "Casual mode activated! 😊",
      toast_formal: "Formal system mode activated. 👔",
      toast_lang: "Language changed to English."
    }
  };

  const isCasual = uiMode === 'casual';
  const isKo = lang === 'ko';

  const handleModeToggle = () => {
    const nextMode = isCasual ? 'formal' : 'casual';
    setUiMode(nextMode);
    showToast(nextMode === 'casual' ? t[lang].toast_casual : t[lang].toast_formal);
  };

  const handleLangToggle = () => {
    const nextLang = isKo ? 'en' : 'ko';
    setLang(nextLang);
    showToast(nextLang === 'ko' ? "언어가 한국어로 변경되었습니다." : "Language changed to English.");
  };

  const getMenuClass = (path) => {
    const baseClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] md:text-sm transition-all ";
    return baseClass + (location.pathname === path ? "bg-white/20 text-white shadow-inner" : "text-white/70 hover:text-white hover:bg-white/10");
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 transition-colors`}>
      <header className="bg-[#002f6c] dark:bg-gray-950 text-white p-3 md:p-5 shadow-lg flex flex-col md:flex-row justify-between items-center transition-colors sticky top-0 z-[100] gap-3 md:gap-0">
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            CWNU PORTAL <span className="text-red-500 italic ml-1 md:ml-2 text-sm md:text-base opacity-90">V5 5.0</span>
          </h1>
          <div className="flex gap-2 md:hidden">
             <button onClick={handleLangToggle} className="p-2 bg-white/10 rounded-xl text-[10px] font-bold">{isKo ? '🇰🇷 KO' : '🇺🇸 EN'}</button>
             <button onClick={handleModeToggle} className="p-2 bg-white/10 rounded-xl text-[10px] font-bold">{isCasual ? '😊' : '👔'}</button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white/10 rounded-xl text-[10px] font-bold">{isDarkMode ? 'L' : 'D'}</button>
          </div>
        </div>

        {location.pathname !== '/' && (
          <nav className="flex items-center gap-1 md:gap-4 bg-black/20 p-1 md:p-1.5 rounded-2xl">
            <Link to="/market" className={getMenuClass('/market')}>{isCasual && "🏪 "} MARKET</Link>
            <Link to="/todo" className={getMenuClass('/todo')}>{isCasual && "📝 "} TODO</Link>
            <Link to="/gpa" className={getMenuClass('/gpa')}>{isCasual && "🎓 "} GPA</Link>
          </nav>
        )}

        <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto justify-center md:justify-end">
          <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" className="bg-[#634432] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#4d3527] transition">
            {isCasual ? t[lang].food : 'FOOD'}
          </a>
          <a href="https://lib.changwon.ac.kr/" target="_blank" rel="noreferrer" className="bg-[#059669] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#047857] transition">
            {isCasual ? t[lang].lib : 'LIB'}
          </a>
          <a href="https://www.instagram.com/cwnu_official/?mi=18361" target="_blank" rel="noreferrer" className="bg-[#d946ef] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#c026d3] transition">
            {isCasual ? t[lang].insta : 'INSTA'}
          </a>

          <div className="hidden md:flex gap-2">
            <button onClick={handleLangToggle} className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-xs font-black transition-all">
              {isKo ? '🇰🇷 KOR' : '🇺🇸 ENG'}
            </button>
            <button onClick={handleModeToggle} className="px-3 py-2 rounded-xl bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700 text-xs font-black shadow-sm transition-all">
              {isCasual ? t[lang].casual : t[lang].formal}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-black shadow-sm transition-all">
              {isDarkMode ? t[lang].light : t[lang].dark}
            </button>
          </div>
        </div>
      </header>

      {/* ✅ 전역 토스트 메시지 알림창 */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl backdrop-blur-md border border-white/20 animate-[slide-up_0.3s_forwards]">
          {toast.message}
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={<MainPage uiMode={uiMode} lang={lang} />} />
          <Route path="/market" element={<MarketPage uiMode={uiMode} lang={lang} />} />
          <Route path="/todo" element={
            <TodoPage 
              uiMode={uiMode} lang={lang}
              timerMode={timerMode} setTimerMode={setTimerMode}
              timerTime={timerTime} setTimerTime={setTimerTime}
              timerIsRunning={timerIsRunning} setTimerIsRunning={setTimerIsRunning}
            />
          } />
          <Route path="/gpa" element={<GpaPage uiMode={uiMode} lang={lang} />} />
        </Routes>
      </main>
      
      <style>{`
        @keyframes slide-up { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default App;