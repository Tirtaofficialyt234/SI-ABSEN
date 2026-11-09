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

                    <h2 className="login-title">
                        Login
                    </h2>

                    <p className="login-subtitle">
                        Sign your account.
                    </p>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        <p className="Email-field">
                            Email:
                        </p>

                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <p className="Email-field">
                            Password:
                        </p>

                        <div className="input-group">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                className="toggle-btn"
                                type="button"
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