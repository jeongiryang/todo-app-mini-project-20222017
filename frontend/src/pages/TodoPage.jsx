// src/pages/TodoPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

// 🚀 4. 영어 명언 + 한글 번역 30개 추가
const QUOTES = [
  { en: "Do not put off until tomorrow what you can do today.", ko: "내일의 할 일을 오늘 하라." },
  { en: "Management creates time.", ko: "관리는 시간을 창조한다." },
  { en: "Failure is the opportunity to begin again more intelligently.", ko: "실패는 다시 시작할 기회다." },
  { en: "If you don't walk today, you'll have to run tomorrow.", ko: "오늘 걷지 않으면 내일 뛰어야 한다." },
  { en: "Focus is a skill.", ko: "집중력이 실력이다." },
  { en: "Small habits make big changes.", ko: "작은 습관이 큰 변화를 만든다." },
  { en: "Well begun is half done.", ko: "시작이 반이다." },
  { en: "This moment will never come back.", ko: "지금 이 순간은 다시 오지 않는다." },
  { en: "Don't just think, act.", ko: "생각만 하지 말고 행동하라." },
  { en: "A goal without a timeline is just a dream.", ko: "꿈을 날짜와 적으면 목표가 된다." },
  { en: "The moment you believe you can, success begins.", ko: "할 수 있다고 믿는 순간 성공은 시작된다." },
  { en: "For a better me than yesterday.", ko: "어제보다 나은 오늘을 위해." },
  { en: "The one who finishes is the one who wins.", ko: "끝까지 하는 것이 이기는 것이다." },
  { en: "The biggest risk is not taking any risk.", ko: "가장 큰 위험은 아무것도 하지 않는 것이다." },
  { en: "Success belongs to the prepared.", ko: "성공은 준비된 자의 몫이다." },
  { en: "Time waits for no one.", ko: "시간은 기다려주지 않는다." },
  { en: "Genius is 1% inspiration and 99% perspiration.", ko: "천재는 99%의 노력이다." },
  { en: "The more you have to do, the simpler you must think.", ko: "할 일이 많을수록 단순하게 생각하라." },
  { en: "Focus on one thing at a time.", ko: "한 번에 하나씩만 집중하라." },
  { en: "When you want to give up is when you are closest.", ko: "포기하고 싶을 때가 가장 가까운 때다." },
  { en: "Pain passes, but accomplishment remains.", ko: "고통은 지나가고 보람은 남는다." },
  { en: "Believing in yourself is the first secret to success.", ko: "자신을 믿는 것이 첫 번째 비결이다." },
  { en: "A goal without a plan is just a wish.", ko: "계획 없는 목표는 희망 사항일 뿐이다." },
  { en: "The busiest people have the most time.", ko: "가장 바쁜 사람이 가장 많은 시간을 가진다." },
  { en: "Today's effort makes tomorrow's me.", ko: "오늘의 노력이 내일의 나를 만든다." },
  { en: "Change begins from within.", ko: "변화는 내면에서 시작된다." },
  { en: "Winners never quit.", ko: "승리자는 결코 그만두지 않는다." },
  { en: "Nothing great was ever achieved without enthusiasm.", ko: "열정 없이는 아무것도 이룰 수 없다." },
  { en: "Opportunity comes to those who seek it.", ko: "기회는 찾는 자에게 온다." },
  { en: "Discipline is the bridge between goals and accomplishment.", ko: "규율은 목표와 성취를 잇는 다리이다." }
];

