// src/pages/GpaPage.jsx 전체 복사
import { useState, useEffect } from 'react';

const GRADE_POINTS = { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0 };
const CREDITS = [1, 2, 3, 4];

const TOUR_STEPS = [
  { title: "👋 학점계산기 오픈!", desc: "성적은 기기에만 안전하게 암호화되어 저장됩니다. 안심하고 사용하세요!", targetId: "tour-header" },
  { title: "📊 실시간 대시보드", desc: "전공과 교양 학점을 분리해서 보여주고, 4.5 만점을 향한 게이지바가 실시간으로 차오릅니다.", targetId: "tour-dashboard" },
  { title: "📝 간편한 과목 등록", desc: "과목명, 학점, 성적을 입력하고 전공 여부를 체크한 뒤 등록해보세요!", targetId: "tour-form" },
  { title: "📋 내 성적표 관리", desc: "등록된 과목들을 한눈에 확인하고, 실수로 입력한 과목은 언제든 삭제할 수 있습니다.", targetId: "tour-list" }
];

function GpaPage() {
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem('cwnu_gpa')) || []);
  const [form, setForm] = useState({ name: '', credit: 3, grade: 'A+', isMajor: false });
  const [tourIndex, setTourIndex] = useState(-1);
  const [showPerfectScore, setShowPerfectScore] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showModalConfetti, setShowModalConfetti] = useState(false);

  useEffect(() => {
    localStorage.setItem('cwnu_gpa', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    if (showVersionInfo) {
      setShowModalConfetti(true);
      setTimeout(() => setShowModalConfetti(false), 2500);
    }
  }, [showVersionInfo]);

  const calculateGpa = (courseList) => {
    if (courseList.length === 0) return { totalCredits: 0, gpa: 0 };
    const totalCredits = courseList.reduce((acc, curr) => acc + curr.credit, 0);
    const totalPoints = courseList.reduce((acc, curr) => acc + (curr.credit * GRADE_POINTS[curr.grade]), 0);
    return { totalCredits, gpa: (totalPoints / totalCredits).toFixed(2) };
  };

  const allGpa = calculateGpa(courses);
  const majorGpa = calculateGpa(courses.filter(c => c.isMajor));

  useEffect(() => {
    if (courses.length > 0 && parseFloat(allGpa.gpa) === 4.5) {
      setShowPerfectScore(true);
      setTimeout(() => setShowPerfectScore(false), 3000);
    }
  }, [allGpa.gpa, courses.length]);

  const addCourse = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("⚠️ 과목명을 입력해주세요!");
    const newCourse = { ...form, id: Date.now(), credit: parseInt(form.credit) };
    setCourses([...courses, newCourse]);
    setForm({ name: '', credit: 3, grade: 'A+', isMajor: false });
  };

  const deleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col min-h-screen relative">
      <style>{`
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .tour-popup { animation: slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 50% { transform: translateY(-100px) scale(1.2); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
        @keyframes fireswork { 0% { transform: scale(0) rotate(0deg); opacity: 1; } 100% { transform: scale(2) rotate(45deg); opacity: 0; } }
        .golden-firework { position: absolute; animation: fireswork 1.5s ease-out forwards; z-index: 9999; font-size: 4rem; }
      `}</style>

      {showPerfectScore && (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm transition-all">
          <h1 className="absolute top-1/3 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-2xl">✨ 올A+ 전설의 등장 ✨</h1>
          <span className="golden-firework" style={{ left: '20%', top: '50%' }}>🎇</span>
          <span className="golden-firework" style={{ left: '50%', top: '40%', animationDelay: '0.2s' }}>🌟</span>
          <span className="golden-firework" style={{ right: '20%', top: '50%', animationDelay: '0.4s' }}>🎆</span>
        </div>
      )}

      {tourIndex >= 0 && (
        <>
          <div className="fixed inset-0 z-[90] pointer-events-none bg-black/10 transition-opacity duration-300"></div>
          <div className="fixed z-[100] bg-white p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-[3px] border-emerald-400 w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
            <h3 className="text-emerald-600 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{TOUR_STEPS.length})</h3>
            <h2 className="text-xl font-black text-gray-800 mb-3">{TOUR_STEPS[tourIndex].title}</h2>
            <p className="text-gray-600 text-sm font-bold leading-relaxed mb-5">{TOUR_STEPS[tourIndex].desc}</p>
            <div className="flex justify-between gap-2">
              <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs hover:text-gray-600">건너뛰기</button>
              <button onClick={() => setTourIndex(prev => prev + 1 >= TOUR_STEPS.length ? -1 : prev + 1)} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-emerald-700 transition">
                {tourIndex === TOUR_STEPS.length - 1 ? "투어 종료 🎉" : "다음 보기 ▶"}
              </button>
            </div>
          </div>
        </>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          {showModalConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
              <span className="emoji-burst text-6xl" style={{ left: '30%', top: '50%' }}>🎉</span>
              <span className="emoji-burst text-7xl" style={{ animationDelay: '0.1s', left: '50%', top: '40%' }}>✨</span>
              <span className="emoji-burst text-6xl" style={{ animationDelay: '0.2s', left: '70%', top: '50%' }}>🎊</span>
            </div>
          )}
          <div className="bg-white p-8 rounded-[2rem] max-w-2xl w-full shadow-2xl transform transition-all border-4 border-emerald-50" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-600 text-center">🚀 V5_super_3.0 ver 업데이트 내역</h3>
            <p className="text-center text-gray-500 font-bold mb-8 text-xs">웹프로그래밍 과제 25-2 기말대체 `todos_v4`의 최종 진화형!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
                <h4 className="text-gray-500 font-black text-lg mb-4 text-center">🤔 이전 버전 ( todos_v4 )</h4>
                <ul className="text-sm font-medium text-gray-500 space-y-3">
                  <li>❌ 학점 계산기가 전무하여 와글에서 수동으로 확인</li>
                  <li>❌ 성적 입력 양식이 복잡하고 불편</li>
                  <li>❌ 만점 시각 이스터에그 및 통계 대시보드 부재</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-200 shadow-inner">
                <h4 className="text-emerald-600 font-black text-lg mb-4 text-center">✨ 현재 버전 (v5)</h4>
                <ul className="text-sm font-bold text-gray-700 space-y-3">
                  <li>✅ 브라우저 <span className="text-emerald-600 font-black">로컬 스토리지</span>에 안전하게 영구 저장</li>
                  <li>✅ 간편한 성적 입력 및 실시간 GPA 계산 로직</li>
                  <li>✅ 전체/전공 대시보드 및 올A+ 황금 폭죽 구현</li>
                </ul>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition shadow-lg tracking-widest uppercase">확인 완료! 직접 써보기</button>
          </div>
        </div>
      )}

      <TourFocusHandler tourIndex={tourIndex} steps={TOUR_STEPS} />

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-8 relative">
          <button onClick={() => setTourIndex(0)} className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-black text-xs hover:bg-yellow-200 transition shadow-sm z-10 animate-pulse">💡 도움말 투어 시작</button>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-3 tracking-tighter drop-shadow-sm flex justify-center items-center cursor-pointer">
            {/* 🚀 0 가림 문제 해결: 가로 패딩 px-2 추가, 버전 3.0 공식 업데이트 */}
            CWNU GPA <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-3 px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 italic text-4xl animate-[pulse_1.5s_ease-in-out_infinite] hover:-skew-x-12 hover:scale-110 transition-transform duration-300 drop-shadow-lg">V5_super_3.0</span>
          </h2>
          {/* 업데이트 문구 힌트 추가 */}
          <p className="text-gray-400 font-bold text-xs mb-3 cursor-pointer hover:text-emerald-400 transition" onClick={() => setShowVersionInfo(true)}>(버전 업데이트 내용이 궁금하다면 V5를 클릭해보세요! 🚀)</p>
          <p className="text-emerald-600 font-bold text-sm bg-emerald-50 inline-block px-5 py-2 rounded-full shadow-inner border border-emerald-100">🔒 성적 정보는 오직 이 기기에만 안전하게 보관됩니다.</p>
        </div>

        <div id="tour-dashboard" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#111] p-8 rounded-[3rem] shadow-2xl border-b-[10px] border-emerald-900 flex flex-col justify-center items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <h3 className="text-gray-400 font-black tracking-widest uppercase text-xs mb-2">전체 평점 (Overall GPA)</h3>
            <div className="flex items-end gap-2">
              <span className={`text-7xl font-black font-mono tracking-tighter transition-colors duration-500 ${parseFloat(allGpa.gpa) >= 4.0 ? 'text-emerald-400' : parseFloat(allGpa.gpa) >= 3.0 ? 'text-yellow-400' : 'text-white'}`}>
                {allGpa.gpa}
              </span>
              <span className="text-2xl font-bold text-gray-500 mb-2">/ 4.5</span>
            </div>
            <p className="text-sm font-bold text-gray-400 mt-4 bg-gray-800 px-4 py-1.5 rounded-full">총 이수 학점 : <span className="text-white">{allGpa.totalCredits}</span> 학점</p>
            
            <div className="w-full bg-gray-800 h-3 rounded-full mt-6 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-out" style={{ width: `${(parseFloat(allGpa.gpa) / 4.5) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-emerald-50 flex flex-col justify-center items-center relative overflow-hidden">
            <h3 className="text-emerald-600 font-black tracking-widest uppercase text-xs mb-2">전공 평점 (Major GPA)</h3>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black font-mono tracking-tighter text-gray-800">
                {majorGpa.gpa}
              </span>
              <span className="text-xl font-bold text-gray-400 mb-1">/ 4.5</span>
            </div>
            <p className="text-sm font-bold text-gray-500 mt-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">전공 이수 : <span className="text-emerald-600">{majorGpa.totalCredits}</span> 학점</p>
            <div className="w-full bg-gray-100 h-3 rounded-full mt-6 overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-1000 ease-out" style={{ width: `${(parseFloat(majorGpa.gpa) / 4.5) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <form id="tour-form" onSubmit={addCourse} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-emerald-100 flex flex-wrap items-center gap-4 mb-10 transition-all hover:shadow-xl">
          <input placeholder="무슨 과목을 들으셨나요?" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-grow p-4 outline-none font-black text-gray-800 focus:bg-emerald-50 rounded-2xl transition-colors text-lg border-2 border-transparent focus:border-emerald-200"/>
          
          <div className="flex items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <select value={form.credit} onChange={e=>setForm({...form, credit: e.target.value})} className="bg-transparent px-4 font-black text-gray-700 outline-none cursor-pointer">
              {CREDITS.map(c => <option key={c} value={c}>{c}학점</option>)}
            </select>
          </div>

          <div className="flex items-center bg-emerald-50 p-2 rounded-2xl border border-emerald-100">
            <select value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="bg-transparent px-4 font-black text-emerald-700 outline-none cursor-pointer text-lg">
              {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={form.isMajor} onChange={e=>setForm({...form, isMajor: e.target.checked})} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"/>
            <span className="font-black text-sm text-gray-600">전공과목</span>
          </label>

          <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-lg tracking-widest">
            성적 추가
          </button>
        </form>

        <div id="tour-list" className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-10 w-full transition-all">
          <div className="bg-[#f8fafc] p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-black text-gray-700 ml-4">📚 내 성적표 상세</h3>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border shadow-sm">총 {courses.length}과목</span>
          </div>
          {courses.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-bold">아직 등록된 성적이 없습니다. 위에서 성적을 추가해주세요!</div>
          ) : (
            <table className="w-full text-center">
              <thead className="bg-white text-gray-400 text-xs font-black tracking-widest uppercase border-b-2 border-gray-100">
                <tr><th className="p-5">분류</th><th className="p-5 text-left">과목명</th><th className="p-5">학점</th><th className="p-5">성적</th><th className="p-5">관리</th></tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors">
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm ${course.isMajor ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                        {course.isMajor ? '전공' : '교양'}
                      </span>
                    </td>
                    <td className="p-5 text-left font-black text-gray-800 text-lg">{course.name}</td>
                    <td className="p-5 font-bold text-gray-500">{course.credit}학점</td>
                    <td className="p-5 font-black text-xl text-emerald-600">{course.grade}</td>
                    <td className="p-5">
                      <button onClick={() => deleteCourse(course.id)} className="text-[10px] font-black uppercase text-red-400 hover:text-white hover:bg-red-500 bg-red-50 px-4 py-2 rounded-xl transition">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Portal System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  );
}

function TourFocusHandler({ tourIndex, steps }) {
  useEffect(() => {
    if (tourIndex >= 0) {
      const step = steps[tourIndex];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const highlightClasses = ['ring-[6px]', 'ring-emerald-400', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-[2.5rem]'];
        el.classList.add(...highlightClasses);
        return () => el.classList.remove(...highlightClasses);
      }
    }
  }, [tourIndex, steps]);
  return null;
}

export default GpaPage;