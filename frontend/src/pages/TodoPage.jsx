import { useState, useEffect } from 'react'
import axios from 'axios'

const i18n = {
  ko: {
    casual: {
      timer_btn: ["집중 타이머", "스톱워치"], timer_ctrl: ["시작", "일시정지", "재개", "초기화"],
      search_ph: "🔍 찾으시는 할 일을 검색해보세요!", add_btn: "추가하기",
      importance: ["긴급", "보통", "낮음"], table_head: ["우선순위", "미션명", "남은 시간", "관리"],
      expired: "💀 만료됨", left: "남음", no_data: "등록된 미션이 없습니다.",
      h_v1: "할 일 등록 및 기본적인 체크리스트 기능 구현 📝",
      h_v2: "중요도 분류 및 마감 기한 설정 도입 ⏰",
      h_v3: "리스트/그리드/테이블 다중 뷰 지원 📑",
      h_v4: "집중 타이머 및 30분 전 알림 통합 🚨",
      h_v5: "UI 감성 선택 & 검색 기능 고도화! ✨",
      ver_desc: "25년 2학기 웹프로그래밍 기말과제 `todos_v4`의 최종 진화형! 🔥"
    },
    formal: {
      timer_btn: ["TIMER", "STOPWATCH"], timer_ctrl: ["START", "PAUSE", "RESUME", "RESET"],
      search_ph: "시스템에 등록된 목표 및 일정을 검색하십시오.", add_btn: "ADD MISSION",
      importance: ["긴급", "보통", "낮음"], table_head: ["Priority", "Mission Title", "Remaining Time", "Action"],
      expired: "[ 만료됨 ]", left: "남음", no_data: "데이터가 존재하지 않습니다.",
      h_v1: "할 일 등록 및 기초 체크리스트 시스템 구축",
      h_v2: "중요도 분류 및 마감 기한 설정 엔진 도입",
      h_v3: "다중 뷰 레이아웃 및 뷰 컨트롤러 탑재",
      h_v4: "정밀 집중 타이머 및 스마트 알림 시스템 통합",
      h_v5: "UI 페르소나 시스템 및 통합 검색 엔진 탑재",
      ver_desc: "CWNU Portal Task Management System V5.0"
    }
  },
  en: {
    casual: {
      timer_btn: ["Focus Timer", "Stopwatch"], timer_ctrl: ["Start", "Pause", "Resume", "Reset"],
      search_ph: "🔍 Search your missions!", add_btn: "Add",
      importance: ["Urgent", "Normal", "Low"], table_head: ["Priority", "Mission", "Time Left", "Manage"],
      expired: "💀 Expired", left: "Left", no_data: "No missions registered.",
      h_v1: "Initial Task List Implementation 📝",
      h_v2: "Priority & Deadline Settings ⏰",
      h_v3: "List/Grid/Table View Modes 📑",
      h_v4: "Focus Timer & Smart Alerts 🚨",
      h_v5: "UI Mode Switch & Advanced Search! ✨",
      ver_desc: "Final evolution of Web Programming project `todos_v4`! 🔥"
    },
    formal: {
      timer_btn: ["TIMER", "STOPWATCH"], timer_ctrl: ["START", "PAUSE", "RESUME", "RESET"],
      search_ph: "Search registered tasks and schedules.", add_btn: "ADD MISSION",
      importance: ["Urgent", "Normal", "Low"], table_head: ["Priority", "Subject", "Time Remaining", "Action"],
      expired: "Expired", left: "Left", no_data: "No data available.",
      h_v1: "Task Management Architecture",
      h_v2: "Priority & Deadline Engine",
      h_v3: "Layout Controller & View Switching",
      h_v4: "Precision Timer & Alert System",
      h_v5: "Persona Switching & Search Engine",
      ver_desc: "Official release of CWNU Task Management V5.0"
    }
  }
};

