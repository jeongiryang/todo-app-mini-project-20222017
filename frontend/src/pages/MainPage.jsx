import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const i18n = {
  ko: {
    casual: {
      sub_title: "학우들을 위한 올인원 캠퍼스 솔루션 ✨",
      guide_btn: "💡 도움말",
      ticker_title: "🔔 최신 업데이트",
      enter: "입장하기 →",
      ver_desc: "25년 2학기 웹프로그래밍 기말과제 `todos_v4`의 최종 진화형! 🔥",
      prev_ver: "🤔 이전 버전",
      curr_ver: "✨ 현재 버전 (v5 5.0)",
      prev_list: ["새로고침하면 데이터 소실... 😭", "텍스트 위주의 투박한 디자인"],
      curr_list: ["내 맘대로 고르는 UI 감성 모드! 🎨", "실시간 대시보드 위젯 추가 ✨", "학점 시뮬레이터 탑재로 목표 달성! 🎓"],
      history_title: "🛠️ CWNU PORTAL 발전 과정",
      h_v1: "물품 등록 및 기본적인 목록 조회 시스템 구축 🏪",
      h_v2: "사용자 도움말 투어 및 거래 편의 기능 추가 💡",
      h_v3: "실시간 찜하기 및 카드/테이블 뷰 전환 도입 ❤️",
      h_v4: "MongoDB 연동 데이터 보존 및 검색 기능 강화 🚀",
      h_v5: "UI 감성 선택 & 실시간 대시보드 위젯 탑재! ✨",
      todo_side: "📝 Todo 브리핑",
      market_side: "🏪 마켓 소식",
      no_data: "항목이 없습니다.",
      market_free: "🎁 무료 나눔"
    },
    formal: {
      sub_title: "창원대학교 종합 학사 지원 시스템 (Version 5.0)",
      guide_btn: "Guide",
      ticker_title: "System Updates",
      enter: "Enter System",
      ver_desc: "CWNU Portal System 공식 버전 5.0 릴리즈 안내",
      prev_ver: "[ 이전 버전 한계 ]",
      curr_ver: "[ V5 5.0 개선 사항 ]",
      prev_list: ["데이터 영구 보존 기술 미적용", "UI/UX 최적화 및 페르소나 시스템 부재"],
      curr_list: ["UI 페르소나(Casual/Formal) 스위칭 탑재", "데이터 연동 기반 실시간 대시보드 구현", "정밀 학점 시뮬레이션 엔진 최적화"],
      history_title: "System Evolution History",
      h_v1: "물품 등록 및 기초 목록 조회 시스템 구축",
      h_v2: "사용자 도움말 투어 및 거래 편의 기능 도입",
      h_v3: "실시간 관심도 시스템 및 다중 뷰 모드 전환",
      h_v4: "DB 연동 데이터 무결성 확보 및 통합 검색 강화",
      h_v5: "UI 페르소나 시스템 및 목표 평점 엔진 탑재",
      todo_side: "Todo Dashboard",
      market_side: "Market Updates",
      no_data: "데이터가 없습니다.",
      market_free: "무료 나눔"
    }
  },
  en: {
    casual: {
      sub_title: "All-in-one Campus Solution for Students ✨",
      guide_btn: "💡 Help",
      ticker_title: "🔔 Recent Updates",
      enter: "Enter →",
      ver_desc: "Final evolution of Web Programming project `todos_v4`! 🔥",
      prev_ver: "🤔 Old Versions",
      curr_ver: "✨ New Version (v5 5.0)",
      prev_list: ["Data lost after refresh... 😭", "Text-heavy and dull design"],
      curr_list: ["Pick your UI Persona! 🎨", "Real-time dashboard widgets ✨", "GPA Simulator for your goals! 🎓"],
      history_title: "🛠️ CWNU PORTAL Roadmap",
      h_v1: "Item registration & basic list view 🏪",
      h_v2: "User guide tour & trading convenience 💡",
      h_v3: "Real-time wishlist & view mode switch ❤️",
      h_v4: "MongoDB integration & advanced search 🚀",
      h_v5: "UI Mode Switch & Real-time Dashboards! ✨",
      todo_side: "📝 Todo Briefing",
      market_side: "🏪 Market News",
      no_data: "No items found.",
      market_free: "🎁 Free Share"
    },
    formal: {
      sub_title: "CWNU Academic Support System (Version 5.0)",
      guide_btn: "Guide",
      ticker_title: "System Updates",
      enter: "Enter System",
      ver_desc: "Official release of CWNU Portal System V5.0",
      prev_ver: "[ Legacy Issues ]",
      curr_ver: "[ V5 5.0 Key Features ]",
      prev_list: ["Lack of persistent data storage", "Absence of UI Persona Optimization"],
      curr_list: ["Implemented UI Persona (Casual/Formal) Switch", "Data-driven Real-time Dashboard Widgets", "Optimized Academic Simulation Engine"],
      history_title: "System Evolution History",
      h_v1: "Initial Marketplace implementation",
      h_v2: "User Guide Tour & UI Improvements",
      h_v3: "Wishlist & Multi-view layout system",
      h_v4: "Database integration & Global Search",
      h_v5: "UI Persona Switch & GPA Simulator Engine",
      todo_side: "Todo Dashboard",
      market_side: "Market Updates",
      no_data: "No data available.",
      market_free: "Free Share"
    }
  }
};

