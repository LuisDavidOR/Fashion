import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Table } from 'react-bootstrap';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../database/supabaseconfig';

const ChatIA = ({ mostrar, onCerrar }) => {
  const [mensajes, setMensajes] = useState([]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const finChatRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const contextoBaseDatos = `
Sistema de gestión de salón de belleza.

Tablas disponibles:

Categorias
(
  id_categoria,
  nombre,
  descripcion,
  estado,
  url_imagen
)

Servicios
(
  id_servicio,
  nombre,
  descripcion,
  precio,
  duracion,
  estado,
  id_categoria,
  url_imagen
)

Clientes
(
  id_cliente,
  nombre,
  apellido,
  telefono,
  correo,
  estado,
  url_imagen
)

Empleados
(
  id_empleado,
  nombre,
  apellido,
  telefono,
  especialidad,
  correo,
  comision,
  estado,
  url_imagen
)

Citas
(
  id_cita,
  id_cliente,
  id_empleado,
  fecha,
  hora,
  estado_cita
)

Detalle_cita
(
  id_detalle_cita,
  id_cita,
  id_servicio,
  costo_empleado,
  costo_insumo,
  subtotal
)

Calificaciones
(
  id_calificacion,
  id_cliente,
  id_servicio,
  puntuacion,
  comentario,
  respuesta
)

Insumos
(
  id_insumo,
  nombre,
  descripcion,
  costo_producto,
  contenido_total,
  contenido_restante,
  unidad_medida,
  stock,
  estado,
  url_imagen
)

Servicio_Insumo
(
  id_servicio,
  id_insumo,
  cantidad_usada
)

Usuarios
(
  id_usuario,
  correo,
  rol,
  fecha_creacion,
  id_empleado,
  id_cliente,
  auth_id,
  estado
)

Relaciones:

- Servicios.id_categoria -> Categorias.id_categoria
- Citas.id_cliente -> Clientes.id_cliente
- Citas.id_empleado -> Empleados.id_empleado
- Detalle_cita.id_cita -> Citas.id_cita
- Detalle_cita.id_servicio -> Servicios.id_servicio
- Calificaciones.id_cliente -> Clientes.id_cliente
- Calificaciones.id_servicio -> Servicios.id_servicio
- Servicio_Insumo.id_servicio -> Servicios.id_servicio
- Servicio_Insumo.id_insumo -> Insumos.id_insumo
`;
  const enviarConsulta = async () => {
    if (!entrada.trim()) return;

    const mensajeUsuario = { tipo: 'usuario', contenido: entrada };
    setMensajes(prev => [...prev, mensajeUsuario]);
    const consultaActual = entrada;
    setEntrada('');
    setCargando(true);

    try {
      const modelo = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Eres un experto en PostgreSQL.
${contextoBaseDatos}

REGLAS OBLIGATORIAS:

- Usa únicamente tablas y columnas definidas en el contexto.
- No inventes tablas.
- No inventes columnas.
- Solo genera consultas SELECT.
- Nunca agregues ";" al final.
- Usa exactamente los nombres de tablas y columnas indicados.
- Todas las tablas DEBEN escribirse entre comillas dobles.

Ejemplos válidos:

SELECT * FROM "Servicios"

SELECT * FROM "Clientes"

SELECT * FROM "Detalle_cita"

SELECT * FROM "Citas"

SELECT * FROM "Empleados"

- Nunca uses:
  Servicios
  Clientes
  Citas
  Detalle_cita

- Siempre usa:
  "Servicios"
  "Clientes"
  "Citas"
  "Detalle_cita"

- Si el usuario pregunta por servicios más solicitados utiliza:
  "Servicios" y "Detalle_cita"

- Si pregunta por clientes utiliza:
  "Clientes" y "Citas"

- Si pregunta por empleados utiliza:
  "Empleados" y "Citas"

- Si pregunta por ingresos utiliza:
  "Detalle_cita"."subtotal"

- Si una tabla o columna no existe, devuelve un SELECT indicando el error.

Devuelve únicamente este JSON:

{
  "explicacion": "Explicación breve",
  "consulta_sql": "SELECT ...",
  "columnas": ["columna1","columna2"]
}

Consulta del usuario:
"${consultaActual}"
`;

const resultado = await modelo.generateContent(prompt);

let texto = resultado.response.text().trim();

console.log("===== RESPUESTA CRUDA =====");
console.log(texto);

// Limpiar markdown
texto = texto
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const match = texto.match(/\{[\s\S]*\}/);

if (!match) {
  throw new Error("No se pudo extraer JSON de la IA");
}

const respuestaIA = JSON.parse(match[0]);

let sqlLimpio = respuestaIA.consulta_sql?.trim() || "";

sqlLimpio = sqlLimpio.replace(/;+\s*$/, "");

console.log("===== RESPUESTA GEMINI =====");
console.log(respuestaIA);

console.log("===== SQL GENERADO =====");
console.log(sqlLimpio);

if (!sqlLimpio) {
  throw new Error("La IA no devolvió una consulta SQL");
}

if (!sqlLimpio.toUpperCase().startsWith("SELECT")) {
  throw new Error("Solo se permiten consultas SELECT");
}

const { data, error } = await supabase.rpc(
  "ejecutar_consulta_segura",
  {
    query_sql: sqlLimpio
  }
);

console.log("===== DATA =====");
console.log(data);

console.log("===== ERROR =====");
console.log(error);

if (error) {
  throw new Error(`Error en SQL: ${error.message}`);
}

const datosExtraidos = data
  ? data.map(item => item.datos)
  : [];

      const mensajeRespuesta = {
        tipo: 'ia',
        explicacion: respuestaIA.explicacion || "Consulta ejecutada correctamente",
        columnas: respuestaIA.columnas || (datosExtraidos.length > 0 ? Object.keys(datosExtraidos[0]) : []),
        datos: datosExtraidos
      };

      setMensajes(prev => [...prev, mensajeRespuesta]);

    } catch (error) {
      console.error("Error completo:", error);
      setMensajes(prev => [...prev, {
        tipo: 'ia',
        explicacion: "No entendí bien tu consulta. Por favor, reformúlala de forma clara.",
        error: true
      }]);
    }

    setCargando(false);
  };

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <Modal show={mostrar} onHide={onCerrar} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Consultas Inteligentes</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "68vh", overflowY: "auto" }}>
        <div className="d-flex flex-column h-100">
          <div className="flex-grow-1 overflow-auto mb-3 pe-2">
            {mensajes.length === 0 && (
              <div className="text-center text-muted mt-5">
                <h5>¿Qué información necesitas?</h5>
                <p className="mt-2">Ejemplos:</p>
                <ul className="text-start">
                  <li>Ventas totales de este mes</li>
                  <li>Los 5 servicios más vendidos</li>
                  <li>Clientes que más han comprado</li>
                  <li>Ventas por empleado</li>
                </ul>
              </div>
            )}

            {mensajes.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.tipo === 'usuario' ? 'text-end' : ''}`}>
                <div className={`d-inline-block p-3 rounded-3 ${msg.tipo === 'usuario' ? 'bg-primary text-white' : 'bg-light border'}`}
                  style={{ maxWidth: '90%' }}>
                  <strong>{msg.tipo === 'usuario' ? 'Tú:' : 'Asistente IA:'}</strong><br />
                  
                  {msg.tipo === 'usuario' ? (
                    <p className="mb-0">{msg.contenido}</p>
                  ) : (
                    msg.explicacion
                  )}

                  {msg.datos && msg.datos.length > 0 && (
                    <Table striped bordered hover size="sm" responsive className="mt-3">
                      <thead>
                        <tr>
                          {msg.columnas.map((col, i) => (
                            <th key={i}>{col.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.datos.map((fila, i) => (
                          <tr key={i}>
                            {msg.columnas.map((col, j) => (
                              <td key={j}>{fila[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" /> Procesando consulta...
              </div>
            )}
            <div ref={finChatRef} />
          </div>

          <Form onSubmit={(e) => { e.preventDefault(); enviarConsulta(); }}>
            <div className="d-flex gap-2">
              <Form.Control
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Escribe tu consulta en lenguaje natural..."
                disabled={cargando}
              />
              <Button variant="primary" onClick={enviarConsulta} disabled={cargando || !entrada.trim()}>
                Enviar
              </Button>
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatIA;