// src/pages/MarketPage.jsx 전체 복사
import { useState, useEffect } from 'react'
import axios from 'axios'

function MarketPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
  const [viewType, setViewType] = useState('card')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  // 🚀 2. 정렬, 페이지네이션, 찜하기 상태
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6;
  const [likedItems, setLikedItems] = useState(() => new Set(JSON.parse(localStorage.getItem('likedItems') || '[]')))

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(res.data) } catch(e){} }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    else if (value.length > 7) formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setForm({ ...form, phone: formatted });
  }

  const addItem = async (e) => {
    e.preventDefault(); if (!form.title) return;
    
    // 🚀 11. 마감기한 경고창
    if (form.deadline) {
      const today = new Date(); today.setHours(0,0,0,0);
      if (new Date(form.deadline) < today) {
        if (!window.confirm("⚠️ 마감 기한이 오늘보다 이전입니다. 이대로 물품을 등록하시겠습니까?")) return;
      }
    }

    const res = await axios.post(API_URL, form)
    setItems([...items, res.data]); setForm({ title: '', price: '', deadline: '', studentId: '', sellerName: '', phone: '', location: '', description: '' })
    setCurrentPage(1); // 등록 시 첫 페이지로
  }

  // 🚀 1. 찜하기 토글
  const handleLike = async (id) => {
    const isLiked = likedItems.has(id);
    const val = isLiked ? -1 : 1;
    const res = await axios.patch(`${COMMON_URL}/${id}/like`, { value: val });
    setItems(items.map(item => item._id === id ? res.data : item));
    
    const newLiked = new Set(likedItems);
    if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLikedItems(newLiked);
    localStorage.setItem('likedItems', JSON.stringify([...newLiked]));
  }

  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, editForm)
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }

  // 🚀 2. 정렬 로직 적용
  const sortedItems = [...items].sort((a, b) => {
    if (sortType === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortType === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999'); // 마감 임박순
    if (sortType === 'priceLow') return a.price - b.price;
    if (sortType === 'priceHigh') return b.price - a.price;
    if (sortType === 'likes') return b.likes - a.likes;
    return 0;
  });

  // 🚀 8. 페이지네이션 계산
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    // 🚀 7. 공간 전체 차지 (max-w-7xl)
    <div className="max-w-7xl mx-auto p-6 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black text-[#002f6c] mb-2 tracking-tighter italic">CWNU MARKET <span className="text-red-500">v5_super.ver</span></h2>
          <p className="text-blue-500 font-black uppercase tracking-widest text-sm">Campus Life, Better Trade!</p>
        </div>

        <form onSubmit={addItem} className="bg-white p-8 rounded-[2rem] shadow-xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-blue-50">
          <input placeholder="물품명" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="가격" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="학번" value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="판매자" value={form.sellerName} onChange={e=>setForm({...form, sellerName: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="전화번호" value={form.phone} onChange={handlePhoneChange} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500"/>
          <input placeholder="거래 희망처" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 md:col-span-3"/>
          {/* 🚀 3. 판매설명 애니메이션 및 커서 크기 확장 */}
          <textarea placeholder="판매에 대한 상세한 설명을 적어주세요. (클릭 시 입력창이 확장됩니다)" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} 
            className="border p-3 rounded-xl md:col-span-3 outline-none focus:ring-2 ring-blue-500 h-14 focus:h-40 transition-all duration-300 resize-none leading-relaxed"></textarea>
          <button className="md:col-span-3 bg-[#002f6c] text-white p-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all shadow-lg mt-2">물품 등록하기</button>
        </form>

        <div className="flex justify-between items-center mb-6">
          {/* 🚀 2. 정렬 기능 */}
          <select value={sortType} onChange={(e) => {setSortType(e.target.value); setCurrentPage(1);}} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-xl font-bold text-gray-700 outline-none cursor-pointer">
            <option value="latest">🔄 최신 등록순</option>
            <option value="deadline">⏳ 마감 임박순</option>
            <option value="priceLow">📉 가격 낮은순</option>
            <option value="priceHigh">📈 가격 높은순</option>
            <option value="likes">❤️ 찜 많은순</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${viewType==='card'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>🎴 CARD VIEW</button>
            <button onClick={() => setViewType('table')} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${viewType==='table'?'bg-[#002f6c] text-white':'bg-white text-gray-400 border'}`}>📋 TABLE VIEW</button>
          </div>
        </div>

        {viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 w-full">
            {currentItems.map(item => (
              <div key={item._id} className={`p-7 rounded-[3rem] border-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${item.completed ? 'border-red-500 bg-red-50' : 'border-blue-50 bg-white'}`}>
                {editingId === item._id ? (
                  <div className="flex flex-col gap-2">
                    <input className="border p-2 rounded-lg text-xs" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    <input className="border p-2 rounded-lg text-xs" type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: e.target.value})} />
                    <input className="border p-2 rounded-lg text-xs" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} />
                    <textarea className="border p-2 rounded-lg text-xs h-20 resize-none" value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} />
                    <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded-lg py-2 font-bold text-xs">수정 완료</button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-2xl font-black ${item.completed ? 'text-red-600 line-through' : 'text-gray-800'}`}>{item.title}</h3>
                      <button onClick={() => handleLike(item._id)} className={`flex flex-col items-center hover:scale-110 transition ${likedItems.has(item._id) ? 'text-red-500' : 'text-gray-300'}`}>
                        <span className="text-2xl drop-shadow-md">♥</span>
                        <span className="text-[10px] font-black">{item.likes}</span>
                      </button>
                    </div>
                    <p className={`text-3xl font-black mb-4 ${item.completed ? 'text-red-400' : 'text-blue-700'}`}>{Number(item.price).toLocaleString()}원</p>
                    <div className="text-xs text-gray-500 font-bold mb-4 space-y-1.5 flex-grow">
                      <p>👤 {item.sellerName} <span className="text-gray-400">({item.studentId})</span></p>
                      <p>📞 {item.phone}</p>
                      <p>📅 마감: <span className={new Date(item.deadline) < new Date() ? 'text-red-500' : ''}>{item.deadline || '없음'}</span></p>
                      <p className="text-blue-500">📍 희망처: {item.location}</p>
                      <p className="bg-gray-50 p-3 rounded-xl mt-3 text-gray-600 font-medium leading-relaxed italic border">"{item.description}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className={`flex-grow py-3 rounded-2xl font-black text-xs ${item.completed?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition'}`}>
                        {item.completed ? "DONE" : "COMPLETE"}
                      </button>
                      <button onClick={() => {setEditingId(item._id); setEditForm(item)}} className="p-3 bg-gray-50 border rounded-2xl text-gray-400 hover:text-blue-500 text-xs font-bold">EDIT</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="p-3 bg-gray-50 border rounded-2xl text-gray-400 hover:text-red-500 text-xs font-bold">DEL</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          // 🚀 6. 테이블 뷰 복구 및 확장
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-2 border-gray-100 mb-10 w-full">
            <table className="w-full text-center">
              <thead className="bg-[#002f6c] text-white text-sm font-bold">
                <tr><th className="p-4">물품명</th><th className="p-4">가격</th><th className="p-4">판매자</th><th className="p-4">마감/상태</th><th className="p-4">관리</th></tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item._id} className={`border-b hover:bg-blue-50 transition-colors ${item.completed ? 'text-red-500 bg-red-50' : ''}`}>
                    <td className={`p-4 font-black text-lg ${item.completed ? 'line-through' : 'text-gray-800'}`}>{item.title} <span className="text-red-400 text-xs">♥{item.likes}</span></td>
                    <td className="p-4 font-black text-blue-600">{Number(item.price).toLocaleString()}원</td>
                    <td className="p-4 font-bold text-gray-500 text-sm">{item.sellerName} <br/><span className="text-[10px] text-gray-400">{item.phone}</span></td>
                    <td className="p-4">
                      <div className="text-xs font-bold mb-1">{item.deadline}</div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${item.completed ? 'bg-red-500' : 'bg-blue-600'}`}>{item.completed ? "거래완료" : "판매중"}</span>
                    </td>
                    <td className="p-4 flex flex-col justify-center items-center gap-2">
                      <button onClick={async() => {await axios.put(`${COMMON_URL}/${item._id}`,{completed: !item.completed}); fetchItems()}} className="text-xs font-black uppercase text-blue-500 underline">{item.completed ? "undo" : "done"}</button>
                      <button onClick={async() => {await axios.delete(`${COMMON_URL}/${item._id}`); fetchItems()}} className="text-gray-400 hover:text-red-500 font-black text-xs uppercase">delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🚀 8. 페이지네이션 (넘기기) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="font-black text-blue-600 text-lg">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-xl font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* 🚀 10. 워터마크 크기 증대 */}
      <footer className="py-12 text-center border-t border-gray-200 mt-10">
        <p className="text-gray-500 font-black text-base tracking-[0.2em] mb-2 uppercase">Software Engineering Project: CWNU Market System</p>
        <p className="text-gray-400 text-sm font-bold tracking-widest">@ 2026 Jung Yi Ryang | Designed with Gemini AI Collaborative Works</p>
      </footer>
    </div>
  )
}
export default MarketPage;