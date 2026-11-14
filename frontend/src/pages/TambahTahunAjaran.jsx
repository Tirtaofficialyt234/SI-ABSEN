import { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import api from "../api/axios";
import CustomSelect from "../components/CustomSelect";
import "./TambahSiswa.css";

export default function TambahTahunAjaran({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        nama: "",
        semester: "ganjil",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            await api.post("/tahun-ajaran", form);
            onSuccess();
        } catch (err) {
            console.error("Gagal menambahkan tahun ajaran:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Terjadi kesalahan. Silakan coba lagi.");
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
                            <CalendarDays size={21} />
                        </div>
                        <div>
                            <h2>Tambah Tahun Ajaran</h2>
                            <p>Buat periode tahun ajaran baru</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="siswa-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama / Periode Tahun</label>
                        <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Contoh: 2026/2027"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Semester</label>
                        <CustomSelect
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                            options={[
                                { label: "Semester Ganjil", value: "ganjil" },
                                { label: "Semester Genap", value: "genap" },
                            ]}
                            placeholder="Pilih semester"
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Batal
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

