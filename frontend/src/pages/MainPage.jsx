import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TOUR_STEPS = (isCasual) => [
  { title: isCasual ? "👋 환영합니다!" : "시스템 접속 안내", desc: isCasual ? "창원대 학우들을 위한 스마트 포털입니다." : "창원대학교 학우 전용 스마트 포털 인터페이스입니다.", targetId: "tour-main-header" },
  { title: isCasual ? "🚀 핵심 서비스" : "주요 서비스 구성", desc: isCasual ? "중고 마켓, ToDo, 학점 계산기를 바로 이용해보세요." : "중고 마켓, 일정 관리, 성적 산출 시스템을 이용할 수 있습니다.", targetId: "tour-main-services" },
  { title: isCasual ? "📢 공식 소식 & 와글" : "학내 공지 및 포털", desc: isCasual ? "학교 공지사항과 와글 포털로 바로 이동할 수 있습니다." : "학교 공식 공지사항 및 와글 시스템으로 연결됩니다.", targetId: "tour-main-notices" },
  { title: isCasual ? "🏫 캠퍼스 퀵 링크" : "학사 정보 바로가기", desc: isCasual ? "e캠퍼스, 수강신청 등 자주 찾는 메뉴를 모아두었습니다." : "학사 일정, 수강 신청 등 필수 학사 메뉴를 신속히 호출합니다.", targetId: "tour-main-shortcuts" }
];

