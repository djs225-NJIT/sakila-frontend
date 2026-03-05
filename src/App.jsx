import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import Films from "./pages/Films.jsx";   // <-- add this

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetails />} />
      <Route path="/films" element={<Films />} />   {/* <-- add this */}
    </Routes>
  );
}