import { Link } from 'react-router-dom';

function MainPage() {
  const services = [
    { title: "중고 마켓", desc: "학우들과 즐겁게 물건을 나누세요.", icon: "🏪", path: "/market", color: "from-blue-600 to-indigo-700" },
    { title: "ToDo List", desc: "집중 타이머와 함께 일정을 관리하세요.", icon: "📝", path: "/todo", color: "from-indigo-600 to-purple-700" },
    { title: "학점 계산기", desc: "실시간 그래프로 성적을 분석하세요.", icon: "🎓", path: "/gpa", color: "from-emerald-600 to-teal-700" },
  ];

  return (
    /* 모바일: p-5 / PC: p-10 */
    <div className="max-w-7xl mx-auto p-5 md:p-10 min-h-screen flex flex-col transition-colors">
      
      {/* 중앙 메인 콘텐츠 영역 */}
      <div className="flex-grow flex flex-col justify-center">
        {/* 헤더 섹션 */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-[#002f6c] dark:text-blue-400 mb-4 tracking-tighter transition-colors">
            CWNU <span className="text-blue-600 dark:text-blue-500">SMART</span> PORTAL
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-base md:text-lg transition-colors">
            창원대학교 학우들을 위한 올인원 캠퍼스 솔루션
          </p>
        </div>

        {/* 서비스 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {services.map((s, idx) => (
            <Link 
              key={idx} 
              to={s.path} 
              className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 md:hover:-translate-y-4 border-2 border-gray-50 dark:border-gray-700"
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${s.color}`}></div>
              <div className="text-5xl md:text-7xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2 md:mb-3 transition-colors">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base mb-6 md:mb-8 leading-relaxed transition-colors">{s.desc}</p>
              <div className={`inline-block px-5 md:px-6 py-2 rounded-full bg-gradient-to-r ${s.color} text-white font-black text-xs md:text-sm shadow-md`}>
                서비스 바로가기 →
              </div>
            </Link>
          ))}
        </div>

        {/* 공지사항 섹션 */}
        <div className="mt-12 md:mt-20 bg-blue-50/50 dark:bg-blue-900/20 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-2 border-blue-100/50 dark:border-blue-800/50 text-center flex flex-col items-center transition-colors">
          <h4 className="text-lg md:text-xl font-black text-blue-800 dark:text-blue-300 mb-3 md:mb-4 transition-colors">공지사항</h4>
          <a 
            href="https://www.changwon.ac.kr/portal/na/ntt/selectNttList.do?mi=13532&bbsId=2932" 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 dark:text-blue-400 font-bold text-base md:text-lg hover:text-blue-800 dark:hover:text-blue-200 hover:underline transition-colors flex items-center gap-1 md:gap-2 break-keep"
          >
            "창원대학교 공식 공지사항 확인하기" <span className="text-xs md:text-sm">↗</span>
          </a>
        </div>
      </div>

      {/* 1. 포탈 메인화면 하단 워터마크 푸터 (요청사항 반영) */}
      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10">
        <p className="text-gray-500 dark:text-gray-400 font-black text-xs md:text-base uppercase tracking-widest mb-1 md:mb-2">
          Software Engineering Project: CWNU Portal System
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] md:text-sm font-bold tracking-wider">
          @ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works
        </p>
      </footer>
    </div>
  );
}

export default MainPage;