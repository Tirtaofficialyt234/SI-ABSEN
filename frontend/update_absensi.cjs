const fs = require('fs');
const file = 'd:/laragon/www/sistem-akademik/frontend/src/pages/Absensi.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Search to lucide imports
content = content.replace('Check,', 'Check,\n    Search,');

// 2. Add Dashboard.css import
content = content.replace('import "./Absensi.css";', 'import "./Absensi.css";\nimport "./Dashboard.css";');

// 3. Add isSidebarOpen state
content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n    const [isSidebarOpen, setIsSidebarOpen] = useState(false);');

// 4. Replace return block
const returnIndex = content.indexOf('    return (');
if (returnIndex !== -1) {
    const codeBeforeReturn = content.substring(0, returnIndex);
    const newReturn = `    return (
        <div className="dashboard">
            {/* SIDEBAR OVERLAY */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={\`sidebar \${isSidebarOpen ? "open" : ""}\`}>
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
}`;
    fs.writeFileSync(file, codeBeforeReturn + newReturn);
    console.log('Successfully updated Absensi.jsx');
} else {
    console.log('Return block not found');
}
