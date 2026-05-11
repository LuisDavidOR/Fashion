import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCitas = ({ citas }) => {
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const obtenerClaseEstado = (estado) => {
    if (estado === "pendiente") return "estado-pendiente";
    if (estado === "aceptado") return "estado-aceptado";
    if (estado === "completada") return "estado-completada";
    if (estado === "cancelada") return "estado-cancelada";
    return "estado-default";
  };

  const obtenerTextoEstado = (estado) => {
    if (!estado) return "Sin estado";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const calcularTotal = (detalles) => {
    return (
      detalles?.reduce((total, item) => total + Number(item.subtotal || 0), 0) ||
      0
    );
  };

  const calcularDuracion = (detalles) => {
    return (
      detalles?.reduce(
        (total, item) => total + Number(item.Servicios?.duracion || 0),
        0
      ) || 0
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const [year, month, day] = fecha.split("-");

    const fechaLocal = new Date(year, month - 1, day);

    return fechaLocal.toLocaleDateString("es-NI", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const capitalizarTexto = (texto) => {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const formatearHora = (hora) => {
    if (!hora) return "Sin hora";

    const [h, m] = hora.split(":");
    const fecha = new Date();
    fecha.setHours(Number(h), Number(m));

    return fecha.toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="contenedor-tarjetas-citas">
        {citas.length > 0 ? (
          citas.map((cita) => {
            const total = calcularTotal(cita.Detalle_cita);
            const duracion = calcularDuracion(cita.Detalle_cita);

            return (
              <div className="tarjeta-cita-cliente" key={cita.id_cita}>
                <div className="tarjeta-cita-header">
                  <div>
                    <p className="tarjeta-cita-label">Tu cita</p>
                    <h5>{capitalizarTexto(formatearFecha(cita.fecha))}</h5>
                  </div>

                  <span className={`badge-estado-cita ${obtenerClaseEstado(cita.estado_cita)}`}>
                    {obtenerTextoEstado(cita.estado_cita)}
                  </span>
                </div>

                <div className="tarjeta-cita-info">
                  <div>
                    <i className="bi bi-clock"></i>
                    <span>{formatearHora(cita.hora)}</span>
                  </div>

                  <div>
                    <i className="bi bi-hourglass-split"></i>
                    <span>{duracion} min estimados</span>
                  </div>

                  <div>
                    <i className="bi bi-person-heart"></i>
                    <span>
                      {cita.Empleados
                        ? `${cita.Empleados.nombre} ${cita.Empleados.apellido}`
                        : "Empleado por asignar"}
                    </span>
                  </div>
                </div>

                <div className="tarjeta-cita-servicios">
                  <span>Servicios seleccionados</span>

                  <div className="chips-servicios-cita">
                    {cita.Detalle_cita?.slice(0, 3).map((detalle) => (
                      <span key={detalle.id_detalle_cita}>
                        <i className="bi bi-stars me-1"></i>
                        {detalle.Servicios?.nombre || "Servicio"}
                      </span>
                    ))}

                    {cita.Detalle_cita?.length > 3 && (
                      <span>+{cita.Detalle_cita.length - 3} más</span>
                    )}
                  </div>
                </div>

                <div className="tarjeta-cita-footer">
                  <div>
                    <span>Total</span>
                    <strong>C$ {total.toFixed(2)}</strong>
                  </div>

                  <Button
                    size="sm"
                    className="btn-ver-detalle-cita"
                    onClick={() => setCitaSeleccionada(cita)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Ver detalles
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="sin-citas-cliente">
            <i className="bi bi-calendar-x"></i>
            <h5>No tienes citas agendadas</h5>
            <p>Cuando reserves una cita, aparecerá en esta sección.</p>
          </div>
        )}
      </div>

      <Modal
        show={!!citaSeleccionada}
        onHide={() => setCitaSeleccionada(null)}
        centered
        size="lg"
        className="modal-detalle-cita-cliente"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-calendar-check me-2"></i>
            Detalle de tu cita
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {citaSeleccionada && (
            <>
              <div className="modal-cita-resumen-cliente">
                <div>
                  <span>Fecha</span>
                  <strong>{capitalizarTexto(formatearFecha(citaSeleccionada.fecha))}</strong>
                </div>

                <div>
                  <span>Hora</span>
                  <strong>{formatearHora(citaSeleccionada.hora)}</strong>
                </div>

                <div>
                  <span>Estado</span>
                  <span className={`badge-estado-cita ${obtenerClaseEstado(citaSeleccionada.estado_cita)}`}>
                    {obtenerTextoEstado(citaSeleccionada.estado_cita)}
                  </span>
                </div>

                <div>
                  <span>Empleado</span>
                  <strong>
                    {citaSeleccionada.Empleados
                      ? `${citaSeleccionada.Empleados.nombre} ${citaSeleccionada.Empleados.apellido}`
                      : "Por asignar"}
                  </strong>
                </div>
              </div>

              <h6 className="modal-cita-subtitulo">
                <i className="bi bi-stars me-2"></i>
                Servicios agendados
              </h6>

              <div className="modal-servicios-cita-cliente">
                {citaSeleccionada.Detalle_cita?.map((detalle) => (
                  <div
                    className="modal-servicio-cita-card"
                    key={detalle.id_detalle_cita}
                  >
                    <div>
                      <strong>{detalle.Servicios?.nombre || "Servicio"}</strong>
                      <p>
                        Duración:{" "}
                        {Number(detalle.Servicios?.duracion || 0)} min
                      </p>
                    </div>

                    <strong>
                      C$ {Number(detalle.subtotal || 0).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="modal-total-cita-cliente">
                <span>Total a pagar</span>
                <strong>
                  C$ {calcularTotal(citaSeleccionada.Detalle_cita).toFixed(2)}
                </strong>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TarjetaCitas;