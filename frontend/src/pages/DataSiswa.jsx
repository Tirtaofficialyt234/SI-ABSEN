import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import api from "../api/axios";
import AdminTopbar from "../components/AdminTopbar";
import TambahSiswa from "./TambahSiswa";
import DetailSiswa from "./DetailSiswa";

import {
    Search,
    Plus,
    ChevronDown,
    MoreVertical,
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
    Shield,
    Check,
} from "lucide-react";

import "./Dashboard.css";
import "./DataSiswa.css";

export default function DataSiswa() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [kelasList, setKelasList] = useState([]);
    const [kelasFilter, setKelasFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [meta, setMeta] = useState({
        total: 0,
        last_page: 1,
        per_page: 10,
    });

    const [showTambah, setShowTambah] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [openKelasDropdown, setOpenKelasDropdown] = useState(false);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isFirstRender = useRef(true);
    const kelasDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (kelasDropdownRef.current && !kelasDropdownRef.current.contains(event.target)) {
                setOpenKelasDropdown(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setOpenStatusDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchStudents = async (
        searchVal = search,
        pageVal = page,
        kelasVal = kelasFilter,
        statusVal = statusFilter
    ) => {
        setLoading(true);

        try {
            const params = {
                search: searchVal,
                page: pageVal,
            };

            if (kelasVal) {
                params.kelas_id = kelasVal;
            }

            if (statusVal) {
                params.status = statusVal;
            }

            const res = await api.get("/siswa", { params });

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

        if (!token || token === "undefined" || token === "null") {
            navigate("/");
            return;
        }

        // Ambil daftar kelas untuk dropdown filter
        api.get("/kelas")
            .then((res) => setKelasList(res.data))
            .catch((err) => console.error("Gagal load kelas:", err));

        fetchStudents(search, 1, kelasFilter, statusFilter);
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            setPage(1);
            fetchStudents(search, 1, kelasFilter, statusFilter);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleSelectKelas = (val) => {
        setKelasFilter(val);
        setOpenKelasDropdown(false);
        setPage(1);
        fetchStudents(search, 1, val, statusFilter);
    };

    const handleSelectStatus = (val) => {
        setStatusFilter(val);
        setOpenStatusDropdown(false);
        setPage(1);
        fetchStudents(search, 1, kelasFilter, val);
    };

    const selectedKelasLabel = kelasList.find((k) => String(k.id) === String(kelasFilter))?.nama_kelas || "Semua Kelas";

    const statusOptions = [
        { label: "Semua Status", value: "" },
        { label: "Aktif", value: "aktif" },
        { label: "Lulus", value: "lulus" },
        { label: "Pindah", value: "pindah" },
        { label: "Keluar", value: "keluar" },
    ];

    const selectedStatusLabel = statusOptions.find((s) => s.value === statusFilter)?.label || "Semua Status";

    const handlePage = (p) => {
        if (p < 1 || p > meta.last_page) {
            return;
        }

        setPage(p);
        fetchStudents(search, p, kelasFilter, statusFilter);
    };

    const handleOpenDetail = async (id) => {
        setLoadingDetail(true);
        try {
            const res = await api.get(`/siswa/${id}`);
            setSelectedDetail(res.data);
        } catch (err) {
            console.error("Gagal mengambil detail siswa:", err);
            alert("Gagal memuat detail siswa");
        } finally {
            setLoadingDetail(false);
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

    const handleDelete = async (id) => {
        const sure = window.confirm("Yakin ingin menghapus data siswa ini?");

        if (!sure) return;

        try {
            const response = await api.delete(`/siswa/${id}`);

            console.log("HASIL DELETE:", response.data);
            alert("Data berhasil dihapus");
            fetchStudents(search, page, kelasFilter, statusFilter);
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
                        className="menu-item"
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

            <main className="main-content">
                    <AdminTopbar
                        isSidebarOpen={isSidebarOpen}
                        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
                        onLogout={handleLogout}
                        searchPlaceholder="Cari siswa, kelas, atau NIS..."
                    />

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

                        {/* FILTER KELAS (CUSTOM MODERN DROPDOWN) */}
                        <div className="ds-dropdown-wrapper" ref={kelasDropdownRef}>
                            <button
                                type="button"
                                className={`ds-dropdown-trigger ${openKelasDropdown ? "ds-dropdown-trigger--open" : ""}`}
                                onClick={() => {
                                    setOpenKelasDropdown(!openKelasDropdown);
                                    setOpenStatusDropdown(false);
                                }}
                            >
                                <Users size={16} className="ds-dropdown-icon" />
                                <span className="ds-dropdown-label">{selectedKelasLabel}</span>
                                <ChevronDown
                                    size={15}
                                    className={`ds-dropdown-chevron ${openKelasDropdown ? "ds-dropdown-chevron--rotate" : ""}`}
                                />
                            </button>

                            {openKelasDropdown && (
                                <div className="ds-dropdown-menu">
                                    <button
                                        type="button"
                                        className={`ds-dropdown-item ${kelasFilter === "" ? "ds-dropdown-item--selected" : ""}`}
                                        onClick={() => handleSelectKelas("")}
                                    >
                                        <span>Semua Kelas</span>
                                        {kelasFilter === "" && <Check size={14} className="ds-dropdown-check" />}
                                    </button>
                                    {kelasList.map((k) => (
                                        <button
                                            key={k.id}
                                            type="button"
                                            className={`ds-dropdown-item ${String(kelasFilter) === String(k.id) ? "ds-dropdown-item--selected" : ""}`}
                                            onClick={() => handleSelectKelas(k.id)}
                                        >
                                            <span>{k.nama_kelas}</span>
                                            {String(kelasFilter) === String(k.id) && (
                                                <Check size={14} className="ds-dropdown-check" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FILTER STATUS (CUSTOM MODERN DROPDOWN) */}
                        <div className="ds-dropdown-wrapper" ref={statusDropdownRef}>
                            <button
                                type="button"
                                className={`ds-dropdown-trigger ${openStatusDropdown ? "ds-dropdown-trigger--open" : ""}`}
                                onClick={() => {
                                    setOpenStatusDropdown(!openStatusDropdown);
                                    setOpenKelasDropdown(false);
                                }}
                            >
                                <Shield size={16} className="ds-dropdown-icon" />
                                <span className="ds-dropdown-label">{selectedStatusLabel}</span>
                                <ChevronDown
                                    size={15}
                                    className={`ds-dropdown-chevron ${openStatusDropdown ? "ds-dropdown-chevron--rotate" : ""}`}
                                />
                            </button>

                            {openStatusDropdown && (
                                <div className="ds-dropdown-menu">
                                    {statusOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`ds-dropdown-item ${statusFilter === opt.value ? "ds-dropdown-item--selected" : ""}`}
                                            onClick={() => handleSelectStatus(opt.value)}
                                        >
                                            <span>{opt.label}</span>
                                            {statusFilter === opt.value && (
                                                <Check size={14} className="ds-dropdown-check" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

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

                                                    <button 
                                                        className="ds-btn-detail"
                                                        onClick={() => handleOpenDetail(s.id)}
                                                        disabled={loadingDetail}
                                                    >
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
                        fetchStudents(search, page, kelasFilter, statusFilter);
                    }}
                />

            )}

            {/* MODAL DETAIL SISWA */}
            {selectedDetail && (
                <DetailSiswa
                    siswaData={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                />
            )}

        </div>
    );
}