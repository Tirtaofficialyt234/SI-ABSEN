import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import DataSiswa from "./pages/DataSiswa";
import Absensi from "./pages/Absensi";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/siswa" element={<DataSiswa />} />
      <Route path="/absensi" element={<Absensi />} />
    </Routes>
  );
}

export default App;