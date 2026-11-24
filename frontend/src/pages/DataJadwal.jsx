import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahJadwal from "./TambahJadwal";

import {
    Search,
    Plus,
    ChevronDown,
    LayoutDashboard,
    Users,
    School,
    GraduationCap,
    CalendarCheck,
    CalendarDays,
    BookOpen,
    LogOut,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Check,
} from "lucide-react";

import "./Dashboard.css";
import "./DataJadwal.css";

export default function DataJadwal() {
    const navigate = useNavigate();

    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [hariFilter, setHariFilter] = useState("");
    const [page, setPage] = useState(1);

    const [meta, setMeta] = useState({
        total: 0,
        last_page: 1,
        per_page: 10,
    });

    const [showTambah, setShowTambah] = useState(false);
    const [openHariDropdown, setOpenHariDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isFirstRender = useRef(true);
    const hariDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (hariDropdownRef.current && !hariDropdownRef.current.contains(event.target)) {
                setOpenHariDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const hariList = [
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu",
    ];

    const fetchJadwal = async (
        searchVal = search,
        pageVal = page,
        hariVal = hariFilter
    ) => {
        setLoading(true);

        try {
            const params = {
                search: searchVal,
                page: pageVal,
            };

            if (hariVal) {
                params.hari = hariVal;
            }

            const res = await api.get("/jadwal", { params });

            setJadwal(res.data.data);

            setMeta({
                total: res.data.total,
                last_page: res.data.last_page,
                per_page: res.data.per_page,
                current_page: res.data.current_page,
            });
        } catch (err) {
            console.error("Gagal mengambil data jadwal:", err);

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

        if (
            !token ||
            token === "undefined" ||
            token === "null"
        ) {
            navigate("/");
            return;
        }

        fetchJadwal();
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            setPage(1);
            fetchJadwal(search, 1, hariFilter);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        setPage(1);
        fetchJadwal(search, 1, hariFilter);
    }, [hariFilter]);

    const handleSelectHari = (val) => {
        setHariFilter(val);
        setOpenHariDropdown(false);
    };

    const selectedHariLabel = hariFilter ? capitalize(hariFilter) : "Semua Hari";

    const handlePage = (p) => {
        if (p < 1 || p > meta.last_page) {
            return;
        }

        setPage(p);
        fetchJadwal(search, p, hariFilter);
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
        const sure = window.confirm("Yakin ingin menghapus jadwal ini?");

        if (!sure) return;

        try {
            await api.delete(`/jadwal/${id}`);
            alert("Jadwal berhasil dihapus");
            fetchJadwal(search, page, hariFilter);
        } catch (error) {
            console.error("ERROR DELETE:", error);
            alert(
                error.response?.data?.message ||
                "Gagal menghapus jadwal"
            );
        }
    };

    const capitalize = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    const startPage = Math.max(1, Math.min(page - 2, meta.last_page - 4));
    const pageNumbers = Array.from(
        { length: 5 },
        (_, i) => startPage + i
    ).filter(p => p > 0 && p <= meta.last_page);

    const startEntry = (page - 1) * meta.per_page + 1;
    const endEntry = Math.min(page * meta.per_page, meta.total);

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
                        className="menu-item"
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
                            navigate("/guru")
                        }
                    >
                        <GraduationCap size={20} />
                        Data Guru
                    </a>

                    <a
                        className="menu-item"
                        onClick={() =>
                            navigate("/kelas")
                        }
                    >
                        <School size={20} />
                        Data Kelas
                    </a>

                    <a
                        className="menu-item active"
                        onClick={() =>
                            navigate("/jadwal")
                        }
                    >
                        <CalendarCheck size={20} />
                        Jadwal
                    </a>

                    <a
                        className="menu-item"
                        onClick={() =>
                            navigate("/tahun-ajaran")
                        }
                    >
                        <CalendarDays size={20} />
                        Tahun Ajaran
                    </a>

                    <a
                        className="menu-item"
                        onClick={() =>
                            navigate("/mapel")
                        }
                    >
                        <BookOpen size={20} />
                        Mata Pelajaran
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


            {/* MAIN */}
            <main className="main-content">
                <AdminTopbar
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
                    onLogout={handleLogout}
                    searchPlaceholder="Cari jadwal..."
                />


                {/* CONTENT */}
                <section className="dj-content">

                    <div className="dj-page-header">
                        <h1>Manajemen Jadwal</h1>
                        <p>Kelola jadwal pelajaran untuk setiap kelas dan guru pengampu</p>
                    </div>


                    {/* FILTER BAR */}
                    <div className="dj-filter-bar">

                        <div className="dj-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari mapel, guru, atau kelas..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        {/* CUSTOM MODERN DROPDOWN HARI */}
                        <div className="dj-dropdown-wrapper" ref={hariDropdownRef}>
                            <button
                                type="button"
                                className={`dj-dropdown-trigger ${openHariDropdown ? "dj-dropdown-trigger--open" : ""}`}
                                onClick={() => setOpenHariDropdown(!openHariDropdown)}
                            >
                                <Calendar size={16} className="dj-dropdown-icon" />
                                <span className="dj-dropdown-label">{selectedHariLabel}</span>
                                <ChevronDown
                                    size={15}
                                    className={`dj-dropdown-chevron ${openHariDropdown ? "dj-dropdown-chevron--rotate" : ""}`}
                                />
                            </button>

                            {openHariDropdown && (
                                <div className="dj-dropdown-menu">
                                    <button
                                        type="button"
                                        className={`dj-dropdown-item ${hariFilter === "" ? "dj-dropdown-item--selected" : ""}`}
                                        onClick={() => handleSelectHari("")}
                                    >
                                        <span>Semua Hari</span>
                                        {hariFilter === "" && <Check size={14} className="dj-dropdown-check" />}
                                    </button>
                                    {hariList.map((h) => (
                                        <button
                                            key={h}
                                            type="button"
                                            className={`dj-dropdown-item ${hariFilter === h ? "dj-dropdown-item--selected" : ""}`}
                                            onClick={() => handleSelectHari(h)}
                                        >
                                            <span>{capitalize(h)}</span>
                                            {hariFilter === h && <Check size={14} className="dj-dropdown-check" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            className="dj-add-btn"
                            onClick={() => setShowTambah(true)}
                        >
                            <Plus size={19} />
                            Tambah Jadwal
                        </button>

                    </div>


                    {/* TABLE */}
                    <div className="dj-table-card">
                        <table className="dj-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Hari</th>
                                    <th>Waktu</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Guru Pengampu</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="dj-td-loading"
                                        >
                                            Memuat data jadwal...
                                        </td>
                                    </tr>
                                ) : jadwal.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="dj-td-loading"
                                        >
                                            Tidak ada data jadwal ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    jadwal.map((j, index) => (
                                        <tr key={j.id}>
                                            <td className="dj-td-no">
                                                {(page - 1) * meta.per_page + index + 1}
                                            </td>

                                            <td>
                                                <span className="dj-badge dj-badge--hari">
                                                    {capitalize(j.hari)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="dj-badge dj-badge--waktu">
                                                    {j.jam_mulai?.slice(0, 5)} - {j.jam_selesai?.slice(0, 5)}
                                                </span>
                                            </td>

                                            <td>
                                                {j.kelas?.nama_kelas || "-"}
                                            </td>

                                            <td>
                                                {j.mapel?.nama_mapel || "-"}
                                            </td>

                                            <td>
                                                {j.guru?.nama || "-"}
                                            </td>

                                            <td>
                                                <div className="dj-action">
                                                    <button
                                                        className="dj-btn-delete"
                                                        onClick={() => handleDelete(j.id)}
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

                        {!loading && jadwal.length > 0 && (
                            <div className="dj-table-footer">
                                <p>
                                    Menampilkan {startEntry}–{endEntry} dari {meta.total} jadwal
                                </p>

                                <div className="dj-pagination">
                                    <button
                                        className="dj-page-btn"
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
                                            className={`dj-page-btn${p === page ? " dj-page-btn--active" : ""}`}
                                            onClick={() =>
                                                handlePage(p)
                                            }
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        className="dj-page-btn"
                                        onClick={() =>
                                            handlePage(page + 1)
                                        }
                                        disabled={
                                            page === meta.last_page
                                        }
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </section>

            </main>


            {/* MODAL TAMBAH JADWAL */}
            {showTambah && (
                <TambahJadwal
                    onClose={() => setShowTambah(false)}
                    onSuccess={() => {
                        setShowTambah(false);
                        fetchJadwal(search, page, hariFilter);
                    }}
                />
            )}

        </div>
    );
}

