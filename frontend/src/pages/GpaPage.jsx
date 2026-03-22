import { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, LineController, BarController } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, LineController, BarController );

const GRADE_POINTS = { 'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': null, 'NP': null };
const CREDIT_OPTIONS = [0, 1, 2, 3, 4];
const SEMESTERS = ['1학년 1학기', '1학년 여름방학', '1학년 2학기', '1학년 겨울방학', '2학년 1학기', '2학년 여름방학', '2학년 2학기', '2학년 겨울방학', '3학년 1학기', '3학년 여름방학', '3학년 2학기', '3학년 겨울방학', '4학년 1학기', '4학년 여름방학', '4학년 2학기', '4학년 겨울방학', '5학년 1학기', '5학년 여름방학', '5학년 2학기', '5학년 겨울방학', '6학년 1학기', '6학년 여름방학', '6학년 2학기', '6학년 겨울방학', '기타학기'];

const i18n = {
  ko: {
    casual: {
      graph_title: "📈 성적 추이 분석", dashboard: ["전체 평점", "전공 평점", "최근 학기"], credits: "학점 이수",
      sim_title: "🎯 목표 평점 시뮬레이터", sim_target: "내 목표 평점 (ex: 4.0)", sim_remain: "📚 남은 이수 학점 (ex: 18)",
      sim_placeholder: "목표 평점과 남은 학점을 적어보세요! 😊",
      sim_fail: "이런... 남은 학점 전부 A+ 받아도 목표 달성이 어려워요. 😭",
      sim_pass: "축하해요! 남은 학점 결과와 상관없이 이미 안정권입니다! 🎉",
      sim_calc: (avg) => `목표 달성을 위해 남은 학점 동안 평균 ${avg} 이상을 받아야 해요! 🔥`,
      sec_title: "🔒 데이터 보안 안내", sec_desc: "성적 데이터는 기기에만 안전하게 저장되며 외부로 유출되지 않습니다.",
      h_v1: "성적 입력 및 기본적인 학점 계산 기능 구현 🎓",
      h_v2: "학기별 탭 인터페이스 및 가이드 투어 도입 💡",
      h_v3: "3단 대시보드 및 전공/전체 성적 분석 로직 강화 📊",
      h_v4: "학점 분석 그래프 시각화 및 모바일 UI 고도화 📈",
      h_v5: "UI 감성 선택 & 목표 평점 시뮬레이터 탑재! ✨",
      ver_desc: "25년 2학기 웹프로그래밍 기말과제 `todos_v4`의 최종 진화형! 🔥",
      reg_btn: "등록", sub_name: "과목명", table_head: ["분류", "과목명", "학점", "성적", "관리"]
    },
    formal: {
      graph_title: "Academic Analytics", dashboard: ["CGPA", "Major GPA", "Recent Term"], credits: "Credits Earned",
      sim_title: "GPA Simulator Engine", sim_target: "Target GPA (0.0~4.5)", sim_remain: "Remaining Credits",
      sim_placeholder: "Enter target GPA and remaining credits to simulate.",
      sim_fail: "Target Unattainable. Maximum grade points cannot reach the target.",
      sim_pass: "Target Secured. Current points already exceed the target.",
      sim_calc: (avg) => `Average GPA of ${avg} or higher is required for the target.`,
      sec_title: "[SECURITY]", sec_desc: "Data is isolated in local storage and never transmitted externally.",
      h_v1: "Initial Grade Input & Calculation System",
      h_v2: "Semester-based Tab UI & Guide Tour System",
      h_v3: "Advanced Dashboard Metrics & Major Filtering",
      h_v4: "Data Visualization & Mobile UI Optimization",
      h_v5: "UI Persona Switch & GPA Simulator Engine",
      ver_desc: "Official release of CWNU Portal Grade System V5.0",
      reg_btn: "ADD", sub_name: "Subject Name", table_head: ["Type", "Subject", "Credit", "Grade", "Action"]
    }
  },
  en: {
    casual: {
      graph_title: "📈 Grade Trends", dashboard: ["Overall GPA", "Major GPA", "Recent Term"], credits: "Credits",
      sim_title: "🎯 GPA Goal Simulator", sim_target: "Goal GPA (ex: 4.0)", sim_remain: "📚 Credits Left (ex: 18)",
      sim_placeholder: "Tell me your goal and remaining credits! 😊",
      sim_fail: "Oops... Even with straight A+s, it's hard to reach the goal. 😭",
      sim_pass: "Congrats! You've already reached your goal! 🎉",
      sim_calc: (avg) => `You need an average of ${avg} for the rest of your credits! 🔥`,
      sec_title: "🔒 Security Info", sec_desc: "Your grades stay safe on your device and are never shared.",
      h_v1: "Initial Grade Input & Basic Calculator 🎓",
      h_v2: "Tab Interface & Guide Tour 💡",
      h_v3: "3-tier Dashboard & Major Analysis 📊",
      h_v4: "Data Visualization & Mobile Optimization 📈",
      h_v5: "UI Mode Switch & GPA Simulator! ✨",
      ver_desc: "Final evolution of Web Programming project `todos_v4`! 🔥",
      reg_btn: "Add", sub_name: "Subject", table_head: ["Type", "Subject", "Credits", "Grade", "Manage"]
    },
    formal: {
      graph_title: "Academic Analysis", dashboard: ["CGPA", "Major GPA", "Recent Term"], credits: "Earned",
      sim_title: "GPA Simulator Engine", sim_target: "Target GPA (0.0~4.5)", sim_remain: "Remaining Credits",
      sim_placeholder: "Enter parameters to start academic simulation.",
      sim_fail: "Target Unattainable. Calculated required GPA exceeds 4.5.",
      sim_pass: "Goal Achieved. Current GPA exceeds the target parameters.",
      sim_calc: (avg) => `Required minimum average GPA: ${avg}`,
      sec_title: "[SECURITY]", sec_desc: "Strict client-side architecture. No external data transmission.",
      h_v1: "Grade Input & Calculation Architecture",
      h_v2: "Tab UI & Navigation Guide System",
      h_v3: "Analytical Dashboard & Logic Enhancements",
      h_v4: "Data Visualization & Mobile Scalability",
      h_v5: "Persona Switching & Simulator Integration",
      ver_desc: "CWNU Portal Grade Management System V5.0",
      reg_btn: "ADD", sub_name: "Subject Name", table_head: ["Type", "Subject", "Credits", "Grade", "Action"]
    }
  }
};

