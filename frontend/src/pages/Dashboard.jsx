import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { logout as logoutApi } from "../api/auth";
import AdminTopbar from "../components/AdminTopbar";

import {
    LayoutDashboard,
    Users,
    School,
    CalendarCheck,
    CalendarDays,
    BookOpen,
    GraduationCap,
    LogOut,
} from "lucide-react";
import "./Dashboard.css";

const EMPTY_NOTIFICATION_ITEMS = [];

export default function Dashboard() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const attendanceTableRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.error("Logout di backend gagal:", err);
        }
        // Pastikan token selalu dihapus dari penyimpanan
        localStorage.removeItem("token");
        navigate("/"); // Ubah dari /login ke /
    };

    useEffect(() => {
        const loadDashboard = async () => {
            const token = localStorage.getItem("token");

            if (!token || token === "undefined" || token === "null") {
                navigate("/");
                return;
            }

            try {
                const response = await api.get('/admin/dashboard');
                setDashboard(response.data);
                setErrorMsg("");
            } catch (error) {
                console.error("Dashboard error:", error.response?.status, error.response?.data || error.message);
                if (error.response?.status === 401) {
                    // Token tidak valid, redirect ke login
                    localStorage.removeItem("token");
                    navigate("/");
                } else if (error.response?.status === 403) {
                    setErrorMsg("Anda tidak memiliki akses ke halaman ini (403 Forbidden).");
                } else {
                    setErrorMsg("Gagal mengambil data dari server: " + error.message);
                }
            }
        };

        loadDashboard();
    }, [navigate]);

    const notifications = dashboard?.absensi_terbaru ?? [];

    const handleNotificationClick = () => {
        attendanceTableRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
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

                    <a className="menu-item active" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>

                    <a className="menu-item" onClick={() => navigate('/siswa')}>
                        <Users size={20} />
                        Data Siswa
                    </a>

                    <a className="menu-item" onClick={() => navigate('/guru')}>
                        <GraduationCap size={20} />
                        Data Guru
                    </a>

                    <a className="menu-item" onClick={() => navigate('/kelas')}>
                        <School size={20} />
                        Data Kelas
                    </a>

                    <a className="menu-item" onClick={() => navigate('/jadwal')}>
                        <CalendarCheck size={20} />
                        Jadwal
                    </a>

                    <a className="menu-item" onClick={() => navigate('/tahun-ajaran')}>
                        <CalendarDays size={20} />
                        Tahun Ajaran
                    </a>

                    <a className="menu-item" onClick={() => navigate('/mapel')}>
                        <BookOpen size={20} />
                        Mata Pelajaran
                    </a>

                </nav>

                <button className="logout-btn" onClick={handleLogout}>
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
                    onNotificationClick={handleNotificationClick}
                    searchPlaceholder="Cari nama siswa..."
                    notificationItems={dashboard?.absensi_terbaru ?? EMPTY_NOTIFICATION_ITEMS}
                />


                {/* CONTENT */}
                <section className="content">

                    {errorMsg && (
                        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                            {errorMsg}
                        </div>
                    )}

                    <div className="welcome">

                        <div>
                            <h1>
                                Selamat datang, Admin
                            </h1>

                            <p>
                                Berikut adalah ringkasan kehadiran siswa hari ini.
                            </p>
                        </div>

                        <button className="date-btn">
                            <CalendarCheck size={18} />
                            Hari ini
                        </button>

                    </div>


                    {/* STAT CARDS */}
                    <div className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-icon blue">
                                <Users size={24} />
                            </div>

                            <div>
                                <p>Total Siswa</p>
                                <h2>
                                    {dashboard?.total_siswa ?? "-"}
                                </h2>
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-icon purple">
                                <GraduationCap size={24} />
                            </div>

                            <div>
                                <p>Total Guru</p>
                                <h2>
                                    {dashboard?.total_guru ?? "-"}
                                </h2>
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-icon green">
                                <CalendarCheck size={24} />
                            </div>

                            <div>
                                <p>Total Kelas</p>
                                <h2>
                                    {dashboard?.total_kelas ?? "-"}
                                </h2>
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-icon orange">
                                <CalendarCheck size={24} />
                            </div>

                            <div>
                                <p>Kehadiran Hari Ini</p>
                                <h2>
                                    {dashboard?.persentase_hadir ?? "-"}%
                                </h2>
                            </div>

                        </div>

                    </div>


                    {/* CHART AREA */}
                    <div className="middle-grid">

                        <div className="dashboard-card chart-card">

                            <div className="card-header">
                                <div>
                                    <h3>Grafik Kehadiran</h3>
                                    <p>7 hari terakhir</p>
                                </div>
                            </div>

                            <div className="chart-placeholder">

                                <div className="chart-line">
                                    {dashboard?.grafik_kehadiran ? (
                                        dashboard.grafik_kehadiran.map((item, index) => (
                                            <div key={index} className="chart-col">
                                                <span className="chart-val">{item.persentase}%</span>
                                                <div
                                                    className="chart-bar"
                                                    style={{ height: `${Math.max(item.persentase, 4)}%` }}
                                                    title={`${item.hari}: ${item.persentase}% Kehadiran`}
                                                ></div>
                                            </div>
                                        ))
                                    ) : (
                                        [1, 2, 3, 4, 5, 6, 7].map((i) => (
                                            <div key={i} className="chart-col">
                                                <span className="chart-val">0%</span>
                                                <div className="chart-bar" style={{ height: "4%" }}></div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="chart-label">
                                    {dashboard?.grafik_kehadiran ? (
                                        dashboard.grafik_kehadiran.map((item, index) => (
                                            <span key={index}>{item.hari}</span>
                                        ))
                                    ) : (
                                        <>
                                            <span>Sen</span>
                                            <span>Sel</span>
                                            <span>Rab</span>
                                            <span>Kam</span>
                                            <span>Jum</span>
                                            <span>Sab</span>
                                            <span>Min</span>
                                        </>
                                    )}
                                </div>

                            </div>

                        </div>


                        {/* STATUS */}
                        <div className="dashboard-card status-card">

                            <div className="card-header">
                                <div>
                                    <h3>Status Kehadiran</h3>
                                    <p>Hari ini</p>
                                </div>
                            </div>

                            <div className="attendance">

                                <div 
                                    className="donut" 
                                    style={
                                        (() => {
                                            const hadir = dashboard?.hadir || 0;
                                            const izin = dashboard?.izin || 0;
                                            const sakit = dashboard?.sakit || 0;
                                            const alfa = dashboard?.alfa || 0;
                                            const total = hadir + izin + sakit + alfa;
                                            
                                            if (total === 0) {
                                                return { background: 'conic-gradient(#94a3b8 0deg 360deg)' };
                                            }
                                            
                                            const hDeg = (hadir / total) * 360;
                                            const iDeg = (izin / total) * 360;
                                            const sDeg = (sakit / total) * 360;
                                            
                                            return {
                                                background: `conic-gradient(#2563eb 0deg ${hDeg}deg, #f59e0b ${hDeg}deg ${hDeg + iDeg}deg, #ef4444 ${hDeg + iDeg}deg ${hDeg + iDeg + sDeg}deg, #94a3b8 ${hDeg + iDeg + sDeg}deg 360deg)`
                                            };
                                        })()
                                    }
                                >
                                    <div>
                                        <strong>
                                            {dashboard?.persentase_hadir ?? "-"}%
                                        </strong>
                                        <small>Hadir</small>
                                    </div>
                                </div>

                                <div className="status-list">

                                    <div>
                                        <span>
                                            <i className="dot hadir"></i>
                                            Hadir
                                        </span>

                                        <strong>
                                            {dashboard?.hadir ?? "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <i className="dot izin"></i>
                                            Izin
                                        </span>

                                        <strong>
                                            {dashboard?.izin ?? "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <i className="dot sakit"></i>
                                            Sakit
                                        </span>

                                        <strong>
                                            {dashboard?.sakit ?? "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            <i className="dot alfa"></i>
                                            Alfa
                                        </span>

                                        <strong>
                                            {dashboard?.alfa ?? "-"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* RECENT ATTENDANCE */}
                    <div className="dashboard-card table-card" ref={attendanceTableRef}>

                        <div className="card-header">

                            <div>
                                <h3>Absensi Terbaru</h3>
                                <p>Data absensi siswa terbaru</p>
                            </div>

                            <button>
                                Lihat Semua
                            </button>

                        </div>


                        <div className="table-wrapper">

                            <table>

                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Siswa</th>
                                        <th>Kelas</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {notifications.length > 0 ? (
                                        notifications.map((item, index) => (

                                            <tr key={item.id}>

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {item.nama_siswa}
                                                </td>

                                                <td>
                                                    {item.nama_kelas}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${item.status}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {item.tanggal}
                                                </td>

                                            </tr>

                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="empty-table-message">
                                                Belum ada absensi terbaru.
                                            </td>
                                        </tr>
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