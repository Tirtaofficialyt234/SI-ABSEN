import { useState } from "react";
import { X, GraduationCap } from "lucide-react";
import api from "../api/axios";
import "./TambahSiswa.css";

export default function TambahGuru({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        nama: "",
        nip: "",
        email: "",
        password: "",
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
            await api.post("/guru", form);
            onSuccess();
        } catch (err) {
            console.error("Gagal menambahkan guru:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                const first = Object.values(err.response.data.errors)[0];
                setError(Array.isArray(first) ? first[0] : first);
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
                            <GraduationCap size={21} />
                        </div>
                        <div>
                            <h2>Tambah Guru</h2>
                            <p>Daftarkan guru baru beserta akun login</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="siswa-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama Lengkap & Gelar</label>
                        <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Contoh: Budi Santoso, S.Pd"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>NIP (Nomor Induk Pegawai)</label>
                        <input
                            type="text"
                            name="nip"
                            value={form.nip}
                            onChange={handleChange}
                            placeholder="Contoh: 198507122010011002"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Login</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Contoh: budi@sekolah.sch.id"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password Akun</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Minimal 6 karakter"
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Batal
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Guru"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

