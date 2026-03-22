import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ UI 감성 모드 (casual: 4.0 친근함 / formal: 5.0 공식)
  const [uiMode, setUiMode] = useState(() => {
    return localStorage.getItem('cwnu_ui_mode') || 'casual';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('cwnu_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cwnu_ui_mode', uiMode);
  }, [uiMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cwnu_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cwnu_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const [timerMode, setTimerMode] = useState('timer'); 
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerTime((prev) => {
          if (timerMode === 'timer') {
            if (prev <= 10) {
              setTimerIsRunning(false);
              return 0;
            }
            return prev - 10;
          } else {
            return prev + 10; 
          }
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerMode]);

  const getMenuClass = (path) => {
    const baseClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] md:text-sm transition-all ";
    return baseClass + (location.pathname === path 
      ? "bg-white/20 text-white shadow-inner" 
      : "text-white/70 hover:text-white hover:bg-white/10");
  };

  const isCasual = uiMode === 'casual';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 transition-colors`}>
      <header className="bg-[#002f6c] dark:bg-gray-950 text-white p-3 md:p-5 shadow-lg flex flex-col md:flex-row justify-between items-center transition-colors sticky top-0 z-[100] gap-3 md:gap-0">
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            CWNU PORTAL <span className="text-red-500 italic ml-1 md:ml-2 text-sm md:text-base opacity-90">V5 5.0</span>
          </h1>
          <div className="flex gap-2 md:hidden">
             <button onClick={() => setUiMode(isCasual ? 'formal' : 'casual')} className="p-2 bg-white/10 rounded-xl text-[10px] font-bold">
               {isCasual ? '😊 Casual' : '👔 Formal'}
             </button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white/10 rounded-xl text-[10px] font-bold">
               {isDarkMode ? 'Light' : 'Dark'}
             </button>
          </div>
        </div>

        {location.pathname !== '/' && (
          <nav className="flex items-center gap-1 md:gap-4 bg-black/20 p-1 md:p-1.5 rounded-2xl">
            <Link to="/market" className={getMenuClass('/market')}>
              {isCasual && "🏪 "} <span className="hidden sm:inline">MARKET</span><span className="sm:hidden text-[10px]">MARKET</span>
            </Link>
            <Link to="/todo" className={getMenuClass('/todo')}>
              {isCasual && "📝 "} <span className="hidden sm:inline">TODO</span><span className="sm:hidden text-[10px]">TODO</span>
            </Link>
            <Link to="/gpa" className={getMenuClass('/gpa')}>
              {isCasual && "🎓 "} <span className="hidden sm:inline">GPA 계산기</span><span className="sm:hidden text-[10px]">GPA</span>
            </Link>
          </nav>
        )}

        <div className="flex gap-2 md:gap-3 items-center w-full md:w-auto justify-center md:justify-end">
          <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" className="bg-[#634432] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#4d3527] transition">
            {isCasual && "🍱 "}학식
          </a>
          <a href="https://lib.changwon.ac.kr/" target="_blank" rel="noreferrer" className="bg-[#059669] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#047857] transition">
            {isCasual && "📚 "}도서관
          </a>
          <a href="https://www.instagram.com/cwnu_official/?mi=18361" target="_blank" rel="noreferrer" className="bg-[#d946ef] text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs shadow-md flex items-center gap-1.5 hover:bg-[#c026d3] transition">
            {isCasual && "📸 "}인스타
          </a>

          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => setUiMode(isCasual ? 'formal' : 'casual')} 
              className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-indigo-600 text-white border-2 border-indigo-500 hover:bg-indigo-700 shadow-sm transition-all duration-300 text-xs font-black"
            >
              {isCasual ? '😊 Casual Mode' : '👔 Formal Mode'}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all duration-300 text-xs font-black"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<MainPage uiMode={uiMode} />} />
          <Route path="/market" element={<MarketPage uiMode={uiMode} />} />
          <Route path="/todo" element={
            <TodoPage 
              uiMode={uiMode}
              timerMode={timerMode} setTimerMode={setTimerMode}
              timerTime={timerTime} setTimerTime={setTimerTime}
              timerIsRunning={timerIsRunning} setTimerIsRunning={setTimerIsRunning}
            />
          } />
          <Route path="/gpa" element={<GpaPage uiMode={uiMode} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;