import React, { useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";

const ModalSeleccionServicios = ({
  mostrarModalServicios,
  setMostrarModalServicios,
  servicios,
  detalleCita,
  agregarServicioDetalle,
  eliminarServicioDetalle,
}) => {
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");

  const categorias = useMemo(() => {
    const lista = servicios.map(
      (servicio) => servicio.Categorias?.nombre || "Sin categoría"
    );

    return ["todos", ...new Set(lista)];
  }, [servicios]);

  const serviciosFiltrados = servicios.filter((servicio) => {
    const nombre = servicio.nombre?.toLowerCase() || "";
    const categoria = servicio.Categorias?.nombre || "Sin categoría";
    const texto = textoBusqueda.toLowerCase().trim();

    const coincideTexto = nombre.includes(texto);
    const coincideCategoria =
      categoriaSeleccionada === "todos" ||
      categoria === categoriaSeleccionada;

    return coincideTexto && coincideCategoria;
  });

  const servicioYaAgregado = (idServicio) => {
    return detalleCita.some(
      (item) => String(item.id_servicio) === String(idServicio)
    );
  };

  return (
    <Modal
      show={mostrarModalServicios}
      onHide={() => setMostrarModalServicios(false)}
      size="lg"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar servicios</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-3 g-2">
          <Col xs={12} md={7}>
            <Form.Control
              type="text"
              placeholder="Buscar servicio..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
          </Col>

          <Col xs={12} md={5}>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria === "todos" ? "Todas las categorías" : categoria}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {serviciosFiltrados.length === 0 ? (
          <div className="text-center text-muted py-4">
            No se encontraron servicios.
          </div>
        ) : (
          <Row className="g-3">
            {serviciosFiltrados.map((servicio) => {
              const agregado = servicioYaAgregado(servicio.id_servicio);

              return (
                <Col xs={6} sm={6} lg={4} key={servicio.id_servicio}>
                  <div className="mini-servicio-card">
                    <div className="mini-servicio-img-wrap">
                      {servicio.url_imagen ? (
                        <img
                          src={servicio.url_imagen}
                          alt={servicio.nombre}
                          className="mini-servicio-img"
                        />
                      ) : (
                        <div className="mini-servicio-img-placeholder">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                    </div>

                    <div className="mini-servicio-body">
                      <Badge bg="light" text="dark" className="mb-2">
                        {servicio.Categorias?.nombre || "Sin categoría"}
                      </Badge>

                      <h6 className="mini-servicio-title">
                        {servicio.nombre}
                      </h6>

                      <div className="mini-servicio-info">
                        <span>C$ {Number(servicio.precio || 0).toFixed(2)}</span>
                        <span>{servicio.duracion} min</span>
                      </div>

                      <Button
                        size="sm"
                        className={
                          agregado
                            ? "w-100 mt-3 btn-quitar-servicio-mini"
                            : "w-100 mt-3 btn-agregar-servicio-mini"
                        }
                        onClick={() => {
                          if (agregado) {
                            eliminarServicioDetalle(servicio.id_servicio);
                          } else {
                            agregarServicioDetalle(servicio.id_servicio);
                          }
                        }}
                      >
                        {agregado ? "Quitar" : "Agregar"}
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalServicios(false)}
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalSeleccionServicios;