"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertTriangle, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Reset password states
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      const token = data.accessToken;
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      if (decodedPayload.role !== "admin") {
        throw new Error("Access denied. You are not authorized as an admin.");
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(decodedPayload));
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setSuccess("A verification code has been sent to your email.");
      setView("reset");
    } catch (err) {
      setError(err.message || "Could not request OTP. Ensure email is correct.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Your password has been successfully reset. You can now log in.");
      setOtp("");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#F3F4F6", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ color: "#6366F1" }}>🏍️</span> AutoPulse
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
            {view === "login" && "Admin Portal Login"}
            {view === "forgot" && "Reset Password Request"}
            {view === "reset" && "Verify Code & Set Password"}
          </p>
        </div>

        {error && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            backgroundColor: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgba(239, 68, 68, 0.2)", 
            color: "#EF4444", 
            padding: "12px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            fontSize: "14px" 
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            backgroundColor: "rgba(16, 185, 129, 0.1)", 
            border: "1px solid rgba(16, 185, 129, 0.2)", 
            color: "#10B981", 
            padding: "12px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            fontSize: "14px" 
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* VIEW 1: LOGIN FORM */}
        {view === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: "48px" }}
                  placeholder="admin@autopulse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("forgot");
                  }}
                  style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "8px" }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  style={{ paddingLeft: "48px", paddingRight: "48px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "16px", top: "14px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In to Console"}
            </button>
          </form>
        )}

        {/* VIEW 2: FORGOT PASSWORD */}
        {view === "forgot" && (
          <form onSubmit={handleSendOTP}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
              Enter your registered administrator email address. We will verify your account and email you a 6-digit OTP code to reset your password.
            </p>

            <div className="form-group">
              <label className="form-label">Admin Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: "48px" }}
                  placeholder="admin@autopulse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Send Verification OTP"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", height: "48px", marginTop: "12px" }}
              onClick={() => {
                setError("");
                setView("login");
              }}
              disabled={loading}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* VIEW 3: RESET PASSWORD */}
        {view === "reset" && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
              We've emailed a verification OTP to <strong>{email}</strong>. Enter the OTP code below along with your new password.
            </p>

            <div className="form-group">
              <label className="form-label">Verification OTP Code</label>
              <div style={{ position: "relative" }}>
                <KeyRound size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="form-input"
                  style={{ paddingLeft: "48px", letterSpacing: "4px", fontSize: "16px", fontWeight: "700" }}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  className="form-input"
                  style={{ paddingLeft: "48px", paddingRight: "48px" }}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: "16px", top: "14px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "16px", top: "14px", color: "#9CA3AF" }} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  className="form-input"
                  style={{ paddingLeft: "48px" }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password & Login"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", height: "48px", marginTop: "12px" }}
              onClick={() => {
                setError("");
                setView("forgot");
              }}
              disabled={loading}
            >
              Back to Request OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
