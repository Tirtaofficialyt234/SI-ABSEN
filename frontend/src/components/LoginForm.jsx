import { useState } from "react";
import { login } from "../api/auth";
import "./LoginForm.css";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            const data = await login(form);

            const role = data.role?.toLowerCase();
            if (!data.token || !["admin", "guru", "siswa"].includes(role)) {
                localStorage.removeItem("token");
                setError("Role akun tidak dikenali.");
                return;
            }

            localStorage.setItem("token", data.token);

            navigate(role === "admin" ? "/dashboard" : "/absen-page");

        } catch (err) {
            if (err.response?.status === 401) {
                setError("Email atau password salah.");
            } else if (err.response?.status === 422) {
                setError("Data login tidak valid.");
            } else {
                setError("There is an error, try again");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-wrapper">
                <div className="login-card">

                    <div className="login-logo-icon">
                        <GraduationCap size={32} color="#fff" />
                    </div>

                    <h2 className="login-title">LOGIN</h2>

                    <p className="login-subtitle">
                        Silakan masuk untuk melanjutkan.
                    </p>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        <div className="input-group">
                            <label className="login-label" htmlFor="login-email">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="nama@sekolah.sch.id"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="login-label" htmlFor="login-password">
                                Kata sandi
                            </label>
                            <input
                                id="login-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Masukkan kata sandi"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                className="toggle-btn"
                                type="button"
                                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Memproses..."
                                : "Masuk"}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}