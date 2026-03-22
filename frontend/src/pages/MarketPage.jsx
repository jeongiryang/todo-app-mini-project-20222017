import { useState, useEffect } from 'react'
import axios from 'axios'

const i18n = {
  ko: {
    casual: {
      sub_title: "학우들과 즐겁게 물건을 나누세요! ✨",
      search_ph: "🔍 찾으시는 중고 물품을 검색해보세요!",
      free_btn: "무료나눔", free_active: "🎁 무료 나눔 설정됨", price_ph: "판매 가격(원)",
      submit_list: ["내 물건 마켓에 올리기 🏪", "신상 등록하고 용돈 벌기 💸", "치킨값 벌러 물건 올리기 🍗", "가치 있는 나눔의 시작 🎁"],
      sort_options: ["🔄 최신 등록순", "⏳ 마감 임박순", "📉 낮은 가격순", "📈 높은 가격순", "❤️ 관심도 높은순"],
      card_labels: ["👤 판매자", "📞 연락처", "📅 마감", "📍 장소"],
      btn_close: "거래 완료", btn_open: "판매 재개", no_data: "등록된 물품이 없습니다.",
      h_v1: "물품 등록 및 기본적인 목록 조회 시스템 구축 🏪",
      h_v2: "사용자 도움말 투어 및 거래 편의 기능 추가 💡",
      h_v3: "실시간 찜하기 및 카드/테이블 뷰 전환 도입 ❤️",
      h_v4: "MongoDB 연동 데이터 보존 및 검색 기능 강화 🚀",
      h_v5: "UI 감성 선택 & 검색 엔진 고도화! ✨",
      ver_desc: "25년 2학기 웹프로그래밍 기말과제 `todos_v4`의 최종 진화형! 🔥"
    },
    formal: {
      sub_title: "창원대학교 자원 선순환 직거래 시스템",
      search_ph: "시스템 내 거래 물품을 검색하십시오. (제목 또는 상세 내용)",
      free_btn: "Free Share", free_active: "[ 무료 나눔 설정됨 ]", price_ph: "판매 가격",
      submit_list: ["신규 거래 물품 등록", "마켓 아이템 업로드", "거래 데이터 시스템 전송", "물품 정보 등록 완료"],
      sort_options: ["최신 등록순", "마감 임박순", "낮은 가격순", "높은 가격순", "관심도 높은순"],
      card_labels: ["Seller", "Contact", "Deadline", "Location"],
      btn_close: "CLOSED", btn_open: "REOPEN", no_data: "데이터가 존재하지 않습니다.",
      h_v1: "물품 등록 및 기초 목록 조회 시스템 구축",
      h_v2: "사용자 도움말 투어 및 거래 편의 기능 도입",
      h_v3: "실시간 관심도 시스템 및 다중 뷰 모드 전환",
      h_v4: "DB 연동 데이터 무결성 확보 및 통합 검색 강화",
      h_v5: "UI 페르소나 시스템 및 통합 검색 엔진 탑재",
      ver_desc: "Official release of CWNU Marketplace System V5.0"
    }
  },
  en: {
    casual: {
      sub_title: "Share items with your fellow students! ✨",
      search_ph: "🔍 Search for amazing items!",
      free_btn: "Free", free_active: "🎁 Set as Free Share", price_ph: "Price (KRW)",
      submit_list: ["Post my item 🏪", "Earn some pocket money 💸", "List for chicken money 🍗", "Start sharing value 🎁"],
      sort_options: ["🔄 Latest", "⏳ Closing Soon", "📉 Low Price", "📈 High Price", "❤️ Most Liked"],
      card_labels: ["👤 Seller", "📞 Contact", "📅 Ends", "📍 Place"],
      btn_close: "Sold Out", btn_open: "Relist", no_data: "No items listed yet.",
      h_v1: "Initial Item Registration System 🏪",
      h_v2: "User Guide & Convenience Features 💡",
      h_v3: "Wishlist & View Mode Switching ❤️",
      h_v4: "MongoDB Integration & Advanced Search 🚀",
      h_v5: "UI Persona Switch & Engine Upgrades! ✨",
      ver_desc: "Final evolution of Web Programming project `todos_v4`! 🔥"
    },
    formal: {
      sub_title: "CWNU Resource Redistribution System",
      search_ph: "Search registered trade items. (Title or Description)",
      free_btn: "Free Share", free_active: "[ Free Share Active ]", price_ph: "Price",
      submit_list: ["Register New Item", "Upload Market Data", "Transmit Trade Data", "Complete Registration"],
      sort_options: ["Latest", "By Deadline", "Lowest Price", "Highest Price", "By Popularity"],
      card_labels: ["Seller", "Contact", "Deadline", "Location"],
      btn_close: "CLOSED", btn_open: "REOPEN", no_data: "No data available.",
      h_v1: "Initial Marketplace implementation",
      h_v2: "User Guide Tour & UI Improvements",
      h_v3: "Wishlist & Multi-view layout system",
      h_v4: "Database integration & Global Search",
      h_v5: "UI Persona Switch & Search Engine",
      ver_desc: "CWNU Portal Marketplace V5.0 Official Release"
    }
  }
};

