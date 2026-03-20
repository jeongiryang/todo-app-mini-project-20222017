import { useState, useEffect } from 'react'
import axios from 'axios'

function MarketPage() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState(''); const [deadline, setDeadline] = useState('')
  const [viewType, setViewType] = useState('card'); const [isLoading, setIsLoading] = useState(true)

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => { try { const res = await axios.get(API_URL); setItems(Array.isArray(res.data) ? res.data : []) } finally { setIsLoading(false) } }

  const addItem = async (e) => {
    e.preventDefault(); if (!title || !deadline) return
    const res = await axios.post(API_URL, { title, deadline })
    setItems([...items, res.data]); setTitle(''); setDeadline('')
  }
  const toggleStatus = async (id, completed) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { completed: !completed })
    setItems(items.map(item => item._id === id ? res.data : item))
  }
  const deleteItem = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setItems(items.filter(item => item._id !== id)) }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10"><h2 className="text-4xl font-extrabold text-[#002f6c]">🏪 CWNU 중고마켓</h2></div>
      <form onSubmit={addItem} className="bg-white p-6 rounded-2xl shadow-md mb-8 flex gap-4 justify-center">
        <input placeholder="물품명" value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2 rounded-md"/>
        <input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} className="border p-2 rounded-md"/>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md">등록</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item._id} className="p-6 rounded-3xl shadow-sm border-2 bg-white">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p>마감: {item.deadline}</p>
            <button onClick={() => deleteItem(item._id)} className="text-red-400">삭제</button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default MarketPage;