import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahGuru from "./TambahGuru";

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
    Calendar,
    Briefcase,
} from "lucide-react";

import "./Dashboard.css";
import "./DataGuru.css";

export default function DataGuru() {
    const navigate = useNavigate();

    const [guruList, setGuruList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showTambah, setShowTambah] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchGuru = async (searchVal = search) => {
        setLoading(true);
        try {
            const params = {};
            if (searchVal) params.search = searchVal;

            const res = await api.get("/guru", { params });
            setGuruList(res.data);
        } catch (err) {
            console.error("Gagal mengambil data guru:", err);
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
        fetchGuru();
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchGuru(val);
    };

    const handleDelete = async (id, nama) => {
        const sure = window.confirm(
            `Yakin ingin menghapus guru "${nama}" beserta akun loginnya?`
        );
        if (!sure) return;

        try {
            await api.delete(`/guru/${id}`);
            alert("Guru berhasil dihapus");
            fetchGuru(search);
        } catch (err) {
            console.error("Gagal menghapus guru:", err);
            alert(err.response?.data?.message || "Gagal menghapus data guru");
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

    // Statistik Guru
    const totalGuru = guruList.length;
    const guruAktifJadwal = guruList.filter((g) => (g.jadwal_count || 0) > 0).length;
    const guruBelumJadwal = totalGuru - guruAktifJadwal;

    return (
        <div className="dashboard">
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
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
                        <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a className="menu-item" onClick={() => navigate("/siswa")}>
                        <Users size={20} /> Data Siswa
                    </a>
                    <a className="menu-item active" onClick={() => navigate("/guru")}>
                        <GraduationCap size={20} /> Data Guru
                    </a>
                    <a className="menu-item" onClick={() => navigate("/kelas")}>
                        <School size={20} /> Data Kelas
                    </a>
                    <a className="menu-item" onClick={() => navigate("/jadwal")}>
                        <CalendarCheck size={20} /> Jadwal
                    </a>
                    <a className="menu-item" onClick={() => navigate("/tahun-ajaran")}>
                        <CalendarDays size={20} /> Tahun Ajaran
                    </a>
                    <a className="menu-item" onClick={() => navigate("/mapel")}>
                        <BookOpen size={20} /> Mata Pelajaran
                    </a>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={19} /> Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                <AdminTopbar
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
                    onLogout={handleLogout}
                    searchPlaceholder="Cari nama atau NIP guru..."
                />

                <section className="content">
                    <div className="dg-page-header">
                        <h1>Manajemen Guru</h1>
                        <p>Kelola data pendidik, NIP, akun autentikasi, serta status jadwal mengajar</p>
                    </div>

                    {/* STATS CARDS */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <p>Total Guru</p>
                                <h2>{loading ? "—" : totalGuru}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p>Aktif Mengajar</p>
                                <h2>{loading ? "—" : guruAktifJadwal}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <p>Belum Ada Jadwal</p>
                                <h2>{loading ? "—" : guruBelumJadwal}</h2>
                            </div>
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="dg-filter-bar">
                        <div className="dg-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama atau NIP guru..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <button className="dg-add-btn" onClick={() => setShowTambah(true)}>
                            <Plus size={19} /> Tambah Guru
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="dg-table-card">
                        <table className="dg-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Guru</th>
                                    <th>NIP</th>
                                    <th>Email Akun</th>
                                    <th>Jadwal Mengajar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="dg-td-loading">
                                            Memuat data guru...
                                        </td>
                                    </tr>
                                ) : guruList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="dg-empty-state">
                                                <div className="dg-empty-icon">
                                                    <GraduationCap size={26} />
                                                </div>
                                                <h3>Tidak Ada Data Guru</h3>
                                                <p>Belum ada data guru yang terdaftar atau cocok dengan pencarian.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    guruList.map((item, index) => {
                                        const count = item.jadwal_count || 0;
                                        return (
                                            <tr key={item.id}>
                                                <td className="dg-td-no">{index + 1}</td>
                                                <td>
                                                    <div className="dg-name-cell">
                                                        <div className="dg-avatar">
                                                            {item.nama?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div className="dg-name-info">
                                                            <span className="dg-name-title">{item.nama}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="dg-badge-nip">{item.nip}</span>
                                                </td>
                                                <td>
                                                    <span style={{ color: "#405273" }}>
                                                        {item.user?.email || "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`dg-badge-jadwal ${
                                                            count > 0
                                                                ? "dg-badge-jadwal--active"
                                                                : "dg-badge-jadwal--inactive"
                                                        }`}
                                                    >
                                                        {count > 0 ? `${count} Pertemuan / Minggu` : "Belum Dijadwalkan"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dg-action">
                                                        <button
                                                            className="dg-btn-delete"
                                                            onClick={() => handleDelete(item.id, item.nama)}
                                                        >
                                                            <Trash2 size={15} />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {showTambah && (
                <TambahGuru
                    onClose={() => setShowTambah(false)}
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchGuru(search);
                    }}
                />
            )}
        </div>
    );
}