const TITLE_MENTIONS = (lang) => lang === 'ko' ? [
  "오늘의 미션은 무엇인가요?", "성장을 위한 한 걸음, 무엇을 할까요?", "작은 목표가 모여 전설을 만듭니다."
] : [
  "What is your mission today?", "One step for growth, what shall we do?", "Small goals make a legend."
];

const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "Done is better than perfect.", ko: "완성하는 것이 완벽한 것보다 낫다." }
];

function TodoPage({ uiMode, lang, timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState(''); 
  const [importance, setImportance] = useState('보통');
  const [todoDeadline, setTodoDeadline] = useState('');
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewType, setViewType] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [now, setNow] = useState(new Date());
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const text = i18n[lang][uiMode];
  const isCasual = uiMode === 'casual';
  const API_URL = '/api/todo'; const COMMON_URL = '/api/items';

  useEffect(() => { fetchTodos(); }, []);
  useEffect(() => { const itv = setInterval(() => setNow(new Date()), 50); return () => clearInterval(itv); }, []);

  const fetchTodos = async () => { try { const res = await axios.get(API_URL); setTodos(res.data) } catch(e){} }
  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const mi = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mi).padStart(2,'0')}`;
  }
  
  const getRemainingTime = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - now;
    if (diff <= 0) return "EXPIRED";
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff/3600000)%24), mins: Math.floor((diff/60000)%60), secs: Math.floor((diff/1000)%60), ms: Math.floor((diff%1000)/10) };
  }
  
  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    await axios.post(API_URL, { title, importance: importance === 'Urgent' ? '긴급' : importance === 'Low' ? '낮음' : '보통', todoDeadline });
    fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1);
  }

  const handleStartPause = () => {
    if (!timerIsRunning) {
      if (timerMode === 'timer' && timerTime === 0) {
        const ms = ((parseInt(inputs.h || 0) * 3600) + (parseInt(inputs.m || 0) * 60) + parseInt(inputs.s || 0)) * 1000;
        if (ms === 0) return; setTimerTime(ms);
      }
      setTimerIsRunning(true);
    } else { setTimerIsRunning(false); }
  };

  const filteredTodos = todos.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentTodos = filteredTodos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage) || 1;
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* 히스토리 모달 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] max-w-3xl w-full shadow-2xl border-4 border-indigo-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center">TODO V5.0 Update News</h3>
            <p className="text-center text-gray-400 font-bold mb-8 text-xs">{text.ver_desc}</p>
            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-5 text-sm">System History</h4>
              <div className="space-y-3 text-xs">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-indigo-600 font-black min-w-[50px]">V5 1.0:</span><span>{text.h_v1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-indigo-600 font-black min-w-[50px]">V5 2.0:</span><span>{text.h_v2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-indigo-600 font-black min-w-[50px]">V5 3.5:</span><span>{text.h_v3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-indigo-600 font-black min-w-[50px]">V5 4.0:</span><span>{text.h_v4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-indigo-200"><span className="text-indigo-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{text.h_v5}</span></p>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Confirm</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="text-center mb-8 relative">
          <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter cursor-pointer" onClick={() => setShowVersionInfo(true)}>
            TODO <span className="text-red-600 italic">V5 5.0</span>
          </h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase mt-2">Time & Task Management</p>
        </div>

        {/* 타이머 영역 */}
        <div className="bg-[#111] dark:bg-gray-950 text-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] mb-12 shadow-2xl border-b-[10px] border-indigo-900 text-center relative">
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>{text.timer_btn[0]}</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>{text.timer_btn[1]}</button>
          </div>
          
          {!timerIsRunning && timerMode === 'timer' && timerTime === 0 ? (
            <div className="flex justify-center items-center gap-2 text-5xl md:text-7xl font-black mb-10 font-mono tracking-tighter">
              <input value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 outline-none" placeholder="00" maxLength="2"/>:
              <input value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 outline-none" placeholder="00" maxLength="2"/>:
              <input value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-20 md:w-28 bg-transparent text-center border-b-4 border-indigo-700 outline-none" placeholder="00" maxLength="2"/>
            </div>
          ) : (
            <div className={`text-5xl md:text-7xl font-black mb-10 font-mono tracking-tighter ${isTimerUrgent ? 'animate-pulse text-red-500' : ''}`}>
              {formatTime(timerTime)}
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <button onClick={handleStartPause} className={`px-10 py-4 rounded-full font-black text-lg transition-all ${timerIsRunning?'bg-red-600':'bg-white text-black'}`}>
              {timerIsRunning ? text.timer_ctrl[1] : (timerTime > 0 ? text.timer_ctrl[2] : text.timer_ctrl[0])}
            </button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-10 py-4 rounded-full font-black text-lg text-gray-500">{text.timer_ctrl[3]}</button>
          </div>
        </div>

        {/* 명언 영역 */}
        <div className="text-center mb-10">
          <p className="text-2xl md:text-4xl font-black mb-6 tracking-tighter text-indigo-800 dark:text-indigo-300">
            {TITLE_MENTIONS(lang)[Math.floor(Date.now()/6000)%3]}
          </p>
          <div className="p-8 rounded-[3rem] border bg-gray-50 dark:bg-gray-800/50 shadow-sm">
            <p className="text-2xl font-serif italic mb-4 opacity-80">"{QUOTES[0][lang]}"</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Inspiration</span>
          </div>
        </div>

        {/* 검색 및 입력 */}
        <div className="mb-6"><input type="text" placeholder={text.search_ph} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full p-4 border rounded-2xl shadow-sm focus:border-indigo-500 outline-none dark:bg-gray-800 font-bold"/></div>

        <form onSubmit={addTodo} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-lg border flex flex-col md:flex-row gap-4 mb-10">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm outline-none">
            {text.importance.map((im, i) => <option key={i} value={i===0?'Urgent':i===1?'Normal':'Low'}>{im}</option>)}
          </select>
          <input placeholder={lang==='ko'?'할 일을 입력하세요.':'Enter your task.'} value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-3 font-bold outline-none bg-transparent text-lg"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs font-black"/>
          <button className="bg-[#002f6c] text-white px-8 py-4 rounded-xl font-black hover:bg-blue-900 transition">{text.add_btn}</button>
        </form>

        {/* 리스트 출력 */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border overflow-hidden mb-20">
          <table className="w-full text-center">
            <thead className="bg-[#111] text-white text-[10px] font-black uppercase tracking-widest">
              <tr><th className="p-5">{text.table_head[0]}</th><th className="p-5 text-left">{text.table_head[1]}</th><th className="p-5">{text.table_head[2]}</th><th className="p-5">{text.table_head[3]}</th></tr>
            </thead>
            <tbody>
              {currentTodos.map(todo => {
                const rem = getRemainingTime(todo.todoDeadline);
                return (
                  <tr key={todo._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-600':todo.importance==='보통'?'bg-yellow-500':'bg-green-600'}`}>{todo.importance}</span></td>
                    <td className="p-5 text-left font-black text-sm">{todo.title}</td>
                    <td className="p-5 text-xs font-bold text-indigo-600">
                      {rem === "EXPIRED" ? text.expired : rem ? `${rem.days}d ${String(rem.hours).padStart(2,'0')}:${String(rem.mins).padStart(2,'0')}:${String(rem.secs).padStart(2,'0')}` : "-"}
                    </td>
                    <td className="p-5 flex justify-center gap-2">
                      <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">Del</button>
                    </td>
                  </tr>
                );
              })}
              {currentTodos.length === 0 && <tr><td colSpan="4" className="p-20 text-gray-400 font-bold">{text.no_data}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="py-10 text-center border-t mt-16 w-full">
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1.5">Department of Computer Science | Software Engineering Project</p>
        <p className="text-gray-400 font-bold text-[10px]">© 2026 Jung Yi Ryang. System Version 5.0</p>
      </footer>
    </div>
  )
}
export default TodoPage;