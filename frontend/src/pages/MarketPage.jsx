import { useState, useEffect } from 'react'
import axios from 'axios'

function MarketPage() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState(''); const [price, setPrice] = useState(''); const [deadline, setDeadline] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState(''); const [editPrice, setEditPrice] = useState('')

  const API_URL = '/api/market'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => { const res = await axios.get(API_URL); setItems(res.data) }

  const addItem = async (e) => {
    e.preventDefault(); if (!title) return
    const res = await axios.post(API_URL, { title, price, deadline })
    setItems([...items, res.data]); setTitle(''); setPrice(''); setDeadline('')
  }

  const saveEdit = async (id) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { title: editTitle, price: editPrice })
    setItems(items.map(item => item._id === id ? res.data : item)); setEditingId(null)
  }
  const toggleStatus = async (id, completed) => {
    const res = await axios.put(`${COMMON_URL}/${id}`, { completed: !completed })
    setItems(items.map(item => item._id === id ? res.data : item))
  }
  const deleteItem = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setItems(items.filter(item => item._id !== id)) }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10"><h2 className="text-4xl font-extrabold text-[#002f6c]">CWNU 마켓 v2</h2></div>
      <form onSubmit={addItem} className="bg-white p-6 rounded-2xl shadow-md mb-8 flex gap-4">
        <input placeholder="물품명" value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2"/>
        <input type="number" placeholder="가격" value={price} onChange={(e)=>setPrice(e.target.value)} className="border p-2"/>
        <input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} className="border p-2"/>
        <button className="bg-blue-600 text-white px-6 py-2">등록</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item._id} className="p-6 rounded-3xl shadow-sm border-2 bg-white">
            {editingId === item._id ? (
              <div className="flex flex-col gap-2">
                <input className="border p-1" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                <input className="border p-1" type="number" value={editPrice} onChange={(e)=>setEditPrice(e.target.value)} />
                <button onClick={()=>saveEdit(item._id)} className="bg-green-500 text-white rounded py-1">저장</button>
              </div>
            ) : (
              <>
                <h3 className={`text-xl font-bold ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title}</h3>
                <p className="text-blue-600 font-bold">{Number(item.price).toLocaleString()}원</p>
                <p>마감: {item.deadline}</p>
              </>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => toggleStatus(item._id, item.completed)} className="bg-gray-200 px-2 rounded">상태변경</button>
              <button onClick={() => {setEditingId(item._id); setEditTitle(item.title); setEditPrice(item.price)}} className="text-blue-400">수정</button>
              <button onClick={() => deleteItem(item._id)} className="text-red-400">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default MarketPage;