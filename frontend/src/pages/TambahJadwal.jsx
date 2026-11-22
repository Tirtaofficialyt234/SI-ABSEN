import { useState, useEffect } from "react";
import { X, CalendarCheck } from "lucide-react";
import api from "../api/axios";
import CustomSelect from "../components/CustomSelect";
import "./TambahSiswa.css";

export default function TambahJadwal({
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState({
        kelas_id: "",
        mapel_id: "",
        guru_id: "",
        hari: "",
        jam_mulai: "",
        jam_selesai: "",
    });

    const [options, setOptions] = useState({
        kelas: [],
        mapel: [],
        guru: [],
        tahun_ajaran: null,
    });

    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState("");

    const hariList = [
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu",
    ];

    const capitalize = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await api.get("/jadwal-options");
                setOptions(res.data);
            } catch (err) {
                console.error("Gagal mengambil opsi jadwal:", err);
                setError("Gagal memuat data opsi. Silakan coba lagi.");
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await api.post("/jadwal", {
                tahun_ajaran_id: options.tahun_ajaran?.id,
                kelas_id: Number(form.kelas_id),
                mapel_id: Number(form.mapel_id),
                guru_id: Number(form.guru_id),
                hari: form.hari,
                jam_mulai: form.jam_mulai,
                jam_selesai: form.jam_selesai,
            });

            onSuccess();

        } catch (err) {
            console.error(
                "Gagal menambahkan jadwal:",
                err
            );

            if (err.response?.status === 422) {
                const message = err.response.data?.message;
                const errors = err.response.data?.errors;

                if (message) {
                    setError(message);
                } else if (errors) {
                    const firstError = Object.values(errors)[0];
                    setError(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : firstError
                    );
                } else {
                    setError("Data jadwal tidak valid.");
                }
            } else {
                setError(
                    "Terjadi kesalahan. Silakan coba lagi."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal-card">

                <div className="modal-header">

                    <div className="modal-title-wrapper">

                        <div className="modal-icon">
                            <CalendarCheck size={21} />
                        </div>

                        <div>
                            <h2>
                                Tambah Jadwal
                            </h2>

                            <p>
                                Tambahkan jadwal pelajaran baru
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>

                {error && (
                    <div className="modal-error">
                        {error}
                    </div>
                )}

                {loadingOptions ? (
                    <p style={{ textAlign: "center", color: "#6b7a99", padding: "20px 0" }}>
                        Memuat data...
                    </p>
                ) : (
                    <form
                        className="siswa-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Kelas</label>
                                <CustomSelect
                                    name="kelas_id"
                                    value={form.kelas_id}
                                    onChange={handleChange}
                                    options={options.kelas.map((k) => ({
                                        label: k.nama_kelas,
                                        value: k.id,
                                    }))}
                                    placeholder="Pilih kelas"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hari</label>
                                <CustomSelect
                                    name="hari"
                                    value={form.hari}
                                    onChange={handleChange}
                                    options={hariList.map((h) => ({
                                        label: capitalize(h),
                                        value: h,
                                    }))}
                                    placeholder="Pilih hari"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mata Pelajaran</label>
                            <CustomSelect
                                name="mapel_id"
                                value={form.mapel_id}
                                onChange={handleChange}
                                options={options.mapel.map((m) => ({
                                    label: m.nama_mapel,
                                    value: m.id,
                                }))}
                                placeholder="Pilih mata pelajaran"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Guru Pengampu</label>
                            <CustomSelect
                                name="guru_id"
                                value={form.guru_id}
                                onChange={handleChange}
                                options={options.guru.map((g) => ({
                                    label: g.nama,
                                    value: g.id,
                                }))}
                                placeholder="Pilih guru"
                                required
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Jam Mulai</label>
                                <input
                                    type="time"
                                    name="jam_mulai"
                                    value={form.jam_mulai}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Jam Selesai</label>
                                <input
                                    type="time"
                                    name="jam_selesai"
                                    value={form.jam_selesai}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {options.tahun_ajaran && (
                            <div style={{
                                padding: "10px 14px",
                                background: "#f0fdf4",
                                borderRadius: "8px",
                                fontSize: "13px",
                                color: "#15803d",
                                marginBottom: "8px",
                            }}>
                                Tahun Ajaran Aktif: <strong>{options.tahun_ajaran.nama} ({capitalize(options.tahun_ajaran.semester)})</strong>
                            </div>
                        )}

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="btn-save"
                                disabled={loading}
                            >
                                {loading
                                    ? "Menyimpan..."
                                    : "Simpan Jadwal"}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </div>
    );
}

