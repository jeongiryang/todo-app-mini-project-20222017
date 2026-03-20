import { useState, useEffect } from 'react'
import axios from 'axios'

function TodoPage() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState(''); const [importance, setImportance] = useState('M')
  
  const API_URL = '/api/todo'; const COMMON_URL = '/api/items'

  useEffect(() => { fetchTodos() }, [])
  const fetchTodos = async () => { const res = await axios.get(API_URL); setTodos(Array.isArray(res.data) ? res.data : []) }

  const addTodo = async (e) => {
    e.preventDefault(); if (!title) return
    const res = await axios.post(API_URL, { title, importance })
    setTodos([...todos, res.data]); setTitle('')
  }
  const deleteTodo = async (id) => { await axios.delete(`${COMMON_URL}/${id}`); setTodos(todos.filter(t => t._id !== id)) }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-10 text-center"><h2 className="text-3xl font-black text-gray-800">📝 Study Planner</h2></div>
      <form onSubmit={addTodo} className="bg-white p-4 flex gap-3 mb-8">
        <select value={importance} onChange={(e)=>setImportance(e.target.value)}><option value="H">긴급</option><option value="M">보통</option><option value="L">낮음</option></select>
        <input placeholder="할 일" value={title} onChange={(e)=>setTitle(e.target.value)} className="border p-2"/>
        <button className="bg-gray-800 text-white px-6 py-2">추가</button>
      </form>
      <div className="space-y-4">
        {todos.map(todo => (
          <div key={todo._id} className="bg-white p-5 flex justify-between">
            <span>{todo.title}</span><button onClick={() => deleteTodo(todo._id)}>X</button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default TodoPage;