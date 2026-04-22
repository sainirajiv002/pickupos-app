import { useState } from "react";
import { LogIn, Eye, EyeOff, Shield, Truck } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo users for testing
    const demoUsers = {
      "admin@shadowfax.in": { password: "admin123", role: "admin", name: "Admin User" },
      "supervisor@shadowfax.in": { password: "super123", role: "supervisor", name: "Supervisor" },
      "rider@shadowfax.in": { password: "rider123", role: "rider", name: "Rider" }
    };

    // Simple demo authentication
    setTimeout(() => {
      const user = demoUsers[email.toLowerCase()];
      if (user && user.password === password) {
        onLogin({
          email: email,
          role: user.role,
          name: user.name
        });
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "100%",
        maxWidth: "420px",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0C111D, #1E3A5F)",
          padding: "32px 28px",
          textAlign: "center"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "#F59E0B",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 20px rgba(245,158,11,0.4)"
          }}>
            <Truck size={32} color="#fff" />
          </div>
          <h1 style={{
            color: "#fff",
            fontSize: "26px",
            fontWeight: "800",
            marginBottom: "6px",
            letterSpacing: "-0.02em"
          }}>
            PickupOS
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "13px",
            fontWeight: "500",
            letterSpacing: "0.5px"
          }}>
            Shadowfax NCR Pickup Operations
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "32px 28px" }}>
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#344054",
                marginBottom: "8px",
                letterSpacing: "0.3px",
                textTransform: "uppercase"
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #E4E7EC",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#344054",
                marginBottom: "8px",
                letterSpacing: "0.3px",
                textTransform: "uppercase"
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "48px",
                    border: "2px solid #E4E7EC",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#667085",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: "#FEE4E2",
                border: "1px solid #FDA29B",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "20px",
                color: "#B42318",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#98A2B3" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              {loading ? "Signing in..." : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "#F9FAFB",
            borderRadius: "10px",
            border: "1px solid #E4E7EC"
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#667085",
              marginBottom: "10px",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              Demo Login Credentials:
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#344054" }}>
              <div><strong>Admin:</strong> admin@shadowfax.in / admin123</div>
              <div><strong>Supervisor:</strong> supervisor@shadowfax.in / super123</div>
              <div><strong>Rider:</strong> rider@shadowfax.in / rider123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 28px",
          background: "#F9FAFB",
          borderTop: "1px solid #E4E7EC",
          textAlign: "center"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#667085"
          }}>
            <Shield size={14} />
            Secure Login • Shadowfax NCR Operations
          </div>
        </div>
      </div>
    </div>
  );
}
