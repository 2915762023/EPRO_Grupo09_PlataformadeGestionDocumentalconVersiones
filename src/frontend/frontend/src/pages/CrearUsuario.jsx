import { useState, useEffect } from "react";
import axios from "axios";

function CrearUsuario() {

  // ================= ESTADOS =================
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [idRol, setIdRol] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");

  const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || usuario.rol !== "admin") {
    alert("No tienes permisos para acceder a esta página");
    window.location.href = "/dashboard";
  } else {
    setAutorizado(true);
  }
}, []);
if (!autorizado) {
  return null;
}
  // ================= CREAR USUARIO =================
  const crearUsuario = async () => {

    if (!nombre || !correo || !password || !idRol) {
      setMensaje("⚠️ Completa todos los campos");
      setTipoMensaje("error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/usuarios",
        {
          nombre,
          correo,
          password,
          id_rol: idRol   // 👈 CLAVE
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMensaje("✅ Usuario creado correctamente");
      setTipoMensaje("success");

      // limpiar formulario
      setNombre("");
      setCorreo("");
      setPassword("");
      setIdRol("");

    } catch (error) {
      console.error(error);
      setMensaje("❌ Error el correo ya está registrado");
      setTipoMensaje("error");
    }
  };

return (
  <div style={styles.pageContainer}>

    {/* HEADER */}
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>👤 Crear Usuario</h1>
        <p style={styles.subtitle}>
          Registrar nuevos usuarios dentro del sistema documental
        </p>
      </div>

      <button
        onClick={() => window.location.href = "/dashboard"}
        style={styles.backButton}
      >
        ⬅ Volver
      </button>
    </div>

    {/* MENSAJE */}
    {mensaje && (
      <div
        style={{
          ...styles.alert,
          backgroundColor:
            tipoMensaje === "success" ? "#e8f5e9" : "#fdecea",
          color:
            tipoMensaje === "success" ? "#2e7d32" : "#c62828"
        }}
      >
        {mensaje}
      </div>
    )}

    {/* CARD FORM */}
    <div style={styles.formWrapper}>
    <div style={styles.formCard}>
      <h2 style={styles.cardTitle}>Datos del usuario</h2>

      <input
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={styles.input}
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <select
        value={idRol}
        onChange={(e) => setIdRol(e.target.value)}
        style={styles.input}
      >
        <option value="">Seleccionar rol</option>
        <option value="1">Admin</option>
        <option value="2">Jefe</option>
        <option value="3">Empleado</option>
      </select>

      <button
        onClick={crearUsuario}
        style={styles.createButton}
      >
        ➕ Crear Usuario
      </button>
    </div>
  </div>
  </div>

  
);
}
const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #111827, #1f2937)",
    padding: "0px"
  },

  header: {
    background: "linear-gradient(135deg, #111827, #0d3e41)",
    color: "white",
    padding: "20px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px"
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700"
  },

  subtitle: {
    marginTop: "5px",
    fontSize: "14px",
    color: "#d1d5db"
  },

  backButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },

  alert: {
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "500"
  },

 formCard: {
  width: "420px",
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  backgroundColor: "rgba(255,255,255,0.95)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"   // centra los elementos internos
},

  cardTitle: {
    marginBottom: "20px",
    color: "#111827"
  },

 input: {
  width: "90%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  boxSizing: "border-box"
},

  formWrapper: {
  display: "flex",
  justifyContent: "center",
  marginTop: "30px"
},

createButton: {
  width: "90%",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
},
}

export default CrearUsuario;