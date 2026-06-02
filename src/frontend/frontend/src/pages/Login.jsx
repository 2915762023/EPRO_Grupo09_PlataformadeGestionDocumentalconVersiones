import { useState, useEffect } from "react";
import axios from "axios";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      window.location.href = "/dashboard";
    }
  }, []);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/login", {
        correo,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Credenciales incorrectas ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bienvenido 👋</h2>

        <form onSubmit={iniciarSesion} style={styles.form}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>


        <p style={styles.footer}>Sistema de Gestión Documental</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // 🔥 esto centra verticalmente
background: "radial-gradient(circle at 20% 20%, rgba(79,70,229,0.3), transparent 40%), radial-gradient(circle at 80% 80%, rgba(30,58,138,0.3), transparent 40%), #0f172a",
    fontFamily: "Arial, sans-serif",
  },
 card: {
    background: "#111827",
    padding: "35px",
    borderRadius: "12px",
    width: "360px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    textAlign: "center",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
  },
 title: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    background: "rgba(255,255,255,0.9)",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
  footer: {
  marginTop: "20px",
  fontSize: "12px",
  color: "rgba(255,255,255,0.6)",
  letterSpacing: "0.5px",
}
};

export default Login;