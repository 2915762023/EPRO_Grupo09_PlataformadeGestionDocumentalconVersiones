import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../components/Toast";
function Dashboard() {

  // ================= ESTADOS =================
  const [documentos, setDocumentos] = useState([]);
  const [versiones, setVersiones] = useState([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [versionSeleccionada, setVersionSeleccionada] = useState(null);

  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  const [archivo, setArchivo] = useState(null);
  const [documentoUpload, setDocumentoUpload] = useState("");

  const [loadingDocumento, setLoadingDocumento] = useState(false);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);

  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [versionVigente, setVersionVigente] = useState(null);

  const [modalDocumento, setModalDocumento] = useState(false);
  const [modalVersion, setModalVersion] = useState(false);

  const [mostrarDocumentos, setMostrarDocumentos] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

const [busqueda, setBusqueda] = useState("");

  // ===============================
  // FORM DOCUMENTO NUEVO
  // ===============================

  const documentosFiltrados = documentos.filter((doc) =>
  (doc.titulo?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
  (doc.descripcion?.toLowerCase() || "").includes(busqueda.toLowerCase())
);


  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // ================= CARGAR DOCUMENTOS =================
  const cargarDocumentos = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:3000/documentos", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDocumentos(res.data);

    } catch (error) {
      console.error("Error cargando documentos ❌", error);
    }
  };

  useEffect(() => {
    cargarDocumentos();

    const userData = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(userData);

  }, []);

  // ================= CARGAR VERSIONES =================
  const cargarVersiones = async (id_documento) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/documento/${id_documento}/versiones`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDocumentoSeleccionado(id_documento);
      setVersiones(res.data.versiones || []);
      setVersionVigente(res.data.version_vigente || null);

    } catch (error) {
      console.error("Error cargando versiones ❌", error);
    }
  };


  // ================= APROBAR VERSION =================
  const aprobarVersion = async (id_version) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/cambiar-estado/${id_version}`,
        { estado: "aprobado" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMensaje("✅ Versión aprobada correctamente"); // 👈 AQUÍ
      cargarVersiones(documentoSeleccionado);

    } catch (error) {
      console.error("Error aprobando ❌", error);
    }
  };

  // ================= RECHAZAR VERSION =================
  const rechazarVersion = async (id_version) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/cambiar-estado/${id_version}`,
        { estado: "rechazado" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMensaje("❌ Versión rechazada"); // 👈 AQUÍ
      cargarVersiones(documentoSeleccionado);

    } catch (error) {
      console.error("Error rechazando ❌", error);
    }
  };

  // ================= ABRIR MODAL + COMENTARIOS =================
  const verDetalle = async (version) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/comentarios/${version.id_version}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVersionSeleccionada(version);
      setComentarios(res.data.comentarios || []);
      setModalAbierto(true);

    } catch (error) {
      console.error("Error cargando comentarios ❌", error);
    }
  };

  // ================= ENVIAR COMENTARIO =================
  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      setMensaje("⚠️ No puedes enviar un comentario vacío");
      setTipoMensaje("error");
      return;
    };

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/comentarios",
        {
          id_version: versionSeleccionada.id_version,
          comentario: nuevoComentario
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNuevoComentario("");
      verDetalle(versionSeleccionada); // recarga comentarios

    } catch (error) {
      console.error("Error agregando comentario ❌", error);
    }
  };

  // ===============================
  // SUBIR NUEVA VERSION
  // ===============================
  const subirVersion = async () => {

    if (!archivo || !documentoUpload) {
      setMensaje("⚠️ Selecciona documento y archivo");
      return;
    }

    try {

      setLoadingVersion(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("id_documento", documentoUpload);
      formData.append("archivo", archivo);

      await axios.post(
        "http://localhost:3000/subir-version",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMensaje("✅ Nueva versión subida");

      await cargarVersiones(documentoUpload);
      await cargarDocumentos();

      setArchivo(null);

    } catch (error) {
      console.error(error);
      setMensaje("❌ Error subiendo versión");
    } finally {
      setLoadingVersion(false);
    }
  };


  // subir documento nuevo
  const subirDocumento = async () => {

    if (!archivo || !titulo) {
      setMensaje("⚠️ Completa los datos");
      return;
    }

    try {

      setLoadingDocumento(true);


      // SOLO PARA PRUEBA
      await new Promise(resolve => setTimeout(resolve, 700));
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);
      formData.append("archivo", archivo);

      await axios.post(
        "http://localhost:3000/subir-archivo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMensaje("✅ Documento subido correctamente");

      await cargarDocumentos();

      setTitulo("");
      setDescripcion("");
      setArchivo(null);

    } catch (error) {
      console.error(error);
      setMensaje("❌ Error subiendo documento");
    } finally {
      setLoadingDocumento(false);
    }
  };


  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ================= UI =================
  //funcion visual del estado
  const renderEstado = (version) => {

    if (version.estado === "aprobado") {
      return (
        <span style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "5px 10px",
          borderRadius: "8px",
          fontWeight: "bold"
        }}>
          ✅ Aprobado
        </span>
      );
    }

    if (version.estado === "rechazado") {
      return (
        <span style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "5px 10px",
          borderRadius: "8px",
          fontWeight: "bold"
        }}>
          ❌ Rechazado
        </span>
      );
    }

    return (
      <span style={{
        backgroundColor: "#fff3cd",
        color: "#856404",
        padding: "5px 10px",
        borderRadius: "8px",
        fontWeight: "bold"
      }}>
        🟡 Pendiente
      </span>
    );
  };

  //muestra fecha bonita

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleString();
  };

  const puedeAprobar = () => {
    return usuario?.rol === "admin" || usuario?.rol === "jefe";
  };

  // VALIDACIONES UI

  const puedeSubirDocumento =
    titulo.trim() !== "" && archivo !== null;
  documentoUpload.trim() == "" && archivo !== null;

  const puedeSubirVersion =
    documentoUpload !== "" && archivo !== null;
  // AQUÍ TERMINAN LAS VARIABLES

  return (

    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}></h2>

        <div
          style={styles.sidebarItem}
          onClick={() => setMostrarDocumentos(!mostrarDocumentos)}
        >
          📄 {mostrarDocumentos ? "Ocultar documentos" : "Ver documentos"}
        </div>

        <div
          style={styles.sidebarItem}
          onClick={() => setModalDocumento(true)}
        >
          ⬆️ Subir documento
        </div>

        <div
          style={styles.sidebarItem}
          onClick={() => setModalVersion(true)}
        >
          🔄 Subir versión
        </div>

        {usuario?.rol === "admin" && (
          <div
            style={styles.sidebarItem}
            onClick={() => window.location.href = "/crear-usuario"}
          >
            👤 Crear usuario
          </div>
        )}
      </div>


      <div style={styles.mainContent}>
        <div style={styles.header}>

          {/* IZQUIERDA */}
          <div style={styles.headerLeft}>
            <h1 style={styles.titulo}>Plataforma de gestión documental con
              versiones</h1>
            <p style={styles.subtitulo}>Gestión inteligente de documentos</p>
          </div>

          {/* DERECHA */}
          <div
            style={styles.usuarioContainer}
            onMouseEnter={() => setMenuUsuarioAbierto(true)}
            onMouseLeave={() => {
              setTimeout(() => {
                setMenuUsuarioAbierto(false);
              }, 300);
            }}
          >

            <div style={styles.usuarioBox}>
              <div style={styles.avatar}>
                {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <div style={{ fontWeight: "500" }}>
                  {usuario?.nombre || "Usuario"}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#ddd"
                  }}
                >
                  {usuario?.rol || "Sin rol"}
                </div>
              </div>
            </div>


            {menuUsuarioAbierto && (
              <div style={styles.menuUsuario}>
                <button
                  style={styles.btnLogout}
                  onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                  onClick={logout}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}

          </div>
        </div>
        
        <Toast
          mensaje={mensaje}
          tipo={tipoMensaje}
          onClose={() => setMensaje("")}
        />
        {/*}
        
        {usuario?.rol === "admin" && (
          <div style={{ marginBottom: "20px" }}>
            <h2>👤 Gestión de usuarios</h2>

            <button
              onClick={() => window.location.href = "/crear-usuario"}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                minWidth: "205px"
              }}
            >
              ➕ Crear nuevo usuario
            </button>
          </div>
        )}
        <Toast
          mensaje={mensaje}
          tipo={tipoMensaje}
          onClose={() => setMensaje("")}
        />
        <hr />
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setModalDocumento(true)}
            style={{ ...styles.botonAccion, marginRight: "10px" }}
          >
            📄 Subir Documento
          </button>
          <hr />
          <button
            onClick={() => setModalVersion(true)}
            style={{ ...styles.botonAccion, backgroundColor: "#2196F3" }}

          >
            ⬆️ Subir Versión
          </button>
        </div>

        <button
          onClick={() => setMostrarDocumentos(!mostrarDocumentos)}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          {mostrarDocumentos ? "🙈 Ocultar documentos" : "📄 Ver documentos"}
        </button>*/}
        {/* ================= DOCUMENTOS ================= */}
        {mostrarDocumentos && !documentoSeleccionado && (

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📄 Documentos</h2>
<div style={styles.searchContainer}>
  <input
    type="text"
    placeholder="🔍 Buscar documento..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    style={styles.searchInput}
  />
</div>
            <table style={styles.table}>
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr >
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>

              <tbody>
                {documentosFiltrados.map((doc) => (
                  <tr key={doc.id_documento}
                    style={{
                      transition: "0.2s"
                    }}

                    onMouseEnter={(e) =>
                      e.currentTarget.style.backgroundColor = "#edf1f5"
                    }

                    onMouseLeave={(e) =>
                      e.currentTarget.style.backgroundColor = "transparent"
                    }>
                    <td style={styles.td}>{doc.id_documento}</td>
                    <td style={styles.td}>{doc.titulo}</td>
                    <td style={styles.td}>{doc.descripcion}</td>
                    <td style={styles.td}>
                      <button onClick={() => cargarVersiones(doc.id_documento)}>
                        Ver versiones
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= DOCUMENTO SELECCIONADO + VERSIONES ================= */}
        {documentoSeleccionado && (
          <div style={styles.card}>



            {/* DOCUMENTO SELECCIONADO */}
            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  <h2 style={styles.sectionTitle}>
    📄 Documento seleccionado
  </h2>

  <button
    onClick={() => {
      setDocumentoSeleccionado(null);
      setVersiones([]);
    }}
    style={{
      ...styles.tableButton,
      backgroundColor: "#2563eb",
      color: "white"
    }}
  >
    ← Volver a documentos
  </button>
</div>

            <table style={styles.table}>
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Descripción</th>

                </tr>
              </thead>

              <tbody>
                {documentos
                  .filter((doc) => doc.id_documento === documentoSeleccionado)
                  .map((doc) => (
                    <tr
                      key={doc.id_documento}
                      style={{
                        transition: "0.2s"
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = "#edf1f5"
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = "transparent"
                      }
                    >
                      <td style={styles.td}>
                        {doc.id_documento}
                      </td>

                      <td style={styles.td}>
                        {doc.titulo}
                      </td>

                      <td style={styles.td}>
                        {doc.descripcion}
                      </td>


                    </tr>
                  ))}
              </tbody>
            </table>

            <hr style={{ marginBottom: "20px" }} />

            {/* VERSION VIGENTE */}

            {versionVigente && (
              <div style={{
                background: "#e8f5e9",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid #a5d6a7",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}>
                ⭐ <b>Versión vigente:</b> v{versionVigente.numero_version}
                <br />
                👤 Revisado por: {versionVigente.aprobado_por || "—"}
                <br />
                🕒 Fecha:
                {" "}
                {versionVigente.fecha_revision
                  ? formatearFecha(versionVigente.fecha_revision)
                  : "—"}
              </div>
            )}

            <h2 style={styles.sectionTitle}>🧾 Versiones</h2>
            <table style={styles.table}>
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={styles.th}>Versión</th>
                  <th style={styles.th}>Archivo</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Revisado por</th>
                  <th style={styles.th}>Fecha revisión</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {versiones.map((v) => (
                  <tr
                    key={v.id_version}
                    style={{
                      backgroundColor:
                        versionVigente &&
                          v.numero_version === versionVigente.numero_version
                          ? "#fff9c4"
                          : "transparent",
                      fontWeight:
                        versionVigente &&
                          v.numero_version === versionVigente.numero_version
                          ? "bold"
                          : "normal"
                    }}
                    style={{
                      transition: "0.2s"
                    }}

                    onMouseEnter={(e) =>
                      e.currentTarget.style.backgroundColor = "#edf1f5"
                    }

                    onMouseLeave={(e) =>
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  >
                    {/* VERSION */}
                    <td style={styles.td}>
                      v{v.numero_version}

                      {versionVigente &&
                        v.numero_version === versionVigente.numero_version && (
                          <div
                            style={{
                              marginTop: "4px",
                              backgroundColor: "#d4edda",
                              color: "#155724",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              display: "inline-block",
                              fontWeight: "bold"
                            }}
                          >
                            🟢 Versión Oficial
                          </div>
                        )}
                    </td>

                    {/* ARCHIVO */}
                    <td style={styles.td}>
                      <a
                        href={`http://localhost:3000/uploads/${v.archivo_ruta}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📄 Abrir archivo
                      </a>
                    </td>

                    {/* ESTADO VISUAL */}
                    <td style={styles.td}>{renderEstado(v)}</td>

                    {/* REVISADO POR */}
                    <td style={styles.td}>
                      {v.aprobado_por || "—"}
                    </td>

                    {/* FECHA REVISION */}
                    <td style={styles.td}>
                      {v.fecha_revision
                        ? formatearFecha(v.fecha_revision)
                        : "—"}
                    </td>

                    {/* ACCIONES */}
                    <td style={styles.td}>

                      {/* siempre visible */}
                      <button
                        onClick={() => verDetalle(v)}
                        style={{
                          ...styles.tableButton,
                          backgroundColor: "#2563eb",
                          color: "white"
                        }}
                      >
                        👁 Comentarios
                      </button>

                      {/* SOLO si está pendiente */}
                      {v.estado === "pendiente" && puedeAprobar() && (
                        <>
                          <button
                            onClick={() => aprobarVersion(v.id_version)}
                            style={{
                              marginLeft: "5px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              padding: "5px 8px",
                              borderRadius: "5px",
                              cursor: "pointer"
                            }}
                          >
                            ✔ Aprobar
                          </button>

                          <button
                            onClick={() => rechazarVersion(v.id_version)}
                            style={{
                              marginLeft: "5px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "5px 8px",
                              borderRadius: "5px",
                              cursor: "pointer"
                            }}
                          >
                            ❌ Rechazar
                          </button>
                        </>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* ================= MODAL COMENTARIOS================= */}
        {modalAbierto && (
          <div style={styles.overlay}>
            <div style={styles.modal}>

              <h2>Detalle versión {versionSeleccionada.numero_version}</h2>
              <p><b>Estado:</b> {versionSeleccionada.estado}</p>

              <hr />

              <h3>💬 Comentarios</h3>

              {comentarios.length === 0 ? (
                <p>No hay comentarios</p>
              ) : (
                comentarios.map((c) => (
                  <div key={c.id_comentario} style={styles.comentario}>
                    <strong>{c.nombre_usuario}</strong>
                    <p>{c.comentario}</p>
                  </div>
                ))
              )}

              <textarea
                placeholder="Escribir comentario..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                rows="3"
                style={{ width: "100%" }}
              />

              <br /><br />

              <button onClick={enviarComentario}>
                Agregar comentario
              </button>

              <br /><br />

              <button onClick={() => setModalAbierto(false)}>
                Cerrar
              </button>

            </div>
          </div>
        )}
        {/* ================= MODAL  SUBIR DOCUMENTO================= */}
        {modalDocumento && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2>📄 Subir Documento Nuevo</h2>

              <input
                type="text"
                placeholder="Título del documento"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              <textarea
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
              />

              <br /><br />

              <button
                onClick={subirDocumento}
                disabled={!puedeSubirDocumento || loadingDocumento}
              >
                {loadingDocumento ? "Subiendo..." : "Subir Documento"}
              </button>

              <br /><br />

              <button onClick={() => setModalDocumento(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}


      </div>
      {/* ================= MODAL  SUBIR VERSION================= */}
      {modalVersion && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⬆️ Subir Nueva Versión</h2>

            <select
              value={documentoUpload}
              onChange={(e) => setDocumentoUpload(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            >
              <option value="">Seleccionar documento</option>
              {documentos.map((doc) => (
                <option key={doc.id_documento} value={doc.id_documento}>
                  {doc.titulo}
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files[0])}
            />

            <br /><br />

            <button
              onClick={subirVersion}
              disabled={!puedeSubirVersion}
            >
              Subir versión
            </button>

            <br /><br />

            <button onClick={() => setModalVersion(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= ESTILOS =================
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa"
  },

  sidebar: {
    width: "250px",
    background: "#111827",
    color: "white",
    padding: "20px 15px",
    margin: 0
  },

  sidebarTitle: {
    marginBottom: "30px",
    fontSize: "22px"
  },

  sidebarItem: {
    padding: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    backgroundColor: "#1f2937"
  },

  mainContent: {
    flex: 1,
    padding: 1,
    margin: 0
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  modal: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    width: "500px",
    maxWidth: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
  },
  titulo: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
    padding: 0,
    lineHeight: "1.1"
  },
  subtitulo: {
    marginTop: "5px",
    marginBottom: 0,
    fontSize: "15px",
    color: "#d1d5db"
  },
  usuarioBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px",
    color: "white"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "18px 22px",
    background: "linear-gradient(135deg, #111827, #0d3e41)",
    borderRadius: "0px",
    color: "white",
    marginBottom: "20px",
    marginTop: "0"
  },
  headerLeft: {
    flex: 1
  },
  usuarioContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    position: "relative",
    marginLeft: "20px"
  },
  menuUsuario: {
    position: "absolute",
    top: "48px",
    right: 0,
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    zIndex: 9999,
    minWidth: "140px"
  },
  usuarioContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  btnLogout: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    background: "white",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px"
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "20px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px"
  },

  th: {
    backgroundColor: "#e6e8eb",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    fontSize: "14px"
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px"
  },
  sectionTitle: {
    margin: 0,
    marginBottom: "15px",
    fontSize: "22px",
    color: "#111827"
  },
  tableButton: {
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginRight: "5px"
  },
  trHover: {
    transition: "0.2s",
  },
};

export default Dashboard;

/////

