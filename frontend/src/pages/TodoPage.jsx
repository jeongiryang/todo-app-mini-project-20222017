// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

// 🚀 10. Placeholder 대량 추가 및 랜덤 갱신
const PLACEHOLDERS = [
  "어떤 위대한 미션을 수행할까요?", "오늘 세상을 바꿀 첫 걸음은?", "당신의 한계를 돌파할 계획을 적어주세요.", 
  "작은 메모가 전설적인 성취로 바뀝니다.", "미루지 마세요, 바로 지금입니다!", "목표를 적는 순간, 이미 반은 성공입니다.",
  "오늘 반드시 끝내야 할 단 하나의 일은?", "미래의 나에게 부끄럽지 않을 미션!", "나태함을 이길 가장 강력한 할 일"
];

// 🚀 9. 명언 대량 추가 (한/영 30개)
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
  { en: "Discipline is the bridge between goals and accomplishment.", ko: "규율은 목표와 성취를 잇는 다리이다." },
  { en: "Action is the foundational key to all success.", ko: "행동은 모든 성공의 기본 열쇠이다." },
  { en: "Don't count the days, make the days count.", ko: "날짜를 세지 말고, 하루하루를 가치 있게 만들어라." },
  { en: "The secret of getting ahead is getting started.", ko: "앞서가는 비밀은 시작하는 것이다." },
  { en: "It always seems impossible until it's done.", ko: "완성되기 전까지는 항상 불가능해 보인다." },
  { en: "Your only limit is you.", ko: "당신의 유일한 한계는 당신 자신이다." }
];

