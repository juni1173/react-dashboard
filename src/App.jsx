import {BrowserRouter, Routes, Route, } from 'react-router-dom';
import '@fontsource/roboto/400.css';
import './App.css';
import './bootstrap-grid.min.css';
// import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Dashboard from './components/Dashboard';
import Reservation from './components/Reservation/index';
import ProductDetail from "./components/ProductDetail";

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservation />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </BrowserRouter>
      {/* <Footer /> */}
    </div>
  );
}

export default App;