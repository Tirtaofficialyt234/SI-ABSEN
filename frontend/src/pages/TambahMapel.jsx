import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import api from "../api/axios";
import "./TambahSiswa.css";

export default function TambahMapel({ onClose, onSuccess }) {
    const [namaMapel, setNamaMapel] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/mapel", {
                nama_mapel: namaMapel,
            });
            onSuccess();
        } catch (err) {
            console.error("Gagal menambahkan mapel:", err);
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
                            <BookOpen size={21} />
                        </div>
                        <div>
                            <h2>Tambah Mata Pelajaran</h2>
                            <p>Tambahkan mata pelajaran baru ke kurikulum</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="siswa-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama Mata Pelajaran</label>
                        <input
                            type="text"
                            value={namaMapel}
                            onChange={(e) => setNamaMapel(e.target.value)}
                            placeholder="Contoh: Pemrograman Berorientasi Objek"
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