const TOUR_STEPS = (lang, isCasual) => {
  const t = {
    ko: {
      s1: ["👋 환영합니다!", "창원대 학우들을 위한 스마트 포털입니다."],
      s2: ["🚀 핵심 서비스", "중고 마켓, ToDo, 학점 계산기를 이용해보세요."],
      s3: ["📢 공식 소식", "학교 공지사항과 와글 포털 바로가기입니다."],
      s4: ["🏫 캠퍼스 퀵 링크", "주요 학사 메뉴 모음입니다."]
    },
    en: {
      s1: ["👋 Welcome!", "Smart Portal for CWNU students."],
      s2: ["🚀 Core Services", "Check out Market, Todo, and GPA Calculator."],
      s3: ["📢 Official News", "Direct links to School Notices and Wagle."],
      s4: ["🏫 Campus Shortcuts", "Quick access to essential academic menus."]
    }
  };
  const tf = {
    ko: {
      s1: ["시스템 접속 안내", "창원대학교 학우 전용 스마트 포털 인터페이스입니다."],
      s2: ["주요 서비스 구성", "중고 마켓, 일정 관리, 성적 산출 시스템입니다."],
      s3: ["학내 공식 공지", "공식 공지사항 및 학사 정보로 연결됩니다."],
      s4: ["학사 정보 호출", "필수 학사 서비스 단축 아이콘 구성입니다."]
    },
    en: {
      s1: ["System Guide", "Official Smart Portal Interface for CWNU Students."],
      s2: ["Service Architecture", "Market, Task Management, and Grade Analysis."],
      s3: ["Official Notices", "Connection to Academic Announcements."],
      s4: ["Academic Shortcuts", "Fast access to essential campus resources."]
    }
  };
  const active = isCasual ? t[lang] : tf[lang];
  return [
    { title: active.s1[0], desc: active.s1[1], targetId: "tour-main-header" },
    { title: active.s2[0], desc: active.s2[1], targetId: "tour-main-services" },
    { title: active.s3[0], desc: active.s3[1], targetId: "tour-main-notices" },
    { title: active.s4[0], desc: active.s4[1], targetId: "tour-main-shortcuts" }
  ];
};

