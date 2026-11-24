import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahTahunAjaran from "./TambahTahunAjaran";

import {
    Search,
    Plus,
    LayoutDashboard,
    Users,
    School,
    GraduationCap,
    CalendarCheck,
    CalendarDays,
    BookOpen,
    LogOut,
    Trash2,
    CheckCircle,
} from "lucide-react";

import "./Dashboard.css";
import "./TahunAjaran.css";

export default function TahunAjaranPage() {
    const navigate = useNavigate();

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showTambah, setShowTambah] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchTahunAjaran = async () => {
        setLoading(true);
        try {
            const res = await api.get("/tahun-ajaran");
            setList(res.data);
        } catch (err) {
            console.error("Gagal mengambil tahun ajaran:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || token === "undefined" || token === "null") {
            navigate("/");
            return;
        }
        fetchTahunAjaran();
    }, []);

    const handleSetAktif = async (id) => {
        try {
            await api.patch(`/tahun-ajaran/${id}/aktif`);
            alert("Tahun ajaran aktif berhasil diperbarui");
            fetchTahunAjaran();
        } catch (err) {
            console.error("Gagal mengubah status aktif:", err);
            alert(err.response?.data?.message || "Gagal mengubah status");
        }
    };

    const handleDelete = async (id) => {
        const sure = window.confirm("Yakin ingin menghapus tahun ajaran ini?");
        if (!sure) return;

        try {
            await api.delete(`/tahun-ajaran/${id}`);
            alert("Tahun ajaran berhasil dihapus");
            fetchTahunAjaran();
        } catch (err) {
            console.error("Gagal menghapus:", err);
            alert(err.response?.data?.message || "Gagal menghapus");
        }
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.error("Logout gagal:", err);
        }
        localStorage.removeItem("token");
        navigate("/");
    };

    const filteredList = list.filter((item) =>
        item.nama?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard">
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <div className="brand">
                    <div className="brand-icon">
                        <GraduationCap size={27} />
                    </div>
                    <div>
                        <h2>SI-ABSEN</h2>
                        <span>Sistem Absensi Sekolah</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <a className="menu-item" onClick={() => navigate("/dashboard")}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>
                    <a className="menu-item" onClick={() => navigate("/siswa")}>
                        <Users size={20} />
                        Data Siswa
                    </a>
                    <a className="menu-item" onClick={() => navigate("/guru")}>
                        <GraduationCap size={20} />
                        Data Guru
                    </a>
                    <a className="menu-item" onClick={() => navigate("/kelas")}>
                        <School size={20} />
                        Data Kelas
                    </a>
                    <a className="menu-item" onClick={() => navigate("/jadwal")}>
                        <CalendarCheck size={20} />
                        Jadwal
                    </a>
                    <a className="menu-item active" onClick={() => navigate("/tahun-ajaran")}>
                        <CalendarDays size={20} />
                        Tahun Ajaran
                    </a>
                    <a className="menu-item" onClick={() => navigate("/mapel")}>
                        <BookOpen size={20} />
                        Mata Pelajaran
                    </a>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={19} />
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <AdminTopbar
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
                    onLogout={handleLogout}
                    searchPlaceholder="Cari periode tahun..."
                />

                <section className="ta-content">
                    <div className="ta-page-header">
                        <h1>Manajemen Tahun Ajaran</h1>
                        <p>Kelola data periode dan pilih tahun ajaran yang sedang aktif</p>
                    </div>

                    <div className="ta-filter-bar">
                        <div className="ta-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari periode tahun..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button className="ta-add-btn" onClick={() => setShowTambah(true)}>
                            <Plus size={19} />
                            Tambah Tahun Ajaran
                        </button>
                    </div>

                    <div className="ta-table-card">
                        <table className="ta-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Periode / Nama</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="ta-td-loading">
                                            Memuat data tahun ajaran...
                                        </td>
                                    </tr>
                                ) : filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="ta-td-loading">
                                            Tidak ada data ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="ta-td-no">{index + 1}</td>
                                            <td style={{ fontWeight: 600, color: "#172b4d" }}>
                                                {item.nama}
                                            </td>
                                            <td>
                                                <span className="ta-badge ta-badge--semester">
                                                    {item.semester}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`ta-badge ${
                                                        item.status === "aktif"
                                                            ? "ta-badge--aktif"
                                                            : "ta-badge--nonaktif"
                                                    }`}
                                                >
                                                    {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ta-action">
                                                    {item.status !== "aktif" && (
                                                        <button
                                                            className="ta-btn-aktifkan"
                                                            onClick={() => handleSetAktif(item.id)}
                                                        >
                                                            <CheckCircle size={15} />
                                                            Aktifkan
                                                        </button>
                                                    )}
                                                    {item.status !== "aktif" && (
                                                        <button
                                                            className="ta-btn-delete"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 size={15} />
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {showTambah && (
                <TambahTahunAjaran
                    onClose={() => setShowTambah(false)}
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchTahunAjaran();
                    }}
                />
            )}
        </div>
    );
}