function MainPage({ uiMode }) {
  const [tourIndex, setTourIndex] = useState(-1);
  const [recentTodos, setRecentTodos] = useState([]);
  const [recentMarkets, setRecentMarkets] = useState([]);
  const isCasual = uiMode === 'casual';
  const steps = TOUR_STEPS(isCasual);

  const [showVersionInfo, setShowVersionInfo] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [todoRes, marketRes] = await Promise.all([
          axios.get('/api/todo').catch(() => ({ data: [] })),
          axios.get('/api/market').catch(() => ({ data: [] }))
        ]);
        setRecentTodos(todoRes.data.filter(t => !t.completed).sort((a, b) => new Date(a.todoDeadline || '9999') - new Date(b.todoDeadline || '9999')).slice(0, 4));
        setRecentMarkets(marketRes.data.filter(m => !m.completed).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4));
      } catch (error) { console.error("Dashboard link failed", error); }
    };
    fetchDashboardData();
  }, []);

  const services = [
    { title: "중고 마켓", desc: isCasual ? "학우들과 즐겁게 물건을 나누세요." : "학우 간의 투명한 물품 거래를 지원합니다.", icon: "🏪", short: "MARKET", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: "ToDo List", desc: isCasual ? "집중 타이머와 함께 일정을 관리하세요." : "정밀 타이머 기반의 체계적인 일정 관리 시스템입니다.", icon: "📝", short: "TODO", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: "학점 계산기", desc: isCasual ? "실시간 그래프로 성적을 분석하세요." : "데이터 분석 기반의 학점 산출 및 시뮬레이션 도구입니다.", icon: "🎓", short: "GPA", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  const quickLinks = [
    { name: "e캠퍼스", url: "https://ecampus.changwon.ac.kr/login.php?mi=18314", icon: "💻", initial: "E" },
    { name: "학사일정", url: "https://www.changwon.ac.kr/haksa/sv/schdulView/schdulCalendarView.do?mi=10980", icon: "📅", initial: "C" },
    { name: "학사안내", url: "https://www.changwon.ac.kr/haksa/main.do", icon: "📜", initial: "I" }, 
    { name: "수강신청", url: "https://chains.changwon.ac.kr/nonstop/suup/sugang/hakbu/index.php?mi=18302", icon: "📚", initial: "R" },
    { name: "드림캐치", url: "https://dreamcatch.changwon.ac.kr/main.do?mi=18316", icon: "🧭", initial: "D" },
    { name: "이뤄드림", url: "https://edream.changwon.ac.kr/?mi=18315", icon: "🌟", initial: "A" },
  ];

  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < steps.length) {
      const el = document.getElementById(steps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
      }
    }
  }, [tourIndex, steps]);

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors relative">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 도움말 투어 모달 */}
      {tourIndex >= 0 && (
        <div className="fixed z-[150] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{steps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{steps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{steps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">건너뛰기</button>
            <button onClick={() => setTourIndex(p => p+1 >= steps.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">
              {tourIndex === steps.length - 1 ? (isCasual ? "투어 종료 🎉" : "종료") : (isCasual ? "다음 보기 ▶" : "다음")}
            </button>
          </div>
        </div>
      )}

      {/* 업데이트 내역 모달 (V5 1.0~V5.0 완벽 히스토리) */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center">
              PORTAL V5 5.0 Update News
            </h3>
            <p className="text-center text-gray-400 dark:text-gray-500 font-bold mb-6 text-[10px] md:text-xs tracking-tighter">
              {isCasual ? "25년 2학기 웹프로그래밍 기말과제 `todos_v4`의 최종 진화형! 🔥" : "CWNU Portal System 공식 버전 5.0 릴리즈 안내"}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">{isCasual ? "🤔 이전 버전" : "[ 이전 버전 ]"}</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4">
                  <li>{isCasual ? "새로고침하면 데이터 소실... 😭" : "데이터 영구 보존 기술 미적용"}</li>
                  <li>{isCasual ? "텍스트 위주의 투박한 디자인" : "UI/UX 고도화 및 최적화 미비"}</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                <h4 className="text-blue-600 dark:text-blue-400 font-black text-sm mb-3 text-center">{isCasual ? "✨ 현재 버전 (v5 5.0)" : "[ V5 5.0 개선 사항 ]"}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 list-disc pl-4">
                  <li>{isCasual ? "내 맘대로 고르는 UI 감성 모드! 🎨" : "UI 페르소나(Casual/Formal) 스위칭 탑재"}</li>
                  <li>{isCasual ? "실시간 대시보드 위젯 추가 ✨" : "데이터 연동 기반 실시간 대시보드 구현"}</li>
                  <li>{isCasual ? "학점 시뮬레이터 탑재로 목표 달성! 🎓" : "정밀 학점 시뮬레이션 엔진 최적화"}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm">🛠️ CWNU PORTAL System History</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 1.0:</span><span>{isCasual ? "물품 등록 및 기본적인 목록 조회 시스템 구축 🏪" : "물품 등록 및 기초 목록 조회 시스템 구축"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 2.0:</span><span>{isCasual ? "사용자 도움말 투어 및 거래 편의 기능 추가 💡" : "사용자 도움말 투어 및 거래 편의 기능 도입"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 3.5:</span><span>{isCasual ? "실시간 찜하기 및 카드/테이블 뷰 전환 도입 ❤️" : "실시간 관심도 시스템 및 다중 뷰 모드 전환"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 4.0:</span><span>{isCasual ? "MongoDB 연동 데이터 보존 및 검색 기능 강화 🚀" : "DB 연동 데이터 무결성 확보 및 통합 검색 강화"}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-blue-200"><span className="text-blue-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{isCasual ? "UI 감성 선택 & 실시간 대시보드 위젯 탑재! ✨" : "UI 페르소나 시스템 및 목표 평점 엔진 탑재"}</span></p>
              </div>
            </div>

            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition">확인 완료</button>
          </div>
        </div>
      )}

      {/* PC 전용 좌측 사이드바: TODO */}
      <aside className="hidden xl:flex flex-col fixed left-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-xl z-40 transition-colors">
        <h3 className="font-black text-xs text-indigo-600 dark:text-indigo-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 tracking-widest uppercase">
          {isCasual ? "📝 Todo Briefing" : "Todo Dashboard"}
        </h3>
        <div className="flex flex-col gap-3">
          {recentTodos.length > 0 ? recentTodos.map(todo => (
            <Link key={todo._id} to="/todo" className="group flex flex-col bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
              <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{todo.title}</span>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-1">{todo.importance}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">예정된 미션이 없습니다.</p>}
        </div>
      </aside>

      {/* PC 전용 우측 사이드바: MARKET */}
      <aside className="hidden xl:flex flex-col fixed right-8 top-1/2 -translate-y-1/2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-xl z-40 transition-colors">
        <h3 className="font-black text-xs text-blue-600 dark:text-blue-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 tracking-widest uppercase">
          {isCasual ? "🏪 Market News" : "Market Updates"}
        </h3>
        <div className="flex flex-col gap-3">
          {recentMarkets.length > 0 ? recentMarkets.map(item => (
            <Link key={item._id} to="/market" className="group flex flex-col bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300">{item.title}</span>
              <span className={`text-[10px] font-black mt-1 ${item.price === 0 ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>{item.price === 0 ? (isCasual ? "🎁 무료 나눔" : "무료 나눔") : `${Number(item.price).toLocaleString()}원`}</span>
            </Link>
          )) : <p className="text-xs text-gray-400 font-bold text-center py-4">최근 등록 물품이 없습니다.</p>}
        </div>
      </aside>

      <div className="flex-grow flex flex-col justify-center max-w-4xl mx-auto w-full">
        {/* 헤더 섹션 */}
        <div id="tour-main-header" className="text-center mb-8 md:mb-12 relative">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 tracking-tighter transition-colors">
              CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
              {isCasual ? "💡 도움말" : "Guide"}
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base transition-colors tracking-tight" onClick={() => setShowVersionInfo(true)}>
             {isCasual ? "학우들을 위한 올인원 캠퍼스 솔루션 ✨ (Ver 5.0)" : "창원대학교 종합 학사 지원 시스템 (Version 5.0)"}
          </p>
        </div>

        {/* 모바일 알림 바 */}
        <div className="xl:hidden w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl mb-8 flex flex-col gap-2 shadow-sm">
          <div className="font-black text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase">{isCasual ? "🔔 최신 업데이트" : "System Updates"}</div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {recentTodos.map(todo => (
              <Link key={`mob-t-${todo._id}`} to="/todo" className="flex-shrink-0 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-2 max-w-[200px]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{todo.title}</span>
              </Link>
            ))}
            {recentMarkets.map(item => (
              <Link key={`mob-m-${item._id}`} to="/market" className="flex-shrink-0 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm flex items-center gap-2 max-w-[200px]">
                <span className={`w-1.5 h-1.5 rounded-full ${item.price === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 서비스 카드 그리드 */}
        <div id="tour-main-services" className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mb-10 md:mb-16">
          {services.map((s, idx) => (
            <Link key={idx} to={s.path} className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1.5 border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${s.color}`}></div>
              <div>
                <div className={`text-3xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {isCasual ? s.icon : <span className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.color} tracking-tighter`}>{s.short}</span>}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mb-6 leading-relaxed break-keep">{s.desc}</p>
              </div>
              <div className={`inline-block w-max px-5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-black text-[10px] md:text-xs shadow-sm border border-gray-100 dark:border-gray-600 group-hover:bg-gradient-to-r group-hover:${s.color} group-hover:text-white group-hover:border-transparent transition-all`}>
                {isCasual ? "입장하기 →" : "Enter System"}
              </div>
            </Link>
          ))}
        </div>

        {/* 퀵 링크 섹션 */}
        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-700 transition-colors">
          <div id="tour-main-notices" className="mb-10 md:mb-12">
            <h4 className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 border-l-4 border-gray-300 dark:border-gray-600 pl-3">
              Official Announcements
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" target="_blank" rel="noreferrer" className="flex-1 bg-white dark:bg-gray-800 text-[#002f6c] dark:text-blue-400 font-black text-sm md:text-base px-6 py-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">창원대학교 공지사항</a>
              <a href="https://www.changwon.ac.kr/portal/main.do#" target="_blank" rel="noreferrer" className="flex-1 bg-[#002f6c] dark:bg-blue-800 text-white font-black text-sm md:text-base px-6 py-4 rounded-xl shadow-sm border border-blue-900 dark:border-blue-700 text-center">와글 포털 접속</a>
            </div>
          </div>

          <div id="tour-main-shortcuts">
            <h4 className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 border-l-4 border-gray-300 dark:border-gray-600 pl-3">Campus Shortcuts</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{isCasual ? link.icon : <span className="font-black text-gray-300 dark:text-gray-600">{link.initial}</span>}</span>
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 text-center">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 relative z-10 transition-colors w-full">
        <p className="text-gray-500 dark:text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1.5 break-keep">
          Department of Computer Science <span className="text-gray-300 dark:text-gray-600 font-bold mx-2 hidden md:inline">|</span> 
          <br className="md:hidden"/> Software Engineering Project
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mt-2">© 2026 Jung Yi Ryang. System Version 5.0</p>
      </footer>
    </div>
  );
}

export default MainPage;