import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

function Navbar({ isDarkMode, toggleDarkMode }) {
  const location = useLocation();
  const isMain = location.pathname === '/';
  
  return (
    /* 모바일 터치 영역 확보를 위해 p-3 md:p-4 적용 */
    <nav className="bg-[#002f6c] dark:bg-gray-900 p-3 md:p-4 text-white shadow-xl sticky top-0 z-[200] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* 좌측 로고 및 외부 링크 영역 */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link to="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
            <h1 className="font-black text-lg md:text-2xl italic tracking-tighter whitespace-nowrap">
              CWNU PORTAL <span className="text-red-400 px-1 md:px-2 text-xs md:text-base align-baseline font-bold">V5_super_4.0</span>
            </h1>
          </Link>
          
          {/* 3. 와글 및 학식 링크 (모바일에서도 보이도록 수정) */}
          <div className="flex items-center gap-1.5 md:gap-3 border-l border-blue-800/50 ml-2 md:ml-4 pl-2 md:pl-4">
            <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" 
               className="bg-blue-800/40 hover:bg-blue-700 p-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all border border-blue-700/50 flex items-center gap-1"
               title="와글 광장">
               <span>🌐</span><span className="hidden md:inline">와글 광장</span>
            </a>
            <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" 
               className="bg-orange-500/40 hover:bg-orange-600 p-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all border border-orange-400/50 flex items-center gap-1"
               title="오늘 학식">
               <span>🍱</span><span className="hidden md:inline">오늘 학식</span>
            </a>
          </div>
        </div>

        {/* 우측 서비스 메뉴 영역 */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {!isMain && (
            <div className="flex gap-2 md:gap-6 font-black text-[11px] md:text-sm items-center">
              <Link to="/market" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <span className="text-lg md:text-base">🏪</span><span className="hidden sm:inline">CWNU 장터 ↗</span>
              </Link>
              <Link to="/todo" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <span className="text-lg md:text-base">📝</span><span className="hidden sm:inline">ToDo ↗</span>
              </Link>
              <Link to="/gpa" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <span className="text-lg md:text-base">🎓</span><span className="hidden sm:inline">학점 계산기 ↗ </span>
              </Link>
            </div>
          )}
          
          <button
            onClick={toggleDarkMode}
            className="p-1.5 md:p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 border border-blue-700/50 dark:border-gray-600 text-sm md:text-base flex-shrink-0"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  /* 전역 타이머/스톱워치 상태 관리 */
  const [timerMode, setTimerMode] = useState('timer');
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime(prev => {
          if (timerMode === 'timer') {
            if (prev <= 10) { setTimerIsRunning(false); return 0; }
            return prev - 10;
          }
          return prev + 10;
        });
      }, 10);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerIsRunning, timerMode]);

  const timerProps = { timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 flex flex-col">
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/todo" element={<TodoPage {...timerProps} />} />
            <Route path="/gpa" element={<GpaPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;