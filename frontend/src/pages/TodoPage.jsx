// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "Management creates time.", ko: "관리는 시간을 창조한다." },
  { en: "Failure is the opportunity to begin again more intelligently.", ko: "실패는 다시 시작할 기회다." },
  { en: "If you don't walk today, you'll have to run tomorrow.", ko: "오늘 걷지 않으면 내일 뛰어야 한다." },
  { en: "Focus is a skill.", ko: "집중력이 실력이다." },
  { en: "Small habits make big changes.", ko: "작은 습관이 큰 변화를 만든다." },
  { en: "A goal without a timeline is just a dream.", ko: "꿈을 날짜와 적으면 목표가 된다." },
  { en: "The one who finishes is the one who wins.", ko: "끝까지 하는 것이 이기는 것이다." },
  { en: "Time waits for no one.", ko: "시간은 기다려주지 않는다." },
  { en: "Discipline is the bridge between goals and accomplishment.", ko: "규율은 목표와 성취를 잇는 다리이다." }
];

const PLACEHOLDERS = [
  "어떤 위대한 미션을 수행할까요?", "오늘 세상을 바꿀 첫 걸음은?", 
  "당신의 한계를 돌파할 계획을 적어주세요.", "작은 메모가 전설적인 성취로 바뀝니다.",
  "미루지 마세요, 바로 지금입니다!", "목표를 적는 순간, 이미 반은 성공입니다."
];

