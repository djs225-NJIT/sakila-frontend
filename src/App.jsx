import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Customers from "./pages/Customers.jsx";
import Films from "./pages/Films.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/films" element={<Films />} />
    </Routes>
  );
}