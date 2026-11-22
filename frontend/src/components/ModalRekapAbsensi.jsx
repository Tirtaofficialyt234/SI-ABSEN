import React, { useState, useEffect } from "react";
import { Printer, FileText, X, TrendingUp } from "lucide-react";
import api from "../api/axios";

// 1. Format tanggal dan bulan Indonesia
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggal(str) {
  if (!str) return "-";
  const d = new Date(str + "T00:00:00");
  if (isNaN(d)) return str;
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatBulan(str) {
  if (!str) return "-";
  const [thn, bln] = str.split("-");
  const idx = parseInt(bln, 10) - 1;
  return `${NAMA_BULAN[idx]} ${thn}`;
}

// 2. Komponen Line Chart Monokrom (Clean SVG)
function LineChart({ data, mode }) {
  if (!data || data.length === 0) return null;

  const lebar = 700;
  const tinggi = 190;
  const padKiri = 50;
  const padKanan = 30;
  const padAtas = 25;
  const padBawah = 35;

  const areaLebar = lebar - padKiri - padKanan;
  const areaTinggi = tinggi - padAtas - padBawah;

  // Hitung posisi titik X dan Y
  const points = data.map((item, index) => {
    const x = padKiri + (areaLebar / Math.max(data.length - 1, 1)) * index;
    const persentase = item.persentase || 0;
    const y = padAtas + areaTinggi - (persentase / 100) * areaTinggi;
    const label = mode === "hari" ? item.date?.slice(5) : item.month;
    return { x, y, persentase, label };
  });

  const titikString = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg viewBox={`0 0 ${lebar} ${tinggi}`} style={{ width: "100%", minWidth: "480px", display: "block" }}>
        {/* Garis batas acuan 100%, 50%, 0% */}
        <line x1={padKiri} y1={padAtas} x2={lebar - padKanan} y2={padAtas} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={padKiri} y1={padAtas + areaTinggi / 2} x2={lebar - padKanan} y2={padAtas + areaTinggi / 2} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={padKiri} y1={tinggi - padBawah} x2={lebar - padKanan} y2={tinggi - padBawah} stroke="#e5e7eb" />

        <text x={padKiri - 8} y={padAtas + 4} fontSize="10" fill="#9ca3af" textAnchor="end">100%</text>
        <text x={padKiri - 8} y={padAtas + areaTinggi / 2 + 4} fontSize="10" fill="#9ca3af" textAnchor="end">50%</text>
        <text x={padKiri - 8} y={tinggi - padBawah + 4} fontSize="10" fill="#9ca3af" textAnchor="end">0%</text>

        {/* Garis Grafik Utama */}
        <polyline fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={titikString} />

        {/* Titik bulat dan teks persentase */}
        {points.map((p, index) => (
          <g key={index}>
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#111827" strokeWidth="2" />
            <text x={p.x} y={p.y - 8} fontSize="10" fontWeight="bold" fill="#111827" textAnchor="middle">
              {p.persentase}%
            </text>
            <text x={p.x} y={tinggi - 14} fontSize="10" fill="#6b7280" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// 3. Komponen Utama Modal
export default function ModalRekapAbsensi({ isOpen, onClose, selectedSchedule, guruId }) {
  const [mode, setMode] = useState("hari"); // 'hari' | 'bulan'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const endpoint = mode === "hari" ? "/guru/rekap-hari" : "/guru/rekap-bulan";
    const params = {
      kelas_id: selectedSchedule?.kelas_id,
      guru_id: guruId,
    };

    api.get(endpoint, { params })
      .then((res) => setData(res.data?.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [isOpen, mode, selectedSchedule, guruId]);

  // Data urut kronologis untuk grafik
  const dataGrafik = [...data].reverse().slice(-10);

  if (!isOpen) return null;

  return (
    <div className="rekap-backdrop">
      <div className="rekap-box">

        {/* Header Modal */}
        <div className="rekap-header no-print">
          <div className="rekap-title">
            <FileText size={18} color="#111827" />
            <div>
              <h3>Rekapitulasi Presensi</h3>
              <p>{selectedSchedule ? `${selectedSchedule.nama_kelas} · ${selectedSchedule.nama_mapel}` : "Semua Kelas"}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar Filter & Cetak */}
        <div className="rekap-toolbar no-print">
          <div className="tab-pill">
            <button
              className={`tab-item ${mode === "hari" ? "active" : ""}`}
              onClick={() => setMode("hari")}
            >
              Harian
            </button>
            <button
              className={`tab-item ${mode === "bulan" ? "active" : ""}`}
              onClick={() => setMode("bulan")}
            >
              Bulanan
            </button>
          </div>

          <button className="btn-print" onClick={() => window.print()}>
            <Printer size={14} /> Cetak PDF
          </button>
        </div>

        {/* Isi Dokumen (Area yang Tercetak) */}
        <div className="rekap-body printable-area">

          {/* KOP Sekolah */}
          <div className="doc-kop">
            <h2>SMK NEGERI CONTOH</h2>
            <p className="doc-sub">Laporan Rekapitulasi Presensi Siswa</p>
            <p className="doc-meta">
              Periode: <b>{mode === "hari" ? "Harian" : "Bulanan"}</b> · Kelas: <b>{selectedSchedule?.nama_kelas || "-"}</b> · Mapel: <b>{selectedSchedule?.nama_mapel || "-"}</b>
            </p>
            <hr className="doc-line" />
          </div>

          {loading ? (
            <p className="text-center">Memuat data rekap...</p>
          ) : data.length === 0 ? (
            <p className="text-center">Belum ada data presensi.</p>
          ) : (
            <>
              {/* Grafik Garis */}
              <div className="chart-card">
                <div className="chart-head">
                  <TrendingUp size={15} color="#374151" />
                  <strong>Grafik Tren Kehadiran Siswa</strong>
                </div>
                <LineChart data={dataGrafik} mode={mode} />
              </div>

              {/* Tabel Data */}
              <table className="rekap-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th style={{ textAlign: "left" }}>{mode === "hari" ? "Hari & Tanggal" : "Bulan"}</th>
                    <th>Total</th>
                    <th>Hadir</th>
                    <th>Izin</th>
                    <th>Sakit</th>
                    <th>Alpa</th>
                    <th>% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{mode === "hari" ? formatTanggal(item.date) : formatBulan(item.month)}</td>
                      <td className="text-center">{item.total}</td>
                      <td className="text-center font-bold">{item.hadir || 0}</td>
                      <td className="text-center">{item.izin || 0}</td>
                      <td className="text-center">{item.sakit || 0}</td>
                      <td className="text-center">{item.alpa || 0}</td>
                      <td className="text-center">
                        <span className={`badge-pct ${(item.persentase || 0) >= 75 ? "good" : "low"}`}>
                          {item.persentase || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Kolom Tanda Tangan */}
              <div className="doc-signature">
                <div className="signature-box">
                  <p>Mengetahui,</p>
                  <strong>Guru Pengampu</strong>
                  <div style={{ height: "45px" }} />
                  <p>( ........................................ )</p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Styling Monokrom & Print CSS */}
      <style>{`
        .rekap-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;
        }
        .rekap-box {
          background: #ffffff; border-radius: 8px; width: 100%; max-width: 860px;
          max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.12);
        }
        .rekap-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 18px; border-bottom: 1px solid #e5e7eb; background: #ffffff;
        }
        .rekap-title { display: flex; align-items: center; gap: 8px; }
        .rekap-title h3 { margin: 0; font-size: 15px; color: #111827; font-weight: 600; }
        .rekap-title p { margin: 0; font-size: 12px; color: #6b7280; }
        .btn-close { border: none; background: transparent; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 4px; }
        .btn-close:hover { color: #111827; background: #f3f4f6; }

        .rekap-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 18px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;
        }
        .tab-pill { display: flex; gap: 3px; background: #e5e7eb; padding: 3px; border-radius: 6px; }
        .tab-item {
          border: none; background: transparent; padding: 5px 14px; font-size: 12px;
          color: #4b5563; border-radius: 4px; cursor: pointer; font-weight: 500;
        }
        .tab-item.active { background: #ffffff; color: #111827; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

        .btn-print {
          display: flex; align-items: center; gap: 6px; background: #111827; color: #ffffff;
          border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
        }
        .btn-print:hover { background: #374151; }

        .rekap-body { padding: 22px; overflow-y: auto; flex: 1; }
        .doc-kop { text-align: center; margin-bottom: 16px; }
        .doc-kop h2 { margin: 0; font-size: 18px; color: #111827; letter-spacing: 0.03em; }
        .doc-sub { margin: 3px 0 0; font-size: 13px; color: #374151; }
        .doc-meta { margin: 4px 0 0; font-size: 12px; color: #6b7280; }
        .doc-line { border: 0; border-top: 1.5px solid #111827; margin-top: 10px; }

        .chart-card {
          border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 16px;
        }
        .chart-head { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; margin-bottom: 8px; }

        .rekap-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rekap-table th, .rekap-table td { border: 1px solid #e5e7eb; padding: 8px 10px; }
        .rekap-table th { background: #f9fafb; color: #374151; font-weight: 600; font-size: 12px; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 600; }

        .badge-pct { padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; }
        .badge-pct.good { background: #f3f4f6; color: #111827; }
        .badge-pct.low { background: #fef2f2; color: #991b1b; }

        .doc-signature { display: flex; justify-content: flex-end; margin-top: 24px; }
        .signature-box { text-align: center; width: 190px; font-size: 12px; color: #374151; }
        .signature-box p { margin: 2px 0; }

        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 16px; }
          .chart-card, .rekap-table { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
