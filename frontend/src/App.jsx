// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceForm from './components/InvoiceForm';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<InvoiceForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;