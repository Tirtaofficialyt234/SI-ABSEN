import { useState } from "react";
import { X, User, GraduationCap, Calendar, CheckCircle2, AlertCircle, Clock, ShieldCheck, Mail } from "lucide-react";
import "./DetailSiswa.css";

export default function DetailSiswa({ siswaData, onClose }) {
    const { siswa, rekap_absensi } = siswaData || {};
    const kelasAktif = siswa?.kelas_aktif;

    const totalAbsen = rekap_absensi?.total || 0;
    const hadir = rekap_absensi?.hadir || 0;
    const izin = rekap_absensi?.izin || 0;
    const sakit = rekap_absensi?.sakit || 0;
    const alpa = rekap_absensi?.alpa || 0;

    const persenHadir = totalAbsen > 0 ? Math.round((hadir / totalAbsen) * 100) : 0;

    return (
        <div className="modal-overlay">
            <div className="modal-card detail-modal-card">
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        <div className="modal-icon">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <h2>Detail Siswa</h2>
                            <p>Informasi profil, kelas, dan rekap absensi</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="detail-body">
                    {/* Profile Banner */}
                    <div className="detail-profile-banner">
                        <div className={`detail-avatar detail-avatar--${siswa?.user?.jenis_kelamin === "Perempuan" ? "f" : "m"}`}>
                            {siswa?.nama?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="detail-profile-info">
                            <h3>{siswa?.nama}</h3>
                            <div className="detail-profile-meta">
                                <span>NIS: <strong>{siswa?.nis}</strong></span>
                                <span>•</span>
                                <span className={`ds-badge ds-badge--${siswa?.status === "aktif" ? "aktif" : "nonaktif"}`}>
                                    {siswa?.status === "aktif" ? "Siswa Aktif" : siswa?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Siswa */}
                    <div className="detail-section">
                        <h4 className="detail-section-title">Informasi Akademik</h4>
                        <div className="detail-grid-info">
                            <div className="detail-info-item">
                                <span className="detail-label">Kelas Saat Ini</span>
                                <span className="detail-value">{kelasAktif?.kelas?.nama_kelas || "Belum ada kelas"}</span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-label">Tahun Ajaran</span>
                                <span className="detail-value">{kelasAktif?.tahun_ajaran ? `${kelasAktif.tahun_ajaran.nama} (${kelasAktif.tahun_ajaran.semester})` : "-"}</span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-label">Akun Email</span>
                                <span className="detail-value detail-value-email">
                                    <Mail size={14} />
                                    {siswa?.user?.email || `${siswa?.nis}@sekolah.local`}
                                </span>
                            </div>
                            <div className="detail-info-item">
                                <span className="detail-label">Jenis Kelamin</span>
                                <span className="detail-value">{siswa?.user?.jenis_kelamin || siswa?.jenis_kelamin || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Presensi */}
                    <div className="detail-section">
                        <div className="detail-section-header">
                            <h4 className="detail-section-title">Rekap Kehadiran Siswa</h4>
                            <span className="detail-persentase-badge">
                                {persenHadir}% Kehadiran
                            </span>
                        </div>

                        <div className="detail-rekap-grid">
                            <div className="detail-rekap-card hadir">
                                <span className="detail-rekap-number">{hadir}</span>
                                <span className="detail-rekap-label">Hadir</span>
                            </div>
                            <div className="detail-rekap-card izin">
                                <span className="detail-rekap-number">{izin}</span>
                                <span className="detail-rekap-label">Izin</span>
                            </div>
                            <div className="detail-rekap-card sakit">
                                <span className="detail-rekap-number">{sakit}</span>
                                <span className="detail-rekap-label">Sakit</span>
                            </div>
                            <div className="detail-rekap-card alpa">
                                <span className="detail-rekap-number">{alpa}</span>
                                <span className="detail-rekap-label">Alpa</span>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Kelas */}
                    {siswa?.riwayat_kelas && siswa.riwayat_kelas.length > 0 && (
                        <div className="detail-section">
                            <h4 className="detail-section-title">Riwayat Rombel / Kelas</h4>
                            <div className="detail-riwayat-list">
                                {siswa.riwayat_kelas.map((rk, idx) => (
                                    <div key={rk.id || idx} className="detail-riwayat-item">
                                        <div className="detail-riwayat-left">
                                            <span className="detail-riwayat-bullet"></span>
                                            <div>
                                                <strong>{rk.kelas?.nama_kelas || "Kelas"}</strong>
                                                <small>{rk.tahun_ajaran ? `${rk.tahun_ajaran.nama} - Semester ${rk.tahun_ajaran.semester}` : ""}</small>
                                            </div>
                                        </div>
                                        <span className={`ds-badge ds-badge--${rk.status === "aktif" ? "aktif" : "nonaktif"}`}>
                                            {rk.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

