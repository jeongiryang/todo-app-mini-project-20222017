import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MainPage from './pages/MainPage';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';
import GpaPage from './pages/GpaPage';

//  2, 3단계: Navbar에서 다크모드 상태와 토글 함수를 props로 받아서 버튼 추가
function Navbar({ isDarkMode, toggleDarkMode }) {
  const location = useLocation();
  const isMain = location.pathname === '/';
  
  return (
    <nav className="bg-[#002f6c] dark:bg-gray-900 p-4 text-white shadow-xl sticky top-0 z-[200] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="font-black text-2xl italic tracking-tighter">
              CWNU PORTAL <span className="text-red-400 px-2">V5_super_4.0</span>
            </h1>
          </Link>
          <div className="hidden lg:flex items-center gap-4 border-l border-blue-800 ml-4 pl-4">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest leading-none">
              Software Engineering<br/>Project 2026
            </div>
            <div className="flex items-center gap-2">
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" 
                 className="bg-blue-800/40 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-blue-700/50 flex items-center gap-1.5">🌐 와글 광장</a>
              <a href="https://app.changwon.ac.kr/campus/campus_001.do" target="_blank" rel="noreferrer" 
                 className="bg-orange-500/60 hover:bg-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-orange-400/50 flex items-center gap-1.5">🍱 오늘 학식</a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isMain && (
            <div className="flex gap-6 font-black text-sm items-center mr-2">
              <Link to="/market" className="hover:text-blue-300 transition-colors flex items-center gap-1">🏪 <span className="hidden sm:inline">창원대 장터 ↗</span></Link>
              <Link to="/todo" className="hover:text-blue-300 transition-colors flex items-center gap-1">📝 <span className="hidden sm:inline">ToDo 리스트 ↗</span></Link>
              <Link to="/gpa" className="hover:text-blue-300 transition-colors flex items-center gap-1">🎓 <span className="hidden sm:inline">학점계산기 ↗</span></Link>
            </div>
          )}
          {/*  3단계: 다크모드 토글 버튼 (어느 페이지에서든 보이도록 우측 끝에 배치) */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 border border-blue-700/50 dark:border-gray-600"
            title="다크모드 토글"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  // 🚀 2단계: 다크모드 상태 관리 및 <html> 태그에 'dark' 클래스 탈부착
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // 기존 타이머 로직
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
      {/* 
       4단계: 최상위 div에 다크모드 배경색(dark:bg-gray-900)과 글자색(dark:text-white) 적용 */}
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 flex flex-col">
        {/* Navbar에 상태와 함수 전달 */}
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