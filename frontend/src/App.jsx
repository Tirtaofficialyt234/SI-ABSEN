import { useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import api from "./api/axios";
import AuthUserContext from "./auth/AuthUserContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import DataSiswa from "./pages/DataSiswa";
import DataGuru from "./pages/DataGuru";
import DataKelas from "./pages/DataKelas";
import DataJadwal from "./pages/DataJadwal";
import TahunAjaranPage from "./pages/TahunAjaran";
import DataMapel from "./pages/DataMapel";
import AbsenPage from "./pages/Absen-page";

function NonAdminAttendanceRoute() {
  const [state, setState] = useState({ status: "loading", user: null });

  useEffect(() => {
    let isCancelled = false;
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null") {
      setState({ status: "unauthenticated", user: null });
      return () => {
        isCancelled = true;
      };
    }

    api.get("/user")
      .then(({ data }) => {
        if (isCancelled) return;

        if (data.role === "admin") {
          setState({ status: "admin", user: data });
        } else if (data.role === "guru" || data.role === "siswa") {
          setState({ status: "authorized", user: data });
        } else {
          setState({ status: "unauthorized", user: null });
        }
      })
      .catch((error) => {
        if (isCancelled) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setState({ status: "unauthenticated", user: null });
          return;
        }

        setState({ status: "error", user: null });
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <p role="status">Memeriksa akses...</p>;
  }

  if (state.status === "unauthenticated" || state.status === "unauthorized") {
    return <Navigate to="/" replace />;
  }

  if (state.status === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (state.status === "error") {
    return <p role="alert">Gagal memverifikasi akun. Silakan coba lagi.</p>;
  }

  return (
    <AuthUserContext.Provider value={state.user}>
      <AbsenPage />
    </AuthUserContext.Provider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/siswa" element={<DataSiswa />} />
      <Route path="/guru" element={<DataGuru />} />
      <Route path="/kelas" element={<DataKelas />} />
      <Route path="/jadwal" element={<DataJadwal />} />
      <Route path="/tahun-ajaran" element={<TahunAjaranPage />} />
      <Route path="/mapel" element={<DataMapel />} />
      <Route path="/absen-page" element={<NonAdminAttendanceRoute />} />
    </Routes>
  );
}

export default App;