function MainPage({ uiMode, lang }) {
  const [tourIndex, setTourIndex] = useState(-1);
  const [recentTodos, setRecentTodos] = useState([]);
  const [recentMarkets, setRecentMarkets] = useState([]);
  const [showVersionInfo, setShowVersionInfo] = useState(false);

  const isCasual = uiMode === 'casual';
  const text = i18n[lang][uiMode];
  const steps = TOUR_STEPS(lang, isCasual);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todoRes, marketRes] = await Promise.all([
          axios.get('/api/todo').catch(() => ({ data: [] })),
          axios.get('/api/market').catch(() => ({ data: [] }))
        ]);
        setRecentTodos(todoRes.data.filter(t => !t.completed).sort((a, b) => new Date(a.todoDeadline || '9999') - new Date(b.todoDeadline || '9999')).slice(0, 4));
        setRecentMarkets(marketRes.data.filter(m => !m.completed).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4));
      } catch (e) { console.error("API Link Error", e); }
    };
    fetchData();
  }, []);

  const services = [
    { title: lang === 'ko' ? "중고 마켓" : "Market", desc: isCasual ? (lang === 'ko' ? "학우들과 즐겁게 물건을 나누세요." : "Share items with your fellow students!") : (lang === 'ko' ? "학우 간의 투명한 물품 거래를 지원합니다." : "Supporting transparent item trading."), icon: "🏪", short: "MARKET", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: lang === 'ko' ? "ToDo List" : "ToDo List", desc: isCasual ? (lang === 'ko' ? "집중 타이머와 함께 일정을 관리하세요." : "Manage your schedule with a focus timer.") : (lang === 'ko' ? "체계적인 일정 관리 및 시간 측정 시스템입니다." : "Structured task management and time measurement."), icon: "📝", short: "TODO", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: lang === 'ko' ? "학점 계산기" : "GPA Calc", desc: isCasual ? (lang === 'ko' ? "실시간 그래프로 성적을 분석하세요." : "Analyze your grades with real-time graphs.") : (lang === 'ko' ? "데이터 분석 기반의 학점 산출 도구입니다." : "Data-driven academic analysis tool."), icon: "🎓", short: "GPA", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  const quickLinks = [
    { name: lang === 'ko' ? "e캠퍼스" : "e-Campus", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻", initial: "E" },
    { name: lang === 'ko' ? "학사일정" : "Calendar", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅", initial: "C" },
    { name: lang === 'ko' ? "학사안내" : "Info", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜", initial: "I" }, 
    { name: lang === 'ko' ? "수강신청" : "Enrollment", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚", initial: "R" },
    { name: lang === 'ko' ? "드림캐치" : "DreamCatch", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭", initial: "D" },
    { name: lang === 'ko' ? "이뤄드림" : "e-Dream", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟", initial: "A" },
  ];

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < steps.length) {
      const el = document.getElementById(steps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, steps]);

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors relative">
      <style>{`.tour-popup { animation: slide-up 0.4s forwards; } @keyframes slide-up { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      {/* 도움말 투어 모달 */}
      {tourIndex >= 0 && (
        <div className="fixed z-[150] bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 w-[92%] max-w-[350px] bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase">Guide ({tourIndex + 1}/{steps.length})</h3>
          <h2 className="text-lg font-black mb-2 dark:text-white">{steps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs font-bold mb-5">{steps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 font-bold text-xs">Skip</button>
            <button onClick={() => setTourIndex(p => p+1 >= steps.length ? -1 : p+1)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-md">Next</button>
          </div>
        </div>
      )}

      {/* 업데이트 내역 모달 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] max-w-3xl w-full shadow-2xl border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center">V5 5.0 Upgrade News</h3>
            <p className="text-center text-gray-400 font-bold mb-8 text-xs">{text.ver_desc}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <h4 className="text-gray-500 font-black text-sm mb-4 text-center">{text.prev_ver}</h4>
                <ul className="text-xs font-medium text-gray-500 space-y-2 list-disc pl-4">{text.prev_list.map((l,i)=><li key={i}>{l}</li>)}</ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl border-2 border-blue-200">
                <h4 className="text-blue-600 dark:text-blue-400 font-black text-sm mb-4 text-center">{text.curr_ver}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 list-disc pl-4">{text.curr_list.map((l,i)=><li key={i}>{l}</li>)}</ul>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-5 text-sm">{text.history_title}</h4>
              <div className="space-y-3 text-xs">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 1.0:</span><span>{text.h_v1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 2.0:</span><span>{text.h_v2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 3.5:</span><span>{text.h_v3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 4.0:</span><span>{text.h_v4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm border border-blue-200"><span className="text-blue-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{text.h_v5}</span></p>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Confirm</button>
          </div>
        </div>
      )}

      {/* 사이드 대시보드 (PC) */}
      <aside className="hidden xl:flex flex-col fixed left-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border rounded-3xl p-6 shadow-xl z-40">
        <h3 className="font-black text-xs text-indigo-600 dark:text-indigo-400 mb-4 border-b pb-3 tracking-widest uppercase">{text.todo_side}</h3>
        <div className="flex flex-col gap-3">
          {recentTodos.length > 0 ? recentTodos.map(todo => (
            <Link key={todo._id} to="/todo" className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
              <span className="font-bold text-xs truncate block">{todo.title}</span>
              <span className="text-[10px] font-black text-gray-400 mt-1">{todo.importance}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">{text.no_data}</p>}
        </div>
      </aside>

      <aside className="hidden xl:flex flex-col fixed right-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border rounded-3xl p-6 shadow-xl z-40">
        <h3 className="font-black text-xs text-blue-600 dark:text-blue-400 mb-4 border-b pb-3 tracking-widest uppercase">{text.market_side}</h3>
        <div className="flex flex-col gap-3">
          {recentMarkets.length > 0 ? recentMarkets.map(item => (
            <Link key={item._id} to="/market" className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-blue-50 transition-colors">
              <span className="font-bold text-xs truncate block">{item.title}</span>
              <span className="text-[10px] font-black mt-1 text-gray-400">{item.price === 0 ? text.market_free : `${Number(item.price).toLocaleString()}`}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">{text.no_data}</p>}
        </div>
      </aside>

      <div className="flex-grow flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div id="tour-main-header" className="text-center mb-10 relative">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter">
              CWNU <span className="text-blue-600">SMART</span> PORTAL
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl font-black text-xs border">{text.guide_btn}</button>
          </div>
          <p className="text-gray-500 font-bold text-sm md:text-base cursor-pointer" onClick={() => setShowVersionInfo(true)}>{text.sub_title}</p>
        </div>

        {/* 모바일 알림 바 */}
        <div className="xl:hidden w-full bg-gray-50 dark:bg-gray-800/50 border p-4 rounded-2xl mb-8 flex flex-col gap-2">
          <div className="font-black text-[10px] text-gray-400 tracking-widest uppercase">{text.ticker_title}</div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {recentTodos.concat(recentMarkets).map((item, idx) => (
              <Link key={idx} to={item.importance ? "/todo" : "/market"} className="flex-shrink-0 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border shadow-sm flex items-center gap-2 max-w-[200px]">
                <span className={`w-1.5 h-1.5 rounded-full ${item.importance ? 'bg-indigo-500' : 'bg-blue-500'}`}></span>
                <span className="text-xs font-bold truncate">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div id="tour-main-services" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((s, idx) => (
            <Link key={idx} to={s.path} className="group relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1.5 border flex flex-col justify-between h-full">
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${s.color}`}></div>
              <div>
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform">
                  {isCasual ? s.icon : <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.color} tracking-tighter`}>{s.short}</span>}
                </div>
                <h3 className="text-xl font-black mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">{s.desc}</p>
              </div>
              <div className="inline-block w-max px-5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-[10px] font-black border group-hover:bg-indigo-600 group-hover:text-white transition-all">{text.enter}</div>
            </Link>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-[3rem] border transition-colors">
          <div id="tour-main-notices" className="mb-10">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-l-4 pl-3">Official Announcements</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" target="_blank" rel="noreferrer" className="flex-1 bg-white dark:bg-gray-800 text-[#002f6c] font-black text-sm p-4 rounded-2xl shadow-sm border text-center">창원대학교 공지사항</a>
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" className="flex-1 bg-[#002f6c] text-white font-black text-sm p-4 rounded-2xl shadow-sm text-center">와글 포털 접속</a>
            </div>
          </div>
          <div id="tour-main-shortcuts">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-l-4 pl-3">Campus Shortcuts</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{isCasual ? link.icon : <span className="font-black text-gray-300 dark:text-gray-600">{link.initial}</span>}</span>
                  <span className="text-[10px] font-black text-gray-600 text-center">{link.name}</span>
                </a>
              ))}
            </div>
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

export default MainPage;