// 🚀 1 & 11. 도움말 튜토리얼 (타겟 ID 포함)
const TOUR_STEPS = [
  { title: "👋 환영합니다!", desc: "강력한 집중력을 만들어줄 V5_super_2.0 ver 투두리스트 튜토리얼입니다.", targetId: "tour-todo-header" },
  { title: "⏱️ 타이머 & 스톱워치", desc: "집중할 시간을 밀리초 단위까지 정밀하게 측정합니다. (스톱워치 모드에선 경고가 해제됩니다)", targetId: "tour-timer" },
  { title: "🚨 30분 전 알림 토글", desc: "오른쪽 위 버튼을 켜면, 타이머가 30분 이하로 남았을 때 빨간색으로 깜빡이며 경고합니다!", targetId: "tour-alert" },
  { title: "⏰ 초정밀 마감 카운트다운", desc: "입력창을 클릭해 달력을 열고 기한을 정해보세요. 소수점 초 단위로 남은 시간이 줄어듭니다.", targetId: "tour-add" },
  { title: "📝 자유로운 수정 가능", desc: "이제 등록된 할 일도 언제든지 'Edit' 버튼을 눌러 내용과 기한을 고칠 수 있습니다!", targetId: "tour-list" }
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [inputPlaceholder, setInputPlaceholder] = useState(PLACEHOLDERS[0])
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  
  // 🚀 6. 투두 수정 기능 State
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  const [viewType, setViewType] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8;
  const [now, setNow] = useState(new Date());
  
  // 🚀 7 & 8. 30분 전 빨간색 경고 토글 (스톱워치에선 숨김 처리)
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  
  const [tourIndex, setTourIndex] = useState(-1)
  const [tourPos, setTourPos] = useState({ top: 0, left: 0 })

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomize(); }, [])
  
  // 🚀 3. 초 단위 실시간 카운트다운을 위한 50ms 인터벌 (부드러운 밀리초 업데이트)
  useEffect(() => { const intervalId = setInterval(() => setNow(new Date()), 50); return () => clearInterval(intervalId); }, []);

  // 도움말 위치 추적
  useEffect(() => {
    if (tourIndex >= 0) {
      const step = TOUR_STEPS[tourIndex];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTourPos({ top: rect.bottom + window.scrollY + 15, left: Math.max(20, rect.left + window.scrollX - 20) });
          el.classList.add('ring-4', 'ring-yellow-400', 'z-50', 'relative', 'bg-black/5');
          setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400', 'z-50', 'relative', 'bg-black/5'), 3000);
        }, 400);
      } else {
        setTourPos({ top: window.scrollY + window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 150 });
      }
    }
  }, [tourIndex]);

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
    const ms = Math.floor((diff % 1000) / 10); // 🚀 3. 밀리초 (소수점 둘째자리까지)
    return { days, hours, mins, secs, ms, totalMs: diff };
  }

  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    if (todoDeadline && new Date(todoDeadline) < new Date()) {
      if (!window.confirm("⚠️ 설정하신 마감 기한이 이미 지났습니다. 그래도 추가하시겠습니까?")) return;
    }
    await axios.post(API_URL, { title, importance, todoDeadline }); 
    fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1); handleRandomize(); // 🚀 10. 추가 시 명언 갱신
  }

  // 🚀 6. 투두 수정 처리 로직
  const saveEditTodo = async (id) => {
    await axios.put(`${COMMON_URL}/${id}`, editForm);
    fetchTodos(); setEditingId(null);
  }

  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 🚀 7. 메인 타이머 긴급 색상 판별
  const isTimerUrgent = timerMode === 'timer' && timerTime > 0 && timerTime <= 1800000 && isAlertEnabled;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col min-h-screen relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nanum+Pen+Script&display=swap');
        .font-cursive-custom { font-family: 'Caveat', 'Nanum Pen Script', cursive; letter-spacing: 0.05em; }
        .font-korean-cursive { font-family: 'Nanum Pen Script', cursive; letter-spacing: 0.1em; }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .tour-popup { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* 🚀 1. 타겟 이동형 튜토리얼 팝업 */}
      {tourIndex >= 0 && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[90] pointer-events-none transition-opacity duration-300"></div>
          <div className="absolute z-[100] bg-white p-6 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.3)] border-[3px] border-indigo-400 w-80 tour-popup transition-all duration-500 ease-in-out"
               style={{ top: tourPos.top, left: tourPos.left }}>
            <div className="absolute -top-3 left-6 w-5 h-5 bg-white border-t-[3px] border-l-[3px] border-indigo-400 rotate-45"></div>
            <h3 className="text-indigo-600 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
            <h2 className="text-xl font-black text-gray-800 mb-3">{TOUR_STEPS[tourIndex].title}</h2>
            <p className="text-gray-600 text-sm font-bold leading-relaxed mb-5">{TOUR_STEPS[tourIndex].desc}</p>
            <div className="flex justify-between gap-2">
              <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">건너뛰기</button>
              <button onClick={() => setTourIndex(prev => prev + 1 >= TOUR_STEPS.length ? -1 : prev + 1)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-indigo-700 transition">
                {tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex-grow">
        <div id="tour-todo-header" className="text-center mb-6 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs hover:bg-yellow-200 transition shadow-sm z-10 animate-pulse">💡 도움말 투어 시작</button>
        </div>

        <div id="tour-timer" className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border-b-[12px] border-indigo-900 text-center relative mt-8">
          
          {/* 🚀 8. 스톱워치에선 숨김 처리, 타이머일 때만 30분 경고 토글 노출 */}
          {timerMode === 'timer' && (
            <div id="tour-alert" className="absolute top-8 right-10 flex items-center gap-2 bg-gray-900 p-2 rounded-xl border border-gray-700">
              <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isAlertEnabled ? 'text-red-400' : 'text-gray-500'}`}>
                30분 전 적색 경고
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isAlertEnabled} onChange={()=>setIsAlertEnabled(!isAlertEnabled)} />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-red-500 peer-focus:ring-2 peer-focus:ring-red-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-6 py-2 rounded-full text-xs font-black transition-all ${timerMode==='timer'?'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]':'bg-gray-800 text-gray-500'}`}>⏳ 집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-6 py-2 rounded-full text-xs font-black transition-all ${timerMode==='stopwatch'?'bg-pink-600 shadow-[0_0_15px_rgba(219,39,119,0.5)]':'bg-gray-800 text-gray-500'}`}>⏱️ 스톱워치</button>
          </div>

          <div className={`text-8xl font-black mb-10 font-mono tracking-tighter drop-shadow-2xl transition-colors duration-300 ${isTimerUrgent ? 'text-red-500 animate-[pulse_0.8s_ease-in-out_infinite]' : 'text-white'}`}>
            {formatTime(timerTime)}
          </div>

          {timerMode === 'timer' && !timerIsRunning && (
            <div className="flex justify-center gap-3 mb-8">
              <input type="number" placeholder="H" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} className="w-20 p-4 rounded-2xl bg-gray-900 text-white font-black text-center text-xl outline-none focus:ring-2 ring-indigo-500"/>
              <input type="number" placeholder="M" value={inputs.m} onChange={e=>setInputs({...inputs, m: e.target.value})} className="w-20 p-4 rounded-2xl bg-gray-900 text-white font-black text-center text-xl outline-none focus:ring-2 ring-indigo-500"/>
              <input type="number" placeholder="S" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} className="w-20 p-4 rounded-2xl bg-gray-900 text-white font-black text-center text-xl outline-none focus:ring-2 ring-indigo-500"/>
              <button onClick={()=>{
                const h = parseInt(inputs.h)||0; const m = parseInt(inputs.m)||0; const s = parseInt(inputs.s)||0;
                setTimerTime((h*3600 + m*60 + s)*1000); setTimerIsRunning(false);
              }} className="bg-indigo-600 px-6 rounded-2xl font-black text-sm hover:bg-indigo-500 transition-colors shadow-lg">SET</button>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={()=>setTimerIsRunning(!timerIsRunning)} className={`px-16 py-5 rounded-full font-black text-xl transition-all shadow-xl ${timerIsRunning?'bg-gray-800 text-gray-400':'bg-white text-black hover:scale-105 active:scale-95'}`}>{timerIsRunning?'PAUSE':'START'}</button>
            <button onClick={()=>{setTimerIsRunning(false); setTimerTime(0); setInputs({h:'',m:'',s:''})}} className="border-2 border-gray-700 px-12 py-5 rounded-full font-black text-lg text-gray-500 hover:text-white hover:border-gray-500 transition-colors">RESET</button>
          </div>
        </div>

        <div className="text-center mb-10">
          {/* 🚀 2. 오늘의 미션 텍스트 변경 */}
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-indigo-800 to-black mb-8 tracking-tighter drop-shadow-sm">
            🎯 오늘의 미션은 무엇인가요?
          </h2>
          
          {/* 🚀 9. 명언 폰트/스타일 대폭 개선 (간지나는 필기체) */}
          <div className="flex flex-col items-center p-10 rounded-[3rem] border-2 border-indigo-100 bg-gradient-to-b from-white to-indigo-50/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-bl-full opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/50 rounded-tr-full opacity-50"></div>
            <p className="text-[2.5rem] font-cursive-custom text-indigo-800 font-bold mb-5 drop-shadow-sm text-center px-4 leading-tight">
              "{quote.en}"
            </p>
            <p className="text-3xl font-korean-cursive text-gray-700 font-bold bg-white/80 px-8 py-3 rounded-full shadow-sm border border-gray-100">
              {quote.ko}
            </p>
            <button onClick={handleRandomize} className="mt-8 text-[11px] bg-white border-2 border-gray-200 text-gray-500 px-6 py-2.5 rounded-full font-black hover:text-indigo-600 hover:border-indigo-400 shadow-sm transition-all hover:scale-105 z-10 uppercase tracking-widest">🔄 New Quote</button>
          </div>
        </div>

        <form id="tour-add" onSubmit={addTodo} className="bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 flex flex-wrap gap-4 mb-8">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-50 px-5 rounded-2xl font-black text-sm outline-none focus:ring-2 ring-indigo-200 border border-gray-100">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          {/* 🚀 10. 랜덤 텍스트 반영 */}
          <input placeholder={inputPlaceholder} value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-3 outline-none font-bold text-gray-800 focus:border-b-2 border-indigo-500 transition-all text-lg bg-transparent"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-56 p-3 bg-gray-50 rounded-2xl text-xs font-black outline-none border border-gray-100 focus:ring-2 ring-indigo-200 cursor-pointer text-gray-600"/>
          <button className="bg-indigo-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-lg">추가하기</button>
        </form>

        <div className="flex justify-end mb-6 gap-2">
          <button onClick={() => setViewType('list')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='list'?'bg-indigo-900 text-white':'bg-white text-gray-400 border-2 border-gray-100'}`}>LIST</button>
          <button onClick={() => setViewType('grid')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='grid'?'bg-indigo-900 text-white':'bg-white text-gray-400 border-2 border-gray-100'}`}>GRID</button>
          <button onClick={() => setViewType('table')} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm ${viewType==='table'?'bg-indigo-900 text-white':'bg-white text-gray-400 border-2 border-gray-100'}`}>TABLE</button>
        </div>

        <div id="tour-list" className="transition-all">
          {viewType === 'table' ? (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-8 w-full">
              <table className="w-full text-center">
                <thead className="bg-[#111] text-white text-sm font-bold uppercase tracking-widest">
                  <tr><th className="p-5">우선순위</th><th className="p-5 text-left">미션명</th><th className="p-5">실시간 마감 카운트</th><th className="p-5">관리</th></tr>
                </thead>
                <tbody>
                  {currentTodos.map(todo => {
                    const remain = getRemainingTime(todo.todoDeadline);
                    return (
                      <tr key={todo._id} className="border-b hover:bg-indigo-50/30 transition-colors">
                        {editingId === todo._id ? (
                          // 🚀 6. 테이블 모드에서의 수정 UI
                          <td colSpan="4" className="p-4 bg-indigo-50/50">
                            <div className="flex gap-2 items-center">
                              <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-2 border rounded-xl font-bold text-xs"><option>긴급</option><option>보통</option><option>낮음</option></select>
                              <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="flex-grow p-2 border rounded-xl font-bold text-sm"/>
                              <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-2 border rounded-xl text-xs font-bold"/>
                              <button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl font-black text-xs">저장</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl font-black text-xs">취소</button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="p-5"><span className={`px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}>{todo.importance}</span></td>
                            <td className="p-5 text-left font-black text-gray-800 text-lg">{todo.title}</td>
                            <td className="p-5">
                              {/* 🚀 3. 밀리초 추가된 실시간 카운트다운 텍스트 */}
                              {remain ? (
                                <span className={`text-xs font-black tracking-wide ${remain === "EXPIRED" ? "text-gray-400" : (remain.totalMs < 1800000) ? "text-red-500 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-indigo-600"}`}>
                                  {remain === "EXPIRED" ? "기한 만료 💀" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}초 남음`}
                                </span>
                              ) : <span className="text-gray-300 text-xs">-</span>}
                            </td>
                            <td className="p-5 flex justify-center gap-2">
                              <button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full transition">Edit</button>
                              <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-[10px] font-black uppercase text-red-400 hover:text-white hover:bg-red-500 bg-red-50 px-3 py-1.5 rounded-full transition">Del</button>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={viewType === 'list' ? "space-y-4 mb-8" : "grid grid-cols-2 gap-5 mb-8"}>
              {currentTodos.map(todo => {
                const remain = getRemainingTime(todo.todoDeadline);
                return (
                  <div key={todo._id} className="bg-white p-7 rounded-[2.5rem] shadow-md border border-gray-100 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-xl group">
                    {editingId === todo._id ? (
                      // 🚀 6. 리스트/카드 모드에서의 수정 UI
                      <div className="flex flex-col gap-3">
                        <select value={editForm.importance} onChange={e=>setEditForm({...editForm, importance: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl font-bold text-sm"><option>긴급</option><option>보통</option><option>낮음</option></select>
                        <input value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl font-black text-gray-800"/>
                        <input type="datetime-local" value={editForm.todoDeadline} onChange={e=>setEditForm({...editForm, todoDeadline: e.target.value})} className="p-3 border-2 border-indigo-100 rounded-xl text-xs font-bold text-gray-600"/>
                        <div className="flex gap-2">
                          <button onClick={() => saveEditTodo(todo._id)} className="bg-green-500 text-white flex-grow py-2.5 rounded-xl font-black text-xs shadow-md">저장</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white flex-grow py-2.5 rounded-xl font-black text-xs shadow-md">취소</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start w-full mb-2">
                          <div className="flex items-center gap-3 w-full">
                            <span className={`min-w-[12px] h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-500'}`}></span>
                            <span className="font-black text-gray-800 text-xl truncate">{todo.title}</span>
                          </div>
                        </div>
                        {remain && (
                          <div className={`text-xs font-black ml-6 mt-1 bg-gray-50 inline-block px-3 py-1.5 rounded-lg border ${remain === "EXPIRED" ? "text-gray-400 border-gray-200" : (remain.totalMs < 1800000) ? "text-red-500 border-red-200 animate-[pulse_0.5s_ease-in-out_infinite]" : "text-indigo-600 border-indigo-100"}`}>
                            ⏱️ {remain === "EXPIRED" ? "만료됨 💀" : `${remain.days > 0 ? remain.days+'일 ' : ''}${remain.hours}시간 ${remain.mins}분 ${String(remain.secs).padStart(2,'0')}.${String(remain.ms).padStart(2,'0')}초 남음`} {(remain !== "EXPIRED" && remain.totalMs < 1800000) && " 🚨"}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4 ml-6">
                          <button onClick={() => {setEditingId(todo._id); setEditForm(todo)}} className="px-4 py-2 bg-indigo-50 text-indigo-500 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition">Edit</button>
                          <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="px-4 py-2 bg-red-50 text-red-400 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition">Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 transition">PREV</button>
            <span className="font-black text-[#111] text-xl bg-gray-100 px-6 py-2 rounded-2xl">{currentPage} <span className="text-gray-400 mx-1">/</span> {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;