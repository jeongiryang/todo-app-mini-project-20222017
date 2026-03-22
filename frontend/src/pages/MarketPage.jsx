import { useState, useEffect } from 'react'
import axios from 'axios'

const MARKET_QUOTES = (isCasual) => isCasual ? [
  "안 쓰는 물건, 누군가에겐 보물입니다. ✨", "빠른 쿨거래가 창대인의 매너를 만듭니다.🤝", "네고는 둥글게, 거래는 확실하게! 😊", "오늘 비운 공간, 내일의 여유가 됩니다.", "혹시 당근... 아니 CWNU 마켓이세요? 🥕", "책상 속 잠든 전공책, 후배에겐 빛과 소금! 📚"
] : [
  "자원의 선순환을 실천하는 캠퍼스 직거래 시스템입니다.", "신뢰를 바탕으로 한 투명한 거래 문화를 조성합시다.", "불필요한 물품에 새로운 가치를 부여하십시오.", "학우 간의 상호 존중이 안전한 거래의 기본입니다.", "전공 서적 및 학업 교구의 효율적인 재분배를 지원합니다.", "건전한 대학 커뮤니티 문화를 함께 만들어 갑시다."
];

const SUBMIT_MENTIONS = (isCasual) => isCasual ? [
  "내 물건 마켓에 올리기 🏪", "신상 등록하고 용돈 벌기 💸", "치킨값 벌러 물건 올리기 🍗", "가치 있는 나눔의 시작 🎁"
] : [
  "신규 거래 물품 등록", "마켓 아이템 업로드", "거래 데이터 시스템 전송", "물품 정보 등록 완료"
];

const TOUR_STEPS = (isCasual) => [
  { title: isCasual ? "👋 환영합니다!" : "Market System Info", desc: isCasual ? "CWNU 마켓의 핵심 기능을 안내해 드릴게요." : "캠퍼스 내 물품 거래 및 자원 공유 기능을 안내합니다.", targetId: "tour-header" }, 
  { title: isCasual ? "🎁 무료 나눔 & 가격" : "Price & Sharing", desc: isCasual ? "가격을 정하거나 '무료 나눔' 버튼을 누를 수 있습니다." : "판매 가격 설정 또는 무료 나눔 지정을 지원합니다.", targetId: "tour-freebie" }, 
  { title: isCasual ? "📅 캘린더 마감일" : "Deadline Setting", desc: isCasual ? "클릭하여 쉽게 마감 기한을 정할 수 있어요." : "거래 유효 마감 기한을 캘린더에서 지정하십시오.", targetId: "tour-deadline" }, 
  { title: isCasual ? "🔄 똑똑한 정렬" : "Smart Sorting", desc: isCasual ? "최신순, 마감임박순 등으로 원하는 물품을 골라보세요." : "최신순, 가격순 등 다양한 정렬 필터를 제공합니다.", targetId: "tour-sort" }, 
  { title: isCasual ? "❤️ 실시간 찜하기" : "Wishlist System", desc: isCasual ? "마음에 드는 물건 카드의 하트를 눌러보세요!" : "관심 물품을 저장하여 별도로 관리할 수 있습니다.", targetId: "tour-card" }
];

