import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahKelas from "./TambahKelas";

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
    ChevronDown,
    Building2,
    Check,
} from "lucide-react";

import "./Dashboard.css";
import "./DataKelas.css";

export default function DataKelas() {
    const navigate = useNavigate();

    const [kelasList, setKelasList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tingkatFilter, setTingkatFilter] = useState("");
    const [openTingkatDropdown, setOpenTingkatDropdown] = useState(false);
    const [showTambah, setShowTambah] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const tingkatDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tingkatDropdownRef.current && !tingkatDropdownRef.current.contains(event.target)) {
                setOpenTingkatDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchKelas = async (
        searchVal = search,
        tingkatVal = tingkatFilter
    ) => {
        setLoading(true);
        try {
            const params = {};
            if (searchVal) params.search = searchVal;
            if (tingkatVal) params.tingkat = tingkatVal;

            const res = await api.get("/kelas", { params });
            setKelasList(res.data);
        } catch (err) {
            console.error("Gagal mengambil data kelas:", err);
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
        fetchKelas();
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchKelas(val, tingkatFilter);
    };

    const handleSelectTingkat = (val) => {
        setTingkatFilter(val);
        setOpenTingkatDropdown(false);
        fetchKelas(search, val);
    };

    const tingkatOptions = [
        { label: "Semua Tingkat", value: "" },
        { label: "Tingkat 10", value: "10" },
        { label: "Tingkat 11", value: "11" },
        { label: "Tingkat 12", value: "12" },
    ];

    const selectedTingkatLabel = tingkatOptions.find((t) => t.value === tingkatFilter)?.label || "Semua Tingkat";

    const handleDelete = async (id, nama) => {
        const sure = window.confirm(
            `Yakin ingin menghapus kelas "${nama}"?`
        );
        if (!sure) return;

        try {
            await api.delete(`/kelas/${id}`);
            alert("Kelas berhasil dihapus");
            fetchKelas(search, tingkatFilter);
        } catch (err) {
            console.error("Gagal menghapus:", err);
            alert(err.response?.data?.message || "Gagal menghapus kelas");
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

    // Statistik — pakai class stat-card / stat-icon dari Dashboard.css
    const totalKelas = kelasList.length;
    const kelas10 = kelasList.filter((k) => String(k.tingkat) === "10").length;
    const kelas11 = kelasList.filter((k) => String(k.tingkat) === "11").length;
    const kelas12 = kelasList.filter((k) => String(k.tingkat) === "12").length;

    return (
        <div className="dashboard">

            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR — persis sama dengan semua page lain */}
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
                    <a className="menu-item" onClick={() => navigate("/guru")}>
                        <GraduationCap size={20} /> Data Guru
                    </a>
                    <a className="menu-item active" onClick={() => navigate("/kelas")}>
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

            {/* MAIN */}
            <main className="main-content">
                <AdminTopbar
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
                    onLogout={handleLogout}
                    searchPlaceholder="Cari nama kelas / rombel..."
                />

                {/* CONTENT — pakai class "content" dari Dashboard.css */}
                <section className="content">

                    {/* PAGE HEADER */}
                    <div className="dk-page-header">
                        <h1>Manajemen Kelas</h1>
                        <p>Kelola rombongan belajar (rombel) berdasarkan tingkat dan tahun ajaran aktif</p>
                    </div>

                    {/* STAT CARDS — pakai stats-grid & stat-card dari Dashboard.css */}
                    <div className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p>Total Kelas</p>
                                <h2>{loading ? "—" : totalKelas}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <School size={24} />
                            </div>
                            <div>
                                <p>Kelas 10</p>
                                <h2>{loading ? "—" : kelas10}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <School size={24} />
                            </div>
                            <div>
                                <p>Kelas 11</p>
                                <h2>{loading ? "—" : kelas11}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <School size={24} />
                            </div>
                            <div>
                                <p>Kelas 12</p>
                                <h2>{loading ? "—" : kelas12}</h2>
                            </div>
                        </div>

                    </div>

                    {/* FILTER BAR */}
                    <div className="dk-filter-bar">
                        <div className="dk-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama kelas / rombel..."
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* CUSTOM MODERN DROPDOWN TINGKAT */}
                        <div className="dk-dropdown-wrapper" ref={tingkatDropdownRef}>
                            <button
                                type="button"
                                className={`dk-dropdown-trigger ${openTingkatDropdown ? "dk-dropdown-trigger--open" : ""}`}
                                onClick={() => setOpenTingkatDropdown(!openTingkatDropdown)}
                            >
                                <School size={16} className="dk-dropdown-icon" />
                                <span className="dk-dropdown-label">{selectedTingkatLabel}</span>
                                <ChevronDown
                                    size={15}
                                    className={`dk-dropdown-chevron ${openTingkatDropdown ? "dk-dropdown-chevron--rotate" : ""}`}
                                />
                            </button>

                            {openTingkatDropdown && (
                                <div className="dk-dropdown-menu">
                                    {tingkatOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`dk-dropdown-item ${tingkatFilter === opt.value ? "dk-dropdown-item--selected" : ""}`}
                                            onClick={() => handleSelectTingkat(opt.value)}
                                        >
                                            <span>{opt.label}</span>
                                            {tingkatFilter === opt.value && (
                                                <Check size={14} className="dk-dropdown-check" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="dk-add-btn" onClick={() => setShowTambah(true)}>
                            <Plus size={19} /> Tambah Kelas
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="dk-table-card">
                        <table className="dk-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Kelas</th>
                                    <th>Tingkat</th>
                                    <th>Tahun Ajaran</th>
                                    <th>Jumlah Siswa</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="dk-td-loading">
                                            Memuat data kelas...
                                        </td>
                                    </tr>
                                ) : kelasList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="dk-empty-state">
                                                <div className="dk-empty-icon">
                                                    <School size={26} />
                                                </div>
                                                <h3>Tidak Ada Data Kelas</h3>
                                                <p>Belum ada rombel yang terdaftar untuk filter ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    kelasList.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="dk-td-no">{index + 1}</td>

                                            <td>
                                                <div className="dk-name-cell">
                                                    <div className="dk-avatar">
                                                        <School size={17} />
                                                    </div>
                                                    <span className="dk-name-title">
                                                        {item.nama_kelas}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`dk-badge dk-badge--${item.tingkat}`}>
                                                    Kelas {item.tingkat}
                                                </span>
                                            </td>

                                            <td>
                                                {item.tahun_ajaran
                                                    ? `${item.tahun_ajaran.nama} · ${item.tahun_ajaran.semester}`
                                                    : "—"}
                                            </td>

                                            <td>
                                                <div className="dk-siswa-cell">
                                                    <Users size={15} color="#2563eb" />
                                                    {item.siswa_kelas_count ?? 0} Siswa
                                                </div>
                                            </td>

                                            <td>
                                                <div className="dk-action">
                                                    <button
                                                        className="dk-btn-delete"
                                                        onClick={() => handleDelete(item.id, item.nama_kelas)}
                                                    >
                                                        <Trash2 size={15} />
                                                        Hapus
                                                    </button>
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
                <TambahKelas
                    onClose={() => setShowTambah(false)}
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchKelas(search, tingkatFilter);
                    }}
                />
            )}

        </div>
    );
}
