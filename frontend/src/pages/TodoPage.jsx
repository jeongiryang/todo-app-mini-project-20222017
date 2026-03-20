import { useState, useEffect } from 'react'
import axios from 'axios'

function TodoPage() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('보통')
  const [timeLeft, setTimeLeft] = useState(1500); const [isActive, setIsActive] = useState(false)
  
  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    else clearInterval(interval)
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  useEffect(() => { fetchTodos() }, [])
  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(res.data) }

  const addTodo = async (e) => {
    e.preventDefault(); if (!title) return
    const res = await axios.post(API_URL, { title, importance })
    setTodos([...todos, res.data]); setTitle('')
  }
  const deleteTodo = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setTodos(todos.filter(t => t._id !== id)) }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 text-white p-6 rounded-3xl mb-10 text-center">
        <h3 className="text-sm">기본 집중 타이머</h3>
        <div className="text-5xl font-mono mb-4">{formatTime(timeLeft)}</div>
        <button onClick={() => setIsActive(!isActive)} className="bg-white text-black px-6 py-2 rounded-full">{isActive ? "정지" : "시작"}</button>
      </div>

      <div className="mb-10 text-center"><h2 className="text-3xl font-black text-gray-800">✅ 해야 할 일</h2></div>
      
      <form onSubmit={addTodo} className="bg-white p-4 flex gap-3 mb-8 border">
        <select value={importance} onChange={(e)=>setImportance(e.target.value)}><option>긴급</option><option>보통</option><option>낮음</option></select>
        <input placeholder="할 일" value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2 flex-grow"/>
        <button className="bg-gray-800 text-white px-6 py-2">추가</button>
      </form>
      
      <div className="space-y-4">
        {todos.map(todo => (
          <div key={todo._id} className="bg-white p-5 flex justify-between border">
            <span>[{todo.importance}] {todo.title}</span><button onClick={() => deleteTodo(todo._id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default TodoPage;