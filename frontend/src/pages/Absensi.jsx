import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    UserRound,
    CalendarDays,
    FileText,
    Settings,
    LogOut,
    Bell,
    Menu,
    CalendarCheck,
    Search,
    UsersRound,
    ChevronDown,
    Check,
} from "lucide-react";

import api from "../api/axios";
import { logout as logoutApi } from "../api/auth";
import "./Absensi.css";
import "./Dashboard.css";

export default function Absensi() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await api.get("/siswa");

            const data = response.data.data || response.data;

            setStudents(data);

            const initialAttendance = {};

            data.forEach((student) => {
                initialAttendance[student.id] = {
                    status: "hadir",
                    keterangan: "",
                };
            });

            setAttendance(initialAttendance);
        } catch (error) {
            console.error("Gagal mengambil data siswa:", error);

            if (error.response?.status === 401) {
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

        fetchStudents();
    }, []);

    const handleStatusChange = (id, status) => {
        setAttendance((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                status,
            },
        }));
    };

    const handleKeteranganChange = (id, keterangan) => {
        setAttendance((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                keterangan,
            },
        }));
    };

    const handleSave = () => {
        const dataAbsensi = students.map((student) => ({
            siswa_id: student.id,
            tanggal: selectedDate,
            status: attendance[student.id]?.status || "hadir",
            keterangan: attendance[student.id]?.keterangan || "",
        }));

        console.log("DATA ABSENSI:", dataAbsensi);

        alert("Data absensi siap disimpan.");
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout gagal:", error);
        }

        localStorage.removeItem("token");
        navigate("/");
    };

    const classes = [
        ...new Set(
            students
                .map((student) => student.kelas)
                .filter(Boolean)
        ),
    ];

    const filteredStudents = students.filter((student) => {
        if (!selectedClass) return true;

        return student.kelas === selectedClass;
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

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
                        <span>Sistem Absensi Sekolah</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <a className="menu-item" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>
                    <a className="menu-item" onClick={() => navigate('/siswa')}>
                        <Users size={20} />
                        Data Siswa
                    </a>
                    <a className="menu-item active" onClick={() => navigate('/absensi')}>
                        <CalendarCheck size={20} />
                        Absensi
                    </a>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
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
                                placeholder="Cari nama siswa..."
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

                <section className="content">
                    <div className="absensi-welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                        <div className="absensi-welcome-left" style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                            <div className="absensi-welcome-icon" style={{ fontSize: "40px" }}>
                                ??
                            </div>
                            <div>
                                <h1 style={{ margin: "0 0 7px", fontSize: "27px" }}>Halo Admin!</h1>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                                    Selamat datang di halaman absensi.
                                    Kelola dan input data kehadiran siswa
                                    dengan mudah dan cepat.
                                </p>
                            </div>
                        </div>
                        <div className="absensi-welcome-image" style={{ color: "#2563eb" }}>
                            <CalendarCheck size={80} />
                        </div>
                    </div>

                    <div className="dashboard-card" style={{ padding: "30px", borderRadius: "15px", background: "white", border: "1px solid #e5e7eb" }}>
                        <div className="absensi-filter" style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
                            <div className="absensi-filter-item" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 15px", border: "1px solid #e5e7eb", borderRadius: "10px", flex: 1, minWidth: "200px" }}>
                                <CalendarDays size={19} style={{ color: "#64748b" }} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{ border: "none", outline: "none", width: "100%", color: "#334155" }}
                                />
                            </div>
                            <div className="absensi-filter-item" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 15px", border: "1px solid #e5e7eb", borderRadius: "10px", flex: 1, minWidth: "200px" }}>
                                <UsersRound size={19} style={{ color: "#64748b" }} />
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    style={{ border: "none", outline: "none", width: "100%", color: "#334155", background: "transparent" }}
                                >
                                    <option value="">Pilih Kelas</option>
                                    {classes.map((kelas) => (
                                        <option key={kelas} value={kelas}>{kelas}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                className="absensi-save" 
                                onClick={handleSave}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}
                            >
                                <Check size={19} />
                                Simpan Absensi
                            </button>
                        </div>

                        <div className="absensi-title" style={{ marginBottom: "20px" }}>
                            <h2 style={{ margin: "0 0 5px", fontSize: "18px" }}>Daftar Siswa</h2>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Pilih status kehadiran untuk setiap siswa pada {formatDate(selectedDate)}</p>
                        </div>

                        <div className="table-wrapper">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: "#f8fafc", padding: "13px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>No</th>
                                        <th style={{ background: "#f8fafc", padding: "13px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Nama Siswa</th>
                                        <th style={{ background: "#f8fafc", padding: "13px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Kelas</th>
                                        <th style={{ background: "#f8fafc", padding: "13px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Status Kehadiran</th>
                                        <th style={{ background: "#f8fafc", padding: "13px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                                                Memuat data siswa...
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                                                Tidak ada data siswa.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student, index) => {
                                            const current = attendance[student.id] || { status: "hadir", keterangan: "" };
                                            
                                            // Determine colors based on status
                                            let selectBg = "#dcfce7";
                                            let selectColor = "#15803d";
                                            if (current.status === "izin") { selectBg = "#fef3c7"; selectColor = "#b45309"; }
                                            if (current.status === "sakit") { selectBg = "#fee2e2"; selectColor = "#dc2626"; }
                                            if (current.status === "alfa") { selectBg = "#e2e8f0"; selectColor = "#475569"; }
                                            
                                            return (
                                                <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={{ padding: "14px 13px", fontSize: "13px" }}>{index + 1}</td>
                                                    <td style={{ padding: "14px 13px", fontSize: "13px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", color: "#64748b" }}>
                                                                {student.nama?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <span style={{ fontWeight: "500" }}>{student.nama}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 13px", fontSize: "13px", color: "#64748b" }}>{student.kelas || "-"}</td>
                                                    <td style={{ padding: "14px 13px", fontSize: "13px" }}>
                                                        <select
                                                            value={current.status}
                                                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                            style={{ 
                                                                padding: "6px 12px", 
                                                                borderRadius: "20px", 
                                                                border: "none", 
                                                                background: selectBg, 
                                                                color: selectColor,
                                                                fontWeight: "600",
                                                                outline: "none",
                                                                cursor: "pointer",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            <option value="hadir">Hadir</option>
                                                            <option value="izin">Izin</option>
                                                            <option value="sakit">Sakit</option>
                                                            <option value="alfa">Alfa</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: "14px 13px", fontSize: "13px" }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Contoh: Sakit demam..."
                                                            value={current.keterangan}
                                                            onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                                                            style={{
                                                                padding: "8px 12px",
                                                                border: "1px solid #e2e8f0",
                                                                borderRadius: "8px",
                                                                width: "100%",
                                                                outline: "none",
                                                                fontSize: "13px"
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}