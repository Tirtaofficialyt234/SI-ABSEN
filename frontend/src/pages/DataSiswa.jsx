import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import TambahSiswa from "./TambahSiswa";

import {
    Search,
    Plus,
    ChevronDown,
    MoreVertical,
    LayoutDashboard,
    Users,
    GraduationCap,
    CalendarCheck,
    LogOut,
    Trash2,
    Bell,
    ChevronLeft,
    ChevronRight,
    Shield,
    Menu,
} from "lucide-react";

import "./Dashboard.css";
import "./DataSiswa.css";

export default function DataSiswa() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [meta, setMeta] = useState({
        total: 0,
        last_page: 1,
        per_page: 10,
    });

    const [showTambah, setShowTambah] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isFirstRender = useRef(true);

    const fetchStudents = async (
        searchVal = search,
        pageVal = page
    ) => {
        setLoading(true);

        try {
            const res = await api.get("/siswa", {
                params: {
                    search: searchVal,
                    page: pageVal,
                },
            });

            setStudents(res.data.data);

            setMeta({
                total: res.data.total,
                last_page: res.data.last_page,
                per_page: res.data.per_page,
                current_page: res.data.current_page,
            });
        } catch (err) {
            console.error("Gagal mengambil data siswa:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
    console.log("1. FETCH DASHBOARD DIPANGGIL");

    try {
        console.log("2. MULAI REQUEST");

        const response = await api.get("/admin/dashboard");

        console.log("3. RESPONSE DITERIMA");
        console.log("STATUS:", response.status);
        console.log("DATA:", response.data);

        setDashboard(response.data);

        console.log("4. STATE DASHBOARD DISET");
    } catch (error) {
        console.log("5. REQUEST ERROR");
        console.log("ERROR:", error);
        console.log("STATUS:", error.response?.status);
        console.log("DATA ERROR:", error.response?.data);
    }
};

    useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (
        !token ||
        token === "undefined" ||
        token === "null"
    ) {
        navigate("/");
        return;
    }

    console.log("MEMANGGIL FETCH DASHBOARD");

    fetchDashboard();

    const interval = setInterval(() => {
        console.log("5 DETIK - FETCH ULANG");
        fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
}, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            setPage(1);
            fetchStudents(search, 1);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const handlePage = (p) => {
        if (p < 1 || p > meta.last_page) {
            return;
        }

        setPage(p);
        fetchStudents(search, p);
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

    const handleDelete = async (id) => {
        const sure = window.confirm("Yakin ingin menghapus data siswa ini?");

        if (!sure) return;

        try {
            const response = await api.delete(`/siswa/${id}`);

            console.log("HASIL DELETE:", response.data);
            alert("Data berhasil dihapus");
            fetchStudents(search, page);
        } catch (error) {
            console.error("ERROR DELETE:", error);
            console.error("RESPONSE:", error.response?.data);

            alert(
                error.response?.data?.message ||
                "Gagal menghapus data siswa"
            );
        }
    }

    const startPage = Math.max(1, Math.min(page - 2, meta.last_page - 4));
    const pageNumbers = Array.from(
        { length: 5 },
        (_, i) => startPage + i
    ).filter(p => p > 0 && p <= meta.last_page);

    return (
        <div className="dashboard">

            {/* SIDEBAR OVERLAY */}
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
                        <span>
                            Sistem Absensi Sekolah
                        </span>
                    </div>

                </div>

                <nav className="sidebar-menu">

                    <a
                        className="menu-item"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>

                    <a
                        className="menu-item active"
                        onClick={() =>
                            navigate("/siswa")
                        }
                    >
                        <Users size={20} />
                        Data Siswa
                    </a>

                    <a 
                        className="menu-item"
                        onClick={() =>
                            navigate("/absensi")
                        }
                    >
                        <CalendarCheck size={20} />
                        Absensi
                    </a>

                </nav>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    Logout
                </button>

            </aside>

            <main className="main-content">

                <header className="topbar">

                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        
                        <div className="search-box">

                            <Search size={19} />

                            <input
                                type="text"
                                placeholder="Cari siswa, kelas, atau NIS..."
                            />

                        </div>
                    </div>

                    <div className="topbar-right">

                        <div className="notification">
                            <Bell size={21} />
                            <span></span>
                        </div>

                        <div className="profile">

                            <div className="profile-avatar">
                                A
                            </div>

                            <span>Admin</span>

                            <ChevronDown size={17} />

                        </div>

                    </div>

                </header>

                <section className="ds-content">

                    <div className="ds-page-header">

                        <div>
                            <h1>Data Siswa</h1>

                            <p>
                                Kelola data siswa yang
                                terdaftar di sekolah
                            </p>
                        </div>

                    </div>

                    <div className="ds-filter-bar">

                        <div className="ds-search-box">

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Cari nama atau NIS..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <button className="ds-filter-btn">

                            <Users size={17} />

                            <span>
                                Semua Kelas
                            </span>

                            <ChevronDown size={16} />

                        </button>

                        <button className="ds-filter-btn">

                            <Shield size={17} />

                            <span>
                                Semua Status
                            </span>

                            <ChevronDown size={16} />

                        </button>

                        <button
                            className="ds-add-btn"
                            onClick={() =>
                                setShowTambah(true)
                            }
                        >
                            <Plus size={19} />
                            Tambah Siswa
                        </button>

                    </div>

                    <div className="ds-table-card">

                        <table className="ds-table">

                            <thead>

                                <tr>
                                    <th>No</th>
                                    <th>NIS</th>
                                    <th>Nama Siswa</th>
                                    <th>Kelas</th>
                                    <th>Jenis Kelamin</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="ds-td-loading"
                                        >
                                            Memuat data...
                                        </td>

                                    </tr>

                                ) : students.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="ds-td-loading"
                                        >
                                            Tidak ada data siswa.
                                        </td>

                                    </tr>

                                ) : (

                                    students.map((s) => (

                                        <tr key={s.nis}>

                                            <td className="ds-td-no">
                                                {s.no}
                                            </td>

                                            <td className="ds-td-nis">
                                                {s.nis}
                                            </td>

                                            <td>

                                                <div className="ds-student">

                                                    <div
                                                        className={`ds-avatar ds-avatar--${s.jenis_kelamin ===
                                                            "Perempuan"
                                                            ? "f"
                                                            : "m"
                                                            }`}
                                                    >
                                                        {s.nama
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <span>
                                                        {s.nama}
                                                    </span>

                                                </div>

                                            </td>

                                            <td>
                                                {s.kelas}
                                            </td>

                                            <td>

                                                <span
                                                    className={`ds-badge ds-badge--${s.jenis_kelamin ===
                                                        "Perempuan"
                                                        ? "female"
                                                        : "male"
                                                        }`}
                                                >
                                                    {s.jenis_kelamin}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`ds-badge ds-badge--${s.status ===
                                                        "aktif"
                                                        ? "aktif"
                                                        : "nonaktif"
                                                        }`}
                                                >
                                                    {s.status ===
                                                        "aktif"
                                                        ? "Aktif"
                                                        : s.status}
                                                </span>

                                            </td>

                                            <td>
                                                <div className="ds-action">

                                                    <button className="ds-btn-detail">
                                                        Detail
                                                    </button>

                                                    <div className="ds-more-wrapper">
                                                        <button
                                                            className="ds-btn-more"
                                                            onClick={() =>
                                                                setOpenMenu(openMenu === s.id ? null : s.id)
                                                            }
                                                        >
                                                            <MoreVertical size={17} />
                                                        </button>

                                                        {openMenu === s.id && (
                                                            <div className="ds-more-menu">
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenMenu(null);
                                                                        handleDelete(s.id);
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Hapus</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                        <div className="ds-table-footer">

                            <p>

                                {loading
                                    ? "Memuat..."
                                    : meta.total === 0
                                        ? "Tidak ada data siswa"
                                        : `Menampilkan ${(meta.current_page -
                                            1) *
                                        meta.per_page +
                                        1
                                        }–${Math.min(
                                            meta.current_page *
                                            meta.per_page,
                                            meta.total
                                        )} dari ${meta.total
                                        } siswa`}

                            </p>

                            <div className="ds-pagination">

                                <button
                                    className="ds-page-btn"
                                    onClick={() =>
                                        handlePage(page - 1)
                                    }
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {pageNumbers.map((p) => (

                                    <button
                                        key={p}
                                        className={`ds-page-btn${p === page
                                            ? " ds-page-btn--active"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            handlePage(p)
                                        }
                                    >
                                        {p}
                                    </button>

                                ))}

                                <button
                                    className="ds-page-btn"
                                    onClick={() =>
                                        handlePage(page + 1)
                                    }
                                    disabled={
                                        page ===
                                        meta.last_page
                                    }
                                >
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

            {showTambah && (

                <TambahSiswa
                    onClose={() =>
                        setShowTambah(false)
                    }
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchStudents(search, page);
                    }}
                />

            )}

        </div>
    );
}