function MarketPage({ uiMode }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [viewType, setViewType] = useState('card')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6;
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')))
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [submitMentionIndex, setSubmitMentionIndex] = useState(0);
  const [tourIndex, setTourIndex] = useState(-1) 
  const [showConfetti, setShowConfetti] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const isCasual = uiMode === 'casual';
  const quotes = MARKET_QUOTES(isCasual);
  const submitMentions = SUBMIT_MENTIONS(isCasual);
  const steps = TOUR_STEPS(isCasual);

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems(); }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }
  useEffect(() => { const intervalId = setInterval(() => setSubmitMentionIndex(prev => (prev + 1) % submitMentions.length), 6000); return () => clearInterval(intervalId); }, [submitMentions.length]);
  
  useEffect(() => {
    if (tourIndex >= 0 && tourIndex < steps.length) {
      const el = document.getElementById(steps[tourIndex].targetId);
      if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.classList.add('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); 
        return () => { el.classList.remove('ring-[6px]', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-900', 'z-[80]', 'transition-all', 'rounded-3xl'); }; 
      }
    }
  }, [tourIndex, steps]);

  const handlePhoneChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, '');
    let formatted = numeric;
    if (numeric.length > 3 && numeric.length <= 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3)}`;
    else if (numeric.length > 7) formatted = `${numeric.slice(0, 3)}-${numeric.slice(3, 7)}-${numeric.slice(7, 11)}`;
    return formatted;
  }

  const handleFreebie = () => { 
    if (form.price === 'free') {
      setForm({...form, price: ''}); 
    } else {
      setForm({...form, price: 'free'}); 
      if (isCasual) {
        setShowConfetti(true); 
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    const submitData = { ...form, price: form.price === 'free' ? 0 : form.price };
    const res = await axios.post(API_URL, submitData);
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
    setCurrentPage(1);
  }

  const handleLike = async (id) => {
    const isLiked = likedItems.has(id); const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    const newLiked = new Set(likedItems); if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked); localStorage.setItem('likedItems', JSON.stringify([...newLiked]));
  }
  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { ...editForm, price: editForm.price === 'free' ? 0 : editForm.price })
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }
  
  const filteredItems = items.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
    if (sortType === 'priceLow') return a.price - b.price;
    if (sortType === 'priceHigh') return b.price - a.price;
    if (sortType === 'likes') return b.likes - a.likes;
    return 0;
  });
  
  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`
        .tour-popup { animation: slide-up 0.4s forwards; }
        @keyframes slide-up { 0% { transform: translate(-50%, 50px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1); opacity: 0; } }
        .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }
      `}</style>
      
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}

      {tourIndex >= 0 && (
        <div className="fixed z-[100] bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl shadow-2xl border-[3px] border-blue-400 dark:border-blue-500 w-[92%] max-w-[350px] bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 tour-popup flex flex-col pointer-events-auto">
          <h3 className="text-blue-600 dark:text-blue-400 font-black mb-1 text-[10px] uppercase tracking-widest">Guide ({tourIndex + 1}/{steps.length})</h3>
          <h2 className="text-lg md:text-xl font-black mb-2 md:mb-3 dark:text-white">{steps[tourIndex].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-bold mb-4 md:mb-5">{steps[tourIndex].desc}</p>
          <div className="flex justify-between gap-2">
            <button onClick={() => setTourIndex(-1)} className="px-3 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs hover:text-gray-600 dark:hover:text-gray-300">{isCasual ? "건너뛰기" : "Skip"}</button>
            <button onClick={() => setTourIndex(p => p+1 >= steps.length ? -1 : p+1)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 md:px-5 py-2 rounded-xl font-black text-xs shadow-md hover:bg-blue-700 transition">{tourIndex === steps.length - 1 ? (isCasual ? "투어 종료 🎉" : "End") : (isCasual ? "다음 보기 ▶" : "Next")}</button>
          </div>
        </div>
      )}

      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl md:rounded-[2rem] max-w-3xl w-full shadow-2xl transform transition-all border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-2xl md:text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center">MARKET V5 5.0 Update News</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                <h4 className="text-gray-500 dark:text-gray-300 font-black text-sm mb-3 text-center">{isCasual ? "🤔 이전 버전" : "[ 이전 버전 ]"}</h4>
                <ul className="text-xs font-medium text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4">
                  <li>{isCasual ? "새로고침하면 데이터 소실... 😭" : "데이터 영구 보존 기술 미적용"}</li>
                  <li>{isCasual ? "찜하기 등 거래 부가 기능 전무" : "관심도 시스템 및 다중 뷰 모드 미비"}</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                <h4 className="text-blue-600 dark:text-blue-400 font-black text-sm mb-3 text-center">{isCasual ? "✨ 현재 버전 (V5 5.0)" : "[ V5 5.0 개선 사항 ]"}</h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-200 space-y-2 list-disc pl-4">
                  <li>{isCasual ? "내 맘대로 고르는 UI 감성 모드! 🎨" : "UI 페르소나(Casual/Formal) 스위칭 탑재"}</li>
                  <li>{isCasual ? "MongoDB 연동으로 데이터 무결성 보장 🚀" : "데이터베이스 연동 기반 무결성 확보"}</li>
                  <li>{isCasual ? "계보 완벽 복원 및 검색 기능 강화 ✨" : "통합 검색 기능 및 히스토리 현행화 완료"}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-600">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-4 text-sm">🛠️ CWNU MARKET System History</h4>
              <div className="space-y-3 text-[11px] md:text-xs px-2">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 1.0:</span><span>{isCasual ? "물품 등록 및 기본적인 목록 조회 시스템 구축 🏪" : "물품 등록 및 기초 목록 조회 시스템 구축"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 2.0:</span><span>{isCasual ? "사용자 도움말 투어 및 거래 편의 기능 추가 💡" : "사용자 도움말 투어 및 거래 편의 기능 도입"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 3.5:</span><span>{isCasual ? "실시간 찜하기 및 카드/테이블 뷰 전환 도입 ❤️" : "실시간 관심도 시스템 및 다중 뷰 모드 전환"}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><span className="text-blue-600 font-black min-w-[50px]">V5 4.0:</span><span>{isCasual ? "MongoDB 연동 데이터 보존 및 검색 기능 강화 🚀" : "DB 연동 데이터 무결성 확보 및 통합 검색 강화"}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-blue-200"><span className="text-blue-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{isCasual ? "UI 감성 선택 & 검색 엔진 고도화! ✨" : "UI 페르소나 시스템 및 통합 검색 엔진 탑재"}</span></p>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-black transition">확인 완료</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div id="tour-header" className="text-center mb-8 md:mb-10 relative mt-4 md:mt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter flex justify-center items-center cursor-pointer mt-4 md:mt-0">
              MARKET <span onClick={() => setShowVersionInfo(true)} className="inline-block ml-2 md:ml-4 px-2 text-red-600 dark:text-red-400 italic text-2xl md:text-4xl">V5 5.0</span>
            </h2>
            <button onClick={() => setTourIndex(0)} className="hidden md:flex bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 mt-4 md:mt-0">
              {isCasual ? "💡 도움말" : "Guide"}
            </button>
          </div>
          <p onClick={() => setShowVersionInfo(true)} className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-black cursor-pointer tracking-widest uppercase">Market Information</p>
        </div>

        <form onSubmit={addItem} className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700 mb-6 md:mb-10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 relative z-10">
          <input placeholder={isCasual ? "물품명 기입" : "물품명 입력"} value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition"/>
          <div id="tour-freebie" className="flex gap-2">
            <input 
              placeholder={form.price === 'free' ? (isCasual ? "🎁 무료 나눔 설정됨" : "[ 무료 나눔 설정됨 ]") : (isCasual ? "판매 가격(원)" : "판매 가격")} 
              type={form.price === 'free' ? "text" : "number"} 
              min="0" 
              value={form.price === 'free' ? '' : form.price} 
              onChange={e=>setForm({...form, price: e.target.value})} 
              className={`border p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition flex-grow ${form.price === 'free' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-black placeholder-emerald-700 shadow-inner' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white'}`} 
              disabled={form.price === 'free'}
            />
            <button type="button" onClick={handleFreebie} className={`${form.price === 'free' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-black text-xs px-4 rounded-2xl transition shadow-sm`}>{form.price === 'free' ? (isCasual ? "취소" : "Cancel") : (isCasual ? "무료나눔" : "Free Share")}</button>
          </div>
          <input id="tour-deadline" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 cursor-pointer text-gray-500 dark:text-gray-400"/>
          <input placeholder={isCasual ? "판매자 학번" : "Seller ID"} value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition"/>
          <input placeholder={isCasual ? "판매자 성명" : "Seller Name"} value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition"/>
          <input placeholder={isCasual ? "연락처" : "Contact"} value={form.phone} onChange={e=>setForm({...form, phone: handlePhoneChange(e.target.value)})} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition"/>
          <input placeholder={isCasual ? "거래 희망 장소" : "Preferred Location"} value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="md:col-span-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none focus:border-blue-500 transition"/>
          <textarea placeholder={isCasual ? "물품 상세 설명 기입" : "Description"} value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="md:col-span-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 md:p-4 text-sm md:text-base rounded-2xl h-14 focus:h-32 transition-all outline-none"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] dark:bg-blue-800 text-white p-4 md:p-5 rounded-2xl font-black text-base md:text-lg hover:bg-blue-900 transition shadow-sm h-16 flex justify-center items-center">
            {submitMentions[submitMentionIndex]}
          </button>
        </form>

        <div className="mb-4 md:mb-6 w-full relative z-10">
          <input type="text" placeholder={isCasual ? "🔍 찾으시는 중고 물품을 검색해보세요!" : "시스템 내 거래 물품을 검색하십시오. (제목 또는 상세 내용)"} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 md:p-4 border border-blue-200 dark:border-gray-600 rounded-xl md:rounded-2xl shadow-sm focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all font-bold text-sm md:text-base"/>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 relative z-10">
          <select value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 w-full sm:w-auto rounded-xl font-black text-xs text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm">
            <option value="latest">{isCasual ? "🔄 최신 등록순" : "최신 등록순"}</option>
            <option value="deadline">{isCasual ? "⏳ 마감 임박순" : "마감 임박순"}</option>
            <option value="priceLow">{isCasual ? "📉 낮은 가격순" : "낮은 가격순"}</option>
            <option value="priceHigh">{isCasual ? "📈 높은 가격순" : "높은 가격순"}</option>
            <option value="likes">{isCasual ? "❤️ 관심도 높은순" : "관심도 높은순"}</option>
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setViewType('card')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all border ${viewType==='card'?'bg-[#002f6c] text-white border-[#002f6c]':'bg-white dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-600'}`}>CARD VIEW</button>
            <button onClick={() => setViewType('table')} className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-black text-xs transition-all border ${viewType==='table'?'bg-[#002f6c] text-white border-[#002f6c]':'bg-white dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-600'}`}>TABLE VIEW</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div id="tour-card" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 w-full relative z-10">
            {currentItems.map(item => ( 
              <div key={item._id} className={`p-6 md:p-8 rounded-3xl md:rounded-[3rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col relative overflow-hidden ${item.completed ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700' : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm'}`}> 
                {item.completed && <div className="absolute -right-10 top-10 bg-gray-800 text-white font-black text-xs py-1 px-12 rotate-45 shadow-md z-10 tracking-widest">{isCasual ? "SOLD OUT" : "CLOSED"}</div>}
                {editingId === item._id ? (
                  <div className="flex flex-col gap-2 z-10">
                    <input className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold" type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                    <div className="flex gap-2 mt-1">
                      <button onClick={()=>saveEdit(item._id)} className="bg-[#002f6c] dark:bg-blue-800 text-white rounded-xl py-2 flex-grow font-black text-xs">Save</button>
                      <button onClick={()=>setEditingId(null)} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl py-2 flex-grow font-black text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4 z-10"><h3 className={`text-xl font-black flex-grow pr-10 ${item.completed ? 'text-gray-500 line-through opacity-70' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h3></div> 
                    <div className="flex justify-between items-center mb-6 z-10 relative border-b border-gray-100 dark:border-gray-700 pb-5">
                      <p className={`text-2xl md:text-3xl font-black ${item.completed ? 'text-gray-400 opacity-70' : 'text-[#002f6c] dark:text-blue-400'}`}>{item.price === 0 ? (isCasual ? "🎁 무료 나눔!" : "[ 무료 나눔 ]") : `${Number(item.price).toLocaleString()}원`}</p>
                      <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center px-3 py-1.5 rounded-lg border transition-colors ${likedItems.has(item._id) ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400'}`}><span className="text-[10px] font-black uppercase">{isCasual ? "❤️" : "Wish"} {item.likes}</span></button>
                    </div> 
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-6 space-y-2.5 flex-grow z-10">
                      <p className="flex justify-between"><span className="text-gray-400">{isCasual ? "👤 판매자" : "Seller"}:</span> <span>{item.sellerName} ({item.studentId})</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">{isCasual ? "📞 연락처" : "Contact"}:</span> <span>{item.phone}</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">{isCasual ? "📅 마감" : "Deadline"}:</span> <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>{item.deadline || (isCasual ? '없음' : 'N/A')}</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">{isCasual ? "📍 장소" : "Location"}:</span> <span className="text-[#002f6c] dark:text-blue-400">{item.location}</span></p>
                    </div>
                    <div className="flex gap-2 z-10">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-2 rounded-xl font-black text-[10px] uppercase shadow-sm border ${item.completed?'bg-gray-800 text-white border-gray-800':'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 transition'}`}>{item.completed ? (isCasual ? "판매 재개" : "Reopen") : (isCasual ? "거래 완료" : "Close Deal")}</button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white text-[10px] font-black uppercase transition">Edit</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-red-400 hover:text-red-600 dark:hover:text-red-400 text-[10px] font-black uppercase transition">Del</button>
                    </div> 
                  </>
                )}
              </div> 
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-x-auto border border-gray-200 dark:border-gray-700 mb-8 relative z-10">
            <table className="w-full text-center min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs font-bold tracking-widest uppercase border-b border-gray-200 dark:border-gray-700"><tr><th className="p-4">Item</th><th className="p-4">Price</th><th className="p-4">Seller Info</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
              <tbody>
                {currentItems.map(item => ( 
                  <tr key={item._id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${item.completed ? 'opacity-60' : ''}`}>
                    <td className="p-4 font-black text-sm relative text-left pl-6">
                      <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}>{item.title}</span> 
                      <button onClick={() => handleLike(item._id)} className={`ml-3 text-[10px] font-black px-2 py-0.5 rounded border ${likedItems.has(item._id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{isCasual ? "❤️" : "Wish"} {item.likes}</button>
                    </td>
                    <td className="p-4 font-black text-sm text-[#002f6c] dark:text-blue-400">{item.price === 0 ? (isCasual ? "🎁 무료 나눔!" : "[ 무료 나눔 ]") : `${Number(item.price).toLocaleString()}원`}</td>
                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400 text-xs">{item.sellerName} <br/><span className="text-[10px] text-gray-400">{item.phone}</span></td>
                    <td className="p-4"><span className={`px-4 py-1 rounded-full text-[10px] font-black border ${item.completed ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{item.completed ? (isCasual ? "거래 완료" : "Closed") : (isCasual ? "판매 중" : "Open")}</span></td>
                    <td className="p-4 flex justify-center gap-1">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-[9px] font-black uppercase text-gray-600 hover:text-gray-900 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-lg w-16">Toggle</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-red-500 hover:text-red-700 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-1 rounded-lg font-black text-[9px] uppercase w-16">Delete</button>
                    </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-black text-xs text-gray-500 hover:text-[#002f6c] disabled:opacity-30 transition">PREV</button>
            <div className="flex gap-1">
              {pageNumbers.map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all border ${currentPage === num ? 'bg-[#002f6c] text-white border-[#002f6c] shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-blue-400'}`}>{num}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-black text-xs text-gray-500 hover:text-[#002f6c] disabled:opacity-30 transition">NEXT</button>
          </div>
        )}
      </div>

      <footer className="py-8 md:py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-16 md:mt-24 relative z-10 transition-colors w-full">
        <p className="text-gray-500 dark:text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1.5 break-keep">Department of Computer Science <span className="text-gray-300 dark:text-gray-600 font-bold mx-2 hidden md:inline">|</span> <br className="md:hidden"/> Software Engineering Project</p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mt-2">© 2026 Jung Yi Ryang. System Version 5.0</p>
      </footer>
    </div>
  )
}
export default MarketPage;