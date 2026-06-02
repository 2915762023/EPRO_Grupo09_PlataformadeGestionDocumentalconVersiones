import { useEffect } from "react";

function Toast({ mensaje, tipo, onClose }) {

  useEffect(() => {
    if (!mensaje) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000); // desaparece en 3s

    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const colores = {
    success: {
      background: "#d4edda",
      color: "#155724"
    },
    error: {
      background: "#f8d7da",
      color: "#721c24"
    },
    warning: {
      background: "#fff3cd",
      color: "#856404"
    }
  };

  const estilo = colores[tipo] || colores.success;

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 20px",
      borderRadius: "10px",
      fontWeight: "bold",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: 9999,
      transition: "all 0.3s ease",
      ...estilo
    }}>
      {mensaje}
    </div>
  );
}

export default Toast;