function TodoPage({ timerMode, setTimerMode, timerTime, setTimerTime, timerIsRunning, setTimerIsRunning }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통'); const [todoDeadline, setTodoDeadline] = useState('')
  const [quote, setQuote] = useState(QUOTES[0])
  const [inputs, setInputs] = useState({ h: '', m: '', s: '' })
  
  // 🚀 9. Todo 테이블 뷰 및 페이지네이션
  const [viewType, setViewType] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8;

  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos(); handleRandomQuote(); }, [])
  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }
  const handleRandomQuote = () => setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000); const milli = Math.floor((ms % 1000) / 10);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(milli).padStart(2,'0')}`;
  }

  const getRemainingTime = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - new Date();
    if (diff <= 0) return "EXPIRED";
    const mins = Math.floor(diff / 60000);
    return { mins, hours: Math.floor(mins / 60), totalMs: diff };
  }

  const addTodo = async (e) => {
    e.preventDefault(); if(!title) return;
    
    // 🚀 11. 마감기한 경고창
    if (todoDeadline && new Date(todoDeadline) < new Date()) {
      if (!window.confirm("⚠️ 설정하신 마감 기한이 이미 지났습니다. 그래도 할 일을 추가하시겠습니까?")) return;
    }

    await axios.post(API_URL, { title, importance, todoDeadline }); 
    fetchTodos(); setTitle(''); setTodoDeadline(''); setCurrentPage(1);
  }

  // 🚀 페이지네이션 로직
  const totalPages = Math.ceil(todos.length / itemsPerPage) || 1;
  const currentTodos = todos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="bg-[#111] text-white p-10 rounded-[4rem] mb-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-b-[12px] border-blue-900 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={()=>{setTimerMode('timer'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='timer'?'bg-blue-600 shadow-lg shadow-blue-500/50':'bg-gray-800 text-gray-500'}`}>집중 타이머</button>
            <button onClick={()=>{setTimerMode('stopwatch'); setTimerTime(0); setTimerIsRunning(false)}} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${timerMode==='stopwatch'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'bg-gray-800 text-gray-500'}`}>스톱워치</button>
          </div>

          <div className="text-7xl font-black mb-10 font-mono tracking-tighter text-white drop-shadow-lg">{formatTime(timerTime)}</div>

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
          <h2 className="text-4xl font-black text-gray-800 mb-4">✅ 해야 할 것</h2>
          {/* 🚀 5. 명언 간지나게 스타일링 (필기체 느낌) */}
          <div className="flex flex-col items-center bg-gray-50 p-6 rounded-3xl border shadow-inner">
            <p className="text-2xl font-[cursive] italic bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-2 leading-relaxed tracking-wide">
              "{quote.en}"
            </p>
            <p className="text-gray-500 font-bold text-sm tracking-wide">{quote.ko}</p>
            <button onClick={handleRandomQuote} className="mt-4 text-[10px] bg-white border text-gray-400 px-3 py-1.5 rounded-full font-bold hover:text-blue-500 shadow-sm transition">🔄 NEW QUOTE</button>
          </div>
        </div>

        <form onSubmit={addTodo} className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-wrap gap-3 mb-6">
          <select value={importance} onChange={e=>setImportance(e.target.value)} className="bg-gray-100 px-4 rounded-2xl font-black text-xs outline-none focus:ring-2 ring-blue-200">
            <option>긴급</option><option>보통</option><option>낮음</option>
          </select>
          <input placeholder="어떤 일을 완료할까요?" value={title} onChange={e=>setTitle(e.target.value)} className="flex-grow p-2 outline-none font-bold text-gray-700 focus:border-b-2 border-blue-500 transition-all"/>
          <input type="datetime-local" value={todoDeadline} onChange={e=>setTodoDeadline(e.target.value)} className="w-48 p-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border focus:ring-2 ring-blue-200"/>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition">ADD</button>
        </form>

        <div className="flex justify-end mb-6 gap-2">
          {/* 🚀 9. 투두 테이블 뷰 추가 */}
          <button onClick={() => setViewType('list')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='list'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>LIST</button>
          <button onClick={() => setViewType('grid')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='grid'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>GRID</button>
          <button onClick={() => setViewType('table')} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>TABLE</button>
        </div>

        {viewType === 'table' ? (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-6 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#111] text-white text-sm font-bold">
                <tr><th className="p-4">우선순위</th><th className="p-4 text-left">할 일</th><th className="p-4">마감/남은 시간</th><th className="p-4">완료</th></tr>
              </thead>
              <tbody>
                {currentTodos.map(todo => {
                  const remain = getRemainingTime(todo.todoDeadline);
                  const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000;
                  return (
                    <tr key={todo._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-black text-white ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}>{todo.importance}</span></td>
                      <td className="p-4 text-left font-black text-gray-700">{todo.title}</td>
                      <td className="p-4">
                        {remain ? (
                          <span className={`text-[11px] font-black ${remain === "EXPIRED" ? "text-gray-400" : isUrgent ? "text-red-500 animate-pulse" : "text-blue-500"}`}>
                            {remain === "EXPIRED" ? "기한 만료" : `${remain.hours}시간 ${remain.mins % 60}분 남음`}
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
              const isUrgent = remain && remain !== "EXPIRED" && remain.totalMs < 1800000;
              return (
                <div key={todo._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-xl group">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shadow-inner ${todo.importance==='긴급'?'bg-red-500':todo.importance==='보통'?'bg-yellow-400':'bg-green-400'}`}></span>
                      <span className="font-black text-gray-800">{todo.title}</span>
                    </div>
                    {remain && (
                      <span className={`text-[10px] font-black ml-6 ${remain === "EXPIRED" ? "text-gray-300" : isUrgent ? "text-red-500 animate-pulse" : "text-blue-400"}`}>
                        ⏱️ {remain === "EXPIRED" ? "만료됨" : `남은 시간: ${remain.hours}시간 ${remain.mins % 60}분`} {isUrgent && " [마감 임박!!]"}
                      </span>
                    )}
                  </div>
                  <button onClick={async ()=>{await axios.delete(`${COMMON_URL}/${todo._id}`); fetchTodos()}} className="text-gray-200 group-hover:text-red-500 font-black text-lg transition-colors">✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* 🚀 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="font-black text-[#111] text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* 🚀 10. 워터마크 크기 증대 */}
      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Created with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default TodoPage;