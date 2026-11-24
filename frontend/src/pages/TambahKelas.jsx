import { useState } from "react";
import { X, School } from "lucide-react";
import api from "../api/axios";
import CustomSelect from "../components/CustomSelect";
import "./TambahSiswa.css";

export default function TambahKelas({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        nama_kelas: "",
        tingkat: "10",
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
            await api.post("/kelas", form);
            onSuccess();
        } catch (err) {
            console.error("Gagal menambahkan kelas:", err);
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
                            <School size={21} />
                        </div>
                        <div>
                            <h2>Tambah Kelas</h2>
                            <p>Tambahkan ruang rombel / kelas baru</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="siswa-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tingkat / Jenjang</label>
                        <CustomSelect
                            name="tingkat"
                            value={form.tingkat}
                            onChange={handleChange}
                            options={[
                                { label: "Kelas 10 (Sepuluh)", value: "10" },
                                { label: "Kelas 11 (Sebelas)", value: "11" },
                                { label: "Kelas 12 (Dua Belas)", value: "12" },
                            ]}
                            placeholder="Pilih tingkat"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nama Rombel / Kelas</label>
                        <input
                            type="text"
                            name="nama_kelas"
                            value={form.nama_kelas}
                            onChange={handleChange}
                            placeholder="Contoh: 10 PPLG 1 atau 11 TJKT 2"
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Batal
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Kelas"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

