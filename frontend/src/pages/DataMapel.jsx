import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahMapel from "./TambahMapel";

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
    CheckCircle2,
    Calendar,
    Layers,
} from "lucide-react";

import "./Dashboard.css";
import "./DataMapel.css";

export default function DataMapel() {
    const navigate = useNavigate();

    const [mapelList, setMapelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showTambah, setShowTambah] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchMapel = async (searchVal = search) => {
        setLoading(true);
        try {
            const params = {};
            if (searchVal) params.search = searchVal;

            const res = await api.get("/mapel", { params });
            setMapelList(res.data);
        } catch (err) {
            console.error("Gagal mengambil data mapel:", err);
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
        fetchMapel();
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchMapel(val);
    };

    const handleDelete = async (id, nama) => {
        const sure = window.confirm(`Yakin ingin menghapus mata pelajaran "${nama}"?`);
        if (!sure) return;

        try {
            await api.delete(`/mapel/${id}`);
            alert("Mata pelajaran berhasil dihapus");
            fetchMapel(search);
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

    // Kalkulasi Statistik
    const totalMapel = mapelList.length;
    const mapelAktifDiJadwal = mapelList.filter(
        (m) => (m.jadwal_count || 0) > 0
    ).length;
    const mapelBelumDijadwalkan = totalMapel - mapelAktifDiJadwal;

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
                    <a className="menu-item" onClick={() => navigate("/tahun-ajaran")}>
                        <CalendarDays size={20} />
                        Tahun Ajaran
                    </a>
                    <a className="menu-item active" onClick={() => navigate("/mapel")}>
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
                    searchPlaceholder="Cari nama mata pelajaran..."
                />

                <section className="mapel-content">
                    <div className="mapel-page-header">
                        <h1>Manajemen Mata Pelajaran</h1>
                        <p>Kelola data kurikulum dan distribusi mata pelajaran pada jadwal pelajaran</p>
                    </div>

                    {/* STATS WIDGET CARDS */}
                    <div className="mapel-stats-grid">
                        <div className="mapel-stat-card">
                            <div className="mapel-stat-icon blue">
                                <BookOpen size={24} />
                            </div>
                            <div className="mapel-stat-info">
                                <p>Total Mata Pelajaran</p>
                                <h2>{loading ? "-" : totalMapel}</h2>
                            </div>
                        </div>

                        <div className="mapel-stat-card">
                            <div className="mapel-stat-icon green">
                                <Calendar size={24} />
                            </div>
                            <div className="mapel-stat-info">
                                <p>Aktif di Jadwal</p>
                                <h2>{loading ? "-" : mapelAktifDiJadwal}</h2>
                            </div>
                        </div>

                        <div className="mapel-stat-card">
                            <div className="mapel-stat-icon purple">
                                <Layers size={24} />
                            </div>
                            <div className="mapel-stat-info">
                                <p>Belum Ada Jadwal</p>
                                <h2>{loading ? "-" : mapelBelumDijadwalkan}</h2>
                            </div>
                        </div>
                    </div>

                    {/* FILTER & ACTIONS */}
                    <div className="mapel-filter-bar">
                        <div className="mapel-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama mata pelajaran..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <button className="mapel-add-btn" onClick={() => setShowTambah(true)}>
                            <Plus size={19} />
                            Tambah Mata Pelajaran
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="mapel-table-card">
                        <table className="mapel-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Distribusi Jadwal</th>
                                    <th>Status Pemakaian</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="mapel-td-loading">
                                            Memuat data mata pelajaran...
                                        </td>
                                    </tr>
                                ) : mapelList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="mapel-empty-state">
                                                <div className="mapel-empty-icon">
                                                    <BookOpen size={24} />
                                                </div>
                                                <h3>Tidak Ada Mata Pelajaran</h3>
                                                <p>Belum ada mata pelajaran yang ditambahkan atau cocok dengan pencarian.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    mapelList.map((item, index) => {
                                        const count = item.jadwal_count || 0;
                                        return (
                                            <tr key={item.id}>
                                                <td className="mapel-td-no">{index + 1}</td>
                                                <td>
                                                    <div className="mapel-name-cell">
                                                        <div className="mapel-avatar-icon">
                                                            <BookOpen size={18} />
                                                        </div>
                                                        <div className="mapel-name-info">
                                                            <span className="mapel-name-title">
                                                                {item.nama_mapel}
                                                            </span>
                                                            <span className="mapel-name-code">
                                                                ID Mapel: #{item.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 500, color: "#405273" }}>
                                                        {count > 0 ? `${count} Sesi Pertemuan` : "Belum dijadwalkan"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {count > 0 ? (
                                                        <span className="mapel-badge mapel-badge--active">
                                                            <CheckCircle2 size={13} />
                                                            Digunakan
                                                        </span>
                                                    ) : (
                                                        <span className="mapel-badge mapel-badge--inactive">
                                                            Tersedia
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="mapel-action">
                                                        <button
                                                            className="mapel-btn-delete"
                                                            onClick={() => handleDelete(item.id, item.nama_mapel)}
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
                <TambahMapel
                    onClose={() => setShowTambah(false)}
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchMapel(search);
                    }}
                />
            )}
        </div>
    );
}