const MARKET_QUOTES = (lang, isCasual) => lang === 'ko' ? 
  (isCasual ? ["안 쓰는 물건, 누군가에겐 보물입니다. ✨", "빠른 쿨거래가 매너를 만듭니다.🤝"] : ["자원의 선순환을 실천하십시오.", "신뢰를 바탕으로 한 투명한 거래 문화."]) :
  (isCasual ? ["Your old stuff, someone's treasure! ✨", "Good manners make good trades. 🤝"] : ["Practice resource circulation.", "Transparent trading based on trust."]);

function MarketPage({ uiMode, lang }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortType, setSortType] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')));
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitIdx, setSubmitIdx] = useState(0);

  const text = i18n[lang][uiMode];
  const isCasual = uiMode === 'casual';
  const API_URL = '/api/market'; const COMMON_URL = '/api/items';

  useEffect(() => { fetchItems(); }, []);
  useEffect(() => { const itv = setInterval(() => setSubmitIdx(p => (p + 1) % text.submit_list.length), 6000); return () => clearInterval(itv); }, [text.submit_list.length]);

  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }
  
  const handleFreebie = () => {
    if (form.price === 'free') setForm({...form, price: ''});
    else {
      setForm({...form, price: 'free'});
      if (isCasual) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000); }
    }
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    const res = await axios.post(API_URL, { ...form, price: form.price === 'free' ? 0 : form.price });
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' });
    setCurrentPage(1);
  }

  const sortedItems = items.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()) || (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
      if (sortType === 'priceLow') return a.price - b.price;
      if (sortType === 'priceHigh') return b.price - a.price;
      if (sortType === 'likes') return b.likes - a.likes;
      return 0;
    });

  const currentItems = sortedItems.slice((currentPage - 1) * 6, currentPage * 6);
  const totalPages = Math.ceil(sortedItems.length / 6) || 1;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col min-h-screen relative text-gray-900 dark:text-gray-100 transition-colors">
      <style>{`@keyframes shoot-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-150px) scale(1.5); opacity: 0; } } .emoji-burst { position: absolute; animation: shoot-up 1.5s ease-out forwards; z-index: 9999; pointer-events: none; }`}</style>
      {showConfetti && <div className="fixed inset-0 z-[9999] flex items-center justify-center"><span className="emoji-burst text-6xl">🎉</span></div>}

      {/* 히스토리 모달 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm" onClick={() => setShowVersionInfo(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] max-w-3xl w-full shadow-2xl border-4 border-blue-50 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">MARKET V5.0 Update News</h3>
            <p className="text-center text-gray-400 font-bold mb-8 text-xs">{text.ver_desc}</p>
            <div className="bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border">
              <h4 className="text-center font-black text-slate-700 dark:text-slate-300 mb-5 text-sm">System History</h4>
              <div className="space-y-3 text-xs">
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-blue-600 font-black min-w-[50px]">V5 1.0:</span><span>{text.h_v1}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-blue-600 font-black min-w-[50px]">V5 2.0:</span><span>{text.h_v2}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-blue-600 font-black min-w-[50px]">V5 3.5:</span><span>{text.h_v3}</span></p>
                <p className="flex items-center gap-3 font-medium bg-white dark:bg-gray-800 p-2.5 rounded-xl"><span className="text-blue-600 font-black min-w-[50px]">V5 4.0:</span><span>{text.h_v4}</span></p>
                <p className="flex items-center gap-3 font-bold bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-blue-200"><span className="text-blue-600 font-black min-w-[50px]">V5 5.0:</span><span className="italic">{text.h_v5}</span></p>
              </div>
            </div>
            <button onClick={() => setShowVersionInfo(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition">Confirm</button>
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="text-center mb-10 relative">
          <h2 className="text-4xl md:text-5xl font-black text-[#002f6c] dark:text-blue-300 tracking-tighter cursor-pointer" onClick={() => setShowVersionInfo(true)}>
            MARKET <span className="text-red-600 italic">V5 5.0</span>
          </h2>
          <p className="text-gray-500 font-bold text-sm md:text-base mt-2">{text.sub_title}</p>
        </div>

        {/* 물품 등록 폼 */}
        <form onSubmit={addItem} className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-[2.5rem] shadow-sm border mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <input placeholder={lang==='ko'?'물품명':'Item Title'} value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-4 rounded-2xl outline-none focus:border-blue-500 dark:bg-gray-700 font-bold"/>
          <div className="flex gap-2">
            <input placeholder={form.price==='free' ? text.free_active : text.price_ph} value={form.price==='free'?'':form.price} onChange={e=>setForm({...form, price: e.target.value})} disabled={form.price==='free'} className="border p-4 rounded-2xl outline-none focus:border-blue-500 flex-grow dark:bg-gray-700 font-bold"/>
            <button type="button" onClick={handleFreebie} className={`px-4 rounded-2xl text-white font-black text-xs transition ${form.price==='free'?'bg-red-500':'bg-emerald-600'}`}>{form.price==='free'?'Cancel':text.free_btn}</button>
          </div>
          <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border p-4 rounded-2xl outline-none focus:border-blue-500 dark:bg-gray-700 font-bold text-gray-400"/>
          <input placeholder={lang==='ko'?'판매자 성명':'Seller Name'} value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border p-4 rounded-2xl outline-none focus:border-blue-500 dark:bg-gray-700 font-bold"/>
          <input placeholder={lang==='ko'?'연락처':'Contact'} value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="border p-4 rounded-2xl outline-none focus:border-blue-500 dark:bg-gray-700 font-bold"/>
          <input placeholder={lang==='ko'?'희망 장소':'Location'} value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="border p-4 rounded-2xl outline-none focus:border-blue-500 dark:bg-gray-700 font-bold"/>
          <textarea placeholder={lang==='ko'?'상세 설명':'Description'} value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="md:col-span-3 border p-4 rounded-2xl h-20 focus:h-32 transition-all outline-none dark:bg-gray-700 font-medium"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-900 transition shadow-md h-16">
            {text.submit_list[submitIdx]}
          </button>
        </form>

        {/* 검색 및 필터 */}
        <div className="mb-6"><input type="text" placeholder={text.search_ph} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full p-4 border-2 border-blue-100 rounded-2xl shadow-sm focus:border-blue-500 outline-none dark:bg-gray-800 font-bold"/></div>
        <div className="flex justify-between items-center mb-8">
          <select value={sortType} onChange={e=>setSortType(e.target.value)} className="p-2.5 border rounded-xl font-black text-xs outline-none dark:bg-gray-800">
            <option value="latest">{text.sort_options[0]}</option>
            <option value="deadline">{text.sort_options[1]}</option>
            <option value="priceLow">{text.sort_options[2]}</option>
            <option value="priceHigh">{text.sort_options[3]}</option>
            <option value="likes">{text.sort_options[4]}</option>
          </select>
        </div>

        {/* 물품 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {currentItems.map(item => (
            <div key={item._id} className={`p-8 rounded-[2.5rem] border transition-all hover:-translate-y-1 shadow-sm relative overflow-hidden ${item.completed ? 'opacity-60 bg-gray-50' : 'bg-white dark:bg-gray-800'}`}>
              {item.completed && <div className="absolute -right-10 top-10 bg-gray-800 text-white font-black text-[10px] py-1 px-12 rotate-45">{isCasual ? "SOLD OUT" : "CLOSED"}</div>}
              <h3 className="text-xl font-black mb-4 truncate">{item.title}</h3>
              <div className="flex justify-between items-center mb-6 pb-5 border-b">
                <p className="text-2xl font-black text-[#002f6c] dark:text-blue-400">{item.price === 0 ? (isCasual ? "🎁 무료 나눔!" : "FREE") : `${Number(item.price).toLocaleString()}₩`}</p>
                <button onClick={async()=>{const isL = likedItems.has(item._id); const v = isL?-1:1; const res=await axios.patch(`${COMMON_URL}/${item._id}/like`,{value:v}); setItems(items.map(it=>it._id===item._id?res.data:it)); const nl=new Set(likedItems); if(isL) nl.delete(item._id); else nl.add(item._id); setLikedItems(nl); localStorage.setItem('likedItems', JSON.stringify([...nl]))}} className={`px-3 py-1 rounded-lg border text-[10px] font-black ${likedItems.has(item._id)?'bg-red-50 text-red-600 border-red-200':'text-gray-400'}`}>{isCasual ? "❤️" : "Wish"} {item.likes}</button>
              </div>
              <div className="space-y-2 text-xs font-bold text-gray-500 mb-8">
                <p className="flex justify-between"><span>{text.card_labels[0]}</span><span className="text-gray-900 dark:text-gray-200">{item.sellerName}</span></p>
                <p className="flex justify-between"><span>{text.card_labels[1]}</span><span className="text-gray-900 dark:text-gray-200">{item.phone}</span></p>
                <p className="flex justify-between"><span>{text.card_labels[2]}</span><span className="text-gray-900 dark:text-gray-200">{item.deadline || 'N/A'}</span></p>
                <p className="flex justify-between"><span>{text.card_labels[3]}</span><span className="text-[#002f6c] dark:text-blue-400">{item.location}</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={async()=>{await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="flex-grow py-3 rounded-xl font-black text-[10px] uppercase border hover:bg-gray-50 transition">{item.completed ? text.btn_open : text.btn_close}</button>
                <button onClick={async()=>{if(window.confirm('Delete?')){await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}}} className="px-4 py-3 rounded-xl font-black text-[10px] text-red-500 border border-red-100 hover:bg-red-50 transition">DEL</button>
              </div>
            </div>
          ))}
          {currentItems.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold">{text.no_data}</div>}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-20">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-xl font-black text-xs border ${currentPage === num ? 'bg-[#002f6c] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>{num}</button>
            ))}
          </div>
        )}
      </div>

      <footer className="py-10 text-center border-t mt-16 w-full">
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1.5">Department of Computer Science | Software Engineering Project</p>
        <p className="text-gray-400 font-bold text-[10px]">© 2026 Jung Yi Ryang. System Version 5.0</p>
      </footer>
    </div>
  )
}
export default MarketPage;