function GpaPage({ uiMode, lang }) {
  const STORAGE_KEY = 'cwnu_gpa_v3';
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  const [activeTab, setActiveTab] = useState(SEMESTERS[0]);
  const [form, setForm] = useState({ semester: SEMESTERS[0], name: '', credit: 3, grade: 'A+', isMajor: false });
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({});
  const [showVersionInfo, setShowVersionInfo] = useState(false); 
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [targetGpa, setTargetGpa] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  
  const text = i18n[lang][uiMode];
  const isCasual = uiMode === 'casual';

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }, [courses]);

  // ✅ 누락되었던 addCourse 함수 추가
  const addCourse = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert(lang === 'ko' ? "과목명을 입력해 주세요." : "Please enter the subject name.");
    setCourses([...courses, { ...form, id: Date.now(), credit: parseInt(form.credit) }]);
    setForm({ ...form, name: '', credit: 3, grade: 'A+', isMajor: false });
  };

  // ✅ 누락되었던 saveEdit 함수 추가
  const saveEdit = () => {
    setCourses(courses.map(c => c.id === editingId ? { ...editForm, credit: parseInt(editForm.credit) } : c));
    setEditingId(null);
  };

  const handleDownload = () => {
    if (courses.length === 0) return alert(lang === 'ko' ? "데이터가 없습니다." : "No data to export.");
    const headers = "Semester,Subject,Credit,Grade,Major\n";
    const csvContent = courses.map(c => `${c.semester},${c.name},${c.credit},${c.grade},${c.isMajor ? 'Major' : 'Elective'}`).join("\n");
    const blob = new Blob(["\ufeff" + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `CWNU_GPA_Export.csv`);
    link.click();
  };

  const calc = (list) => {
    if (!list || list.length === 0) return { credits: 0, gpa: '0.00', gpaCredits: 0, totalPoints: 0 };
    const earned = list.reduce((acc, c) => (c.grade !== 'F' && c.grade !== 'NP') ? acc + c.credit : acc, 0);
    const gpaCredits = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + c.credit : acc, 0);
    const pts = list.reduce((acc, c) => GRADE_POINTS[c.grade] !== null ? acc + (c.credit * GRADE_POINTS[c.grade]) : acc, 0);
    return { credits: earned, gpa: gpaCredits === 0 ? '0.00' : (pts / gpaCredits).toFixed(2), gpaCredits, totalPoints: pts };
  };

  const entireGpa = calc(courses);
  const majorGpa = calc(courses.filter(c => c.isMajor));
  const groupedCourses = useMemo(() => {
    return SEMESTERS.map(sem => ({ semester: sem, courses: courses.filter(c => c.semester === sem), summary: calc(courses.filter(c => c.semester === sem)) })).filter(g => g.courses.length > 0);
  }, [courses]);

  const activeSemesterCourses = courses.filter(c => c.semester === activeTab);
  const activeSemesterSummary = calc(activeSemesterCourses);

  const renderSimFeedback = () => {
    if (!targetGpa || !remainingCredits) return <p className="text-xs font-bold text-gray-500">{text.sim_placeholder}</p>;
    const target = parseFloat(targetGpa);
    const remain = parseFloat(remainingCredits);
    if (isNaN(target) || isNaN(remain) || target > 4.5 || remain <= 0) return <p className="text-xs font-bold text-red-500">Invalid Input.</p>;
    
    const requiredTotalPoints = target * (entireGpa.gpaCredits + remain);
    const requiredAverage = (requiredTotalPoints - entireGpa.totalPoints) / remain;

    if (requiredAverage > 4.5) return <p className="text-xs font-bold text-red-600">{text.sim_fail}</p>;
    if (requiredAverage <= 0) return <p className="text-xs font-bold text-blue-600">{text.sim_pass}</p>;
    return <p className="text-xs font-bold text-emerald-600">{text.sim_calc(requiredAverage.toFixed(2))}</p>;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] max-w-3xl w-full shadow-2xl border-4 border-emerald-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 text-center">GPA System V5.0 Update</h3>
            <p className="text-center text-gray-400 font-bold mb-8 text-xs">{text.ver_desc}</p>
            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-5 text-sm">System History</h4>
              <div className="space-y-3 text-xs">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-emerald-600 font-black min-w-[50px]">V5 1.0:</span><span>{text.h_v1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-emerald-600 font-black min-w-[50px]">V5 2.0:</span><span>{text.h_v2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-emerald-600 font-black min-w-[50px]">V5 3.5:</span><span>{text.h_v3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-emerald-600 font-black min-w-[50px]">V5 4.0:</span><span>{text.h_v4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-emerald-200"><span className="text-emerald-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{text.h_v5}</span></p>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Confirm</button>
          </div>
        </div>
      )}

      {showSecurityInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4" onClick={() => setShowSecurityInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4 text-emerald-700 dark:text-emerald-400 text-center">{text.sec_title}</h3>
            <div className="bg-emerald-50 dark:bg-gray-700/50 p-5 rounded-2xl mb-6 text-sm leading-relaxed">
              <p className="mb-4"><strong>Client-Side Only</strong> Architecture.</p>
              <p>{text.sec_desc}</p>
            </div>
            <button onClick={() => setShowSecurityInfo(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black">OK</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="text-center mb-8 relative">
          <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter cursor-pointer" onClick={() => setShowVersionInfo(true)}>
            GPA <span className="text-red-600 italic">V5 5.0</span>
          </h2>
          <p className="text-[10px] font-black text-emerald-500 uppercase mt-2">Academic Performance System</p>
        </div>

        <div className="flex justify-center mb-8 px-2">
           <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 p-3 rounded-2xl text-[10px] md:text-xs font-bold flex items-center gap-2 shadow-sm">
             <span className="font-black">{text.sec_title}</span> 
             <span>{text.sec_desc}</span>
             <button onClick={() => setShowSecurityInfo(true)} className="ml-1 bg-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black">?</button>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[3rem] shadow-lg border mb-10 h-72 md:h-96 relative w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black">{text.graph_title}</h3>
              <button onClick={handleDownload} className="text-[10px] font-black border px-3 py-1.5 rounded-xl hover:bg-gray-50">Export CSV</button>
            </div>
          {groupedCourses.length < 1 ? <div className="flex items-center justify-center h-full text-gray-400 font-bold border-2 border-dashed rounded-3xl">No Data Available</div> : <Chart type='bar' data={{ labels: groupedCourses.map(g => g.semester), datasets: [{ type: 'bar', label: 'Credits', data: groupedCourses.map(g => g.summary.credits), backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: 'rgb(16, 185, 129)', borderWidth: 1, yAxisID: 'y', order: 2 }, { type: 'line', label: 'GPA', data: groupedCourses.map(g => g.summary.gpa), borderColor: '#ef4444', borderWidth: 3, pointRadius: 5, tension: 0.3, yAxisID: 'y1', order: 1 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { y1: { position: 'right', min: 0, max: 4.5 } } }} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: text.dashboard[0], val: entireGpa.gpa, sub: `${entireGpa.credits} ${text.credits}`, color: "emerald-400", bg: "bg-[#111] text-white" },
            { label: text.dashboard[1], val: majorGpa.gpa, sub: `${majorGpa.credits} ${text.credits}`, color: "emerald-600", bg: "bg-white dark:bg-gray-800 border" },
            { label: text.dashboard[2], val: groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.gpa : '0.00', sub: `${groupedCourses.length > 0 ? groupedCourses[groupedCourses.length - 1].summary.credits : 0} ${text.credits}`, color: "gray-500", bg: "bg-white dark:bg-gray-800 border" }
          ].map((d, i) => (
            <div key={i} className={`${d.bg} p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">{d.label}</h3>
              <div className={`text-5xl font-black font-mono text-${d.color}`}>{d.val}</div>
              <p className="text-[10px] font-bold mt-2 opacity-50">{d.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] shadow-inner border mb-10 flex flex-col gap-4">
          <h3 className="text-sm font-black tracking-widest uppercase border-b pb-2">{text.sim_title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" step="0.01" placeholder={text.sim_target} value={targetGpa} onChange={e => setTargetGpa(e.target.value)} className="p-4 rounded-2xl border outline-none focus:border-emerald-400 dark:bg-gray-700 font-bold" />
            <input type="number" placeholder={text.sim_remain} value={remainingCredits} onChange={e => setRemainingCredits(e.target.value)} className="p-4 rounded-2xl border outline-none focus:border-emerald-400 dark:bg-gray-700 font-bold" />
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border shadow-sm min-h-[60px] flex items-center">
            {renderSimFeedback()}
          </div>
        </div>

        <form onSubmit={addCourse} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-lg border grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 items-center">
          <select value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm border">{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <input placeholder={text.sub_name} value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-bold border outline-none focus:border-emerald-400"/>
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <select value={form.credit} onChange={e=>setForm({...form, credit: e.target.value})} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-black text-sm border">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl font-black text-sm text-emerald-800 dark:text-emerald-300 border">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
          </div>
          <div className="md:col-span-2 flex gap-2 h-full">
            <label className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl border cursor-pointer"><input type="checkbox" checked={form.isMajor} onChange={e=>setForm({...form, isMajor: e.target.checked})} className="accent-emerald-500"/><span className="text-xs font-black">M</span></label>
            <button className="flex-[2] bg-emerald-700 text-white rounded-xl font-black text-sm hover:bg-emerald-800 transition">{text.reg_btn}</button>
          </div>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">{SEMESTERS.map(sem => { const has = courses.some(c => c.semester === sem); return ( <button key={sem} onClick={() => setActiveTab(sem)} className={`px-4 py-2 rounded-full whitespace-nowrap font-black text-[10px] transition-all ${activeTab === sem ? 'bg-[#002f6c] text-white shadow-md' : has ? 'bg-white dark:bg-gray-800 text-[#002f6c] border border-[#002f6c]' : 'bg-gray-100 text-gray-400'}`}> {sem} {has && '•'} </button> ); })}</div>
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border overflow-hidden mb-20">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b flex justify-between items-center">
            <h4 className="font-black text-sm">{activeTab} Summary</h4>
            <span className="text-[10px] font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-full border shadow-sm">GPA: {activeSemesterSummary.gpa}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-gray-50 dark:bg-gray-900/30 text-[10px] font-black text-gray-400 uppercase border-b">
                <tr><th className="p-4">{text.table_head[0]}</th><th className="p-4 text-left">{text.table_head[1]}</th><th className="p-4">{text.table_head[2]}</th><th className="p-4">{text.table_head[3]}</th><th className="p-4">{text.table_head[4]}</th></tr>
              </thead>
              <tbody>
                {activeSemesterCourses.map(course => (
                  <tr key={course.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${editingId === course.id ? 'bg-yellow-50/30' : ''}`}>
                    {editingId === course.id ? (
                      <td colSpan="5" className="p-4">
                        <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-gray-700 p-2 rounded-xl border shadow-sm">
                          <input value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="flex-grow p-2 border rounded-lg text-sm font-bold"/>
                          <select value={editForm.credit} onChange={e=>setEditForm({...editForm, credit: e.target.value})} className="p-2 border rounded-lg text-xs">{CREDIT_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}</select>
                          <select value={editForm.grade} onChange={e=>setEditForm({...editForm, grade: e.target.value})} className="p-2 border rounded-lg text-xs">{Object.keys(GRADE_POINTS).map(g=><option key={g} value={g}>{g}</option>)}</select>
                          <button onClick={saveEdit} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-xs">Save</button>
                          <button onClick={()=>setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg font-black text-xs">Cancel</button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-4"><span className="text-[10px] font-black border px-2 py-0.5 rounded-full">{course.isMajor ? 'MAJOR' : 'ELEC'}</span></td>
                        <td className="p-4 text-left font-black text-sm">{course.name}</td>
                        <td className="p-4 text-xs font-bold text-gray-400">{course.credit}</td>
                        <td className="p-4 font-black text-emerald-600">{course.grade}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={()=>{setEditingId(course.id); setEditForm(course);}} className="text-[9px] font-black bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">Edit</button>
                          <button onClick={()=>{if(window.confirm('Delete?')) setCourses(courses.filter(i=>i.id!==course.id))}} className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">Del</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <footer className="py-10 text-center border-t mt-16 w-full">
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1.5">Department of Computer Science | Software Engineering Project</p>
        <p className="text-gray-400 font-bold text-[10px]">© 2026 Jung Yi Ryang. System Version 5.0</p>
      </footer>
    </div>
  );
}

export default GpaPage;