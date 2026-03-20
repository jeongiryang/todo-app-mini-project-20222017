import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MarketPage from './pages/MarketPage';
import TodoPage from './pages/TodoPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-[#002f6c] p-4 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="font-black text-xl tracking-tighter">CWNU PORTAL v5</h1>
            <div className="flex gap-6 font-bold">
              <Link to="/market" className="hover:text-blue-300">🏪 중고마켓</Link>
              <Link to="/todo" className="hover:text-blue-300">📝 심플 투두</Link>
            </div>
          </div>
        </nav>
        <div className="pt-6">
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/todo" element={<TodoPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;