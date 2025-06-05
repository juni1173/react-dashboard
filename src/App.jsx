import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "@fontsource/roboto/400.css";
import "./App.css";
import "./bootstrap-grid.min.css";
// import Footer from './components/Footer';
import Register from "./components/Register";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Dashboard from "./components/Dashboard";
import Reservation from "./components/Reservation/index";
import ProductDetail from "./components/ProductDetail";
function App() {
  return (
    <div>
      <BrowserRouter basename="/portal-app">
        <Routes>
          <Route index element={<Login />} />
          <Route path="/en/login" element={<Login />} />
          <Route path="/en/register" element={<Register />} />
          <Route path="/en/logout" element={<Logout />} />
          <Route path="/en/dashboard" element={<Dashboard />} />
          <Route path="/en/reservations" element={<Reservation />} />
          <Route path="/en/product/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