const TOUR_STEPS = [
  { title: "👋 환영합니다!", desc: "강력한 집중력을 만들어줄 투두리스트 튜토리얼입니다." },
  { title: "⏱️ 타이머 & 스톱워치", desc: "집중할 시간을 설정하거나 측정이 가능합니다. (스톱워치 모드에선 빨간색 경고가 해제됩니다)" },
  { title: "🚨 30분 전 알림 토글", desc: "오른쪽 위 버튼을 켜면, 메인 타이머가 30분 이하로 남았을 때 빨간색으로 깜빡이며 경고해줍니다!" },
  { title: "⏰ 초정밀 마감 카운트다운", desc: "할 일을 추가할 때 달력을 눌러 날짜와 시간을 지정해보세요. 실시간으로 남은 시간이 초 단위로 줄어듭니다." },
  { title: "📝 랜덤 명언과 동기부여", desc: "영문 필기체 명언으로 동기부여를 받아보세요! 새로운 명언 버튼으로 기분 전환도 가능합니다." }
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [inputPlaceholder, setInputPlaceholder] = useState(PLACEHOLDERS[0])
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  
  const [viewType, setViewType] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8;
  const [now, setNow] = useState(new Date());
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [tourIndex, setTourIndex] = useState(-1)

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(intervalId); }, []);

  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }
  const handleRandomize = () => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setInputPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  const getRemainingTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const targetDate = new Date(deadlineStr);
    const diff = targetDate - now;
    if (diff <= 0) return "EXPIRED";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return { days, hours, mins, secs, totalMs: diff };
  }

  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    if (todoDeadline && new Date(todoDeadline) < new Date()) {
      if (!window.confirm("⚠️ 설정하신 마감 기한이 이미 지났습니다. 그래도 추가하시겠습니까?")) return;
    }
    await axios.post(API_URL, { title, importance, todoDeadline }); 
    fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1); handleRandomize();
  }

  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 🚀 7. 메인 타이머 빨간색 30분 전 경고 로직
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col min-h-screen">
      {/* 🚀 9. 구글 웹폰트(필기체) 자동 임포트 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nanum+Pen+Script&display=swap');
        .font-cursive-custom { font-family: 'Caveat', 'Nanum Pen Script', cursive; }
        .font-korean-cursive { font-family: 'Nanum Pen Script', cursive; }
      `}</style>

      {tourIndex >= 0 && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl animate-bounce-short">
            <h3 className="text-blue-600 font-black mb-2 text-xs uppercase tracking-widest">Help Tour ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
            <h2 className="text-2xl font-black text-gray-800 mb-4">{TOUR_STEPS[tourIndex].title}</h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-8">{TOUR_STEPS[tourIndex].desc}</p>
            <div className="flex justify-between gap-3">
              <button onClick={() => setTourIndex(-1)} className="px-4 py-2 text-gray-400 font-bold hover:text-gray-600">종료</button>
              <button onClick={() => setTourIndex(prev => prev + 1 >= TOUR_STEPS.length ? -1 : prev + 1)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black shadow-md hover:bg-blue-700">
                {tourIndex === TOUR_STEPS.length - 1 ? "시작하기" : "다음"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="text-center mb-6 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs hover:bg-yellow-200 transition shadow-sm z-10">💡 도움말 투어 시작</button>
        </div>

        <div className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-b-[12px] border-blue-900 text-center relative mt-8">
          
          {/* 🚀 8. 스톱워치에서는 빨간경고 끄기 */}
          {timerMode === 'timer' && (
            <div className="absolute top-8 right-10 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">30분 전 경고 알림</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} />
                <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-red-500 peer-focus:ring-2 peer-focus:ring-red-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>스톱워치</button>
          </div>

          <div className={`text-7xl font-black mb-10 font-mono tracking-tighter drop-shadow-lg transition-colors duration-500 ${isTimerUrgent ? 'text-red-500 animate-[pulse_1s_ease-in-out_infinite]' : 'text-white'}`}>
            {formatTime(timerTime)}
          </div>

          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-16 p-3 rounded-2xl bg-gray-900 text-white font-bold text-center outline-none focus:ring-2 ring-blue-500"/>
              <button onClick={()=>{
                const h = parseInt(inputs.h)||0; const m = parseInt(inputs.m)||0; const s = parseInt(inputs.s)||0;
                setTimerTime((h*3600 + m*60 + s)*1000); setTimerIsRunning(false);
              }} className="bg-blue-600 px-5 rounded-2xl font-black text-xs hover:bg-blue-500 transition-colors">SET</button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-12 py-4 rounded-full font-black text-lg transition-all ${timerIsRunning?'bg-gray-800 text-gray-500':'bg-white text-black hover:scale-105 active:scale-95'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-800 px-12 py-4 rounded-full font-black text-lg text-gray-600 hover:border-gray-600 transition-colors">RESET</button>
          </div>
        </div>

        <div className="text-center mb-10">
          {/* 🚀 6. 간지나는 제목 변경 */}
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 mb-6 tracking-tighter drop-shadow-sm">
            🔥 한계 돌파 : 오늘의 미션
          </h2>
          
          {/* 🚀 9 & 11. 명언 스타일 대폭 상향 (테두리 및 글꼴) */}
          <div className="flex flex-col items-center p-8 rounded-[2rem] border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 shadow-[inset_0_2px_15px_rgba(0,0,0,0.02)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 rounded-bl-full opacity-30"></div>
            <p className="text-4xl font-cursive-custom text-indigo-700 font-bold mb-4 tracking-wider drop-shadow-sm leading-relaxed text-center">
              "{quote.en}"
            </p>
            <p className="text-2xl font-korean-cursive text-gray-600 font-bold tracking-widest bg-white/60 px-6 py-2 rounded-full shadow-sm">
              {quote.ko}
            </p>
            <button onClick={handleRandomize} className="mt-6 text-[10px] bg-white border border-gray-300 text-gray-500 px-5 py-2 rounded-full font-black hover:text-blue-600 hover:border-blue-400 shadow-sm transition-all hover:scale-105">🔄 명언 새로고침</button>
          </div>
        </div>

        <form onSubmit={addTodo} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-6">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-100 px-4 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-blue-200">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          {/* 🚀 10. 입력창 플레이스홀더 랜덤화 */}
          <input placeholder={inputPlaceholder} value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-2 outline-none font-bold text-gray-700 focus:border-b-2 border-blue-500 transition-all"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-48 p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border focus:ring-2 ring-blue-200 cursor-pointer"/>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition">추가하기</button>
        </form>

        <div className="flex justify-end mb-6 gap-2">
          <button onClick={() => setViewType('list')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='list'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>LIST</button>
          <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='grid'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>GRID</button>
          <button onClick={() => setViewType('table')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>TABLE</button>
        </div>

        {viewType === 'table' ? (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-6 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#111] text-white text-sm font-bold">
                <tr><th className="p-4">우선순위</th><th className="p-4 text-left">미션명</th><th className="p-4">실시간 마감 카운트</th><th className="p-4">완료</th></tr>
              </thead>
              <tbody>
                {currentTodos.map(todo => {
                  const remain = getRemainingTime(todo.todoDeadline);
                  return (
                    <tr key={todo._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}>{todo.importance}</span></td>
                      <td className="p-4 text-left font-black text-gray-700">{todo.title}</td>
                      <td className="p-4">
                        {remain ? (
                          <span className={`text-[11px] font-black ${remain === "EXPIRED" ? "text-gray-400" : (remain.totalMs < 1800000) ? "text-red-500 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-blue-500"}`}>
                            {remain === "EXPIRED" ? "기한 만료" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${remain.secs}초 남음`}
                          </span>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                      </td>
                      <td className="p-4"><button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-300 hover:text-red-500 font-black text-lg">✕</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={viewType === 'list' ? "space-y-4 mb-6" : "grid grid-cols-2 gap-4 mb-6"}>
            {currentTodos.map(todo => {
              const remain = getRemainingTime(todo.todoDeadline);
              return (
                <div key={todo._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-xl group">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}></span>
                      <span className="font-black text-gray-800">{todo.title}</span>
                    </div>
                    {/* 🚀 3. 초 단위 실시간 카운트다운 */}
                    {remain && (
                      <span className={`text-[10px] font-black ml-6 ${remain === "EXPIRED" ? "text-gray-300" : (remain.totalMs < 1800000) ? "text-red-500 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-blue-400"}`}>
                        ⏱️ {remain === "EXPIRED" ? "만료됨" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${remain.secs}초 남음`} {(remain !== "EXPIRED" && remain.totalMs < 1800000) && " [🚨 임박]"}
                      </span>
                    )}
                  </div>
                  <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-200 group-hover:text-red-500 font-black text-lg transition-colors">✕</button>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="font-black text-[#111] text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* 🚀 10. 워터마크 크기 대폭 상향 */}
      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;