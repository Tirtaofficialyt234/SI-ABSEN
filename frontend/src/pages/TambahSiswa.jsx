import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { createSiswa } from "../api/siswa";
import api from "../api/axios";
import CustomSelect from "../components/CustomSelect";
import "./TambahSiswa.css";

export default function TambahSiswa({
    onClose,
    onSuccess,
}) {
    const [form, setForm] = useState({
        nama: "",
        nis: "",
        kelas_id: "",
    });

    const [kelasList, setKelasList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/kelas")
            .then((res) => setKelasList(res.data))
            .catch((err) => console.error("Gagal load kelas:", err));
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
            const data = await createSiswa({
                nama: form.nama,
                nis: form.nis,
                kelas_id: Number(form.kelas_id),
            });

            console.log(
                "Siswa berhasil dibuat:",
                data
            );

            onSuccess();

        } catch (err) {
            console.error(
                "Gagal menambahkan siswa:",
                err
            );

            if (err.response?.status === 422) {
                const errors =
                    err.response.data.errors;

                if (errors?.nis) {
                    setError(
                        "NIS sudah digunakan."
                    );
                } else {
                    setError(
                        "Data siswa tidak valid."
                    );
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
                            <UserPlus size={21} />
                        </div>

                        <div>
                            <h2>
                                Tambah Siswa
                            </h2>

                            <p>
                                Tambahkan data siswa baru
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

                <form
                    className="siswa-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Nama Siswa
                        </label>

                        <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Masukkan nama siswa"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            NIS
                        </label>

                        <input
                            type="text"
                            name="nis"
                            value={form.nis}
                            onChange={handleChange}
                            placeholder="Masukkan NIS siswa"
                            required
                        />

                    </div>

                    <div className="form-group">
                        <label>Kelas</label>
                        <CustomSelect
                            name="kelas_id"
                            value={form.kelas_id}
                            onChange={handleChange}
                            options={kelasList.map((k) => ({
                                label: k.nama_kelas,
                                value: k.id,
                            }))}
                            placeholder="Pilih kelas"
                            required
                        />
                    </div>

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
                                : "Simpan Siswa"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}