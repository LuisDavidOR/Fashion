import React, { useEffect, useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const ModalInsumosServicio = ({
  mostrarModalInsumos,
  setMostrarModalInsumos,
  servicioSeleccionado,
  insumos,
  setToast,
  cargarServicios,
}) => {
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  const [mensajeModal, setMensajeModal] = useState(null);

  const validarInsumos = () => {
    const hayCantidadInvalida = insumosSeleccionados.some(
      (item) =>
        item.cantidad_usada === "" ||
        isNaN(Number(item.cantidad_usada)) ||
        Number(item.cantidad_usada) <= 0
    );

    if (hayCantidadInvalida) {
      setMensajeModal({
        tipo: "warning",
        texto: "Cada insumo seleccionado debe tener una cantidad válida mayor a 0.",
      });
      return false;
    }

    return true;
  };

  const guardarCambios = async () => {
    if (!validarInsumos()) return;

    try {
      const { error: errorEliminar } = await supabase
        .from("Servicio_Insumo")
        .delete()
        .eq("id_servicio", servicioSeleccionado.id_servicio);

      if (errorEliminar) throw errorEliminar;

      const relaciones = insumosSeleccionados.map((item) => ({
        id_servicio: servicioSeleccionado.id_servicio,
        id_insumo: item.id_insumo,
        cantidad_usada: parseFloat(item.cantidad_usada),
      }));

      const { error: errorInsertar } = await supabase
        .from("Servicio_Insumo")
        .insert(relaciones);

      if (errorInsertar) throw errorInsertar;
      await cargarServicios();

      setToast({
        mostrar: true,
        mensaje: "Insumos del servicio guardados correctamente.",
        tipo: "exito",
      });
      setMostrarModalInsumos(false);
    } catch (error) {
      console.error("Error al guardar insumos del servicio:", error.message);
      setToast({
        mostrar: true,
        mensaje: "Error al guardar los insumos del servicio.",
        tipo: "error",
      });
    }
  };

  const cargarInsumosDelServicio = async () => {
    if (!servicioSeleccionado?.id_servicio) return;

    try {
      const { data, error } = await supabase
        .from("Servicio_Insumo")
        .select("*")
        .eq("id_servicio", servicioSeleccionado.id_servicio);

      if (error) throw error;

      setInsumosSeleccionados(
        data.map((item) => ({
          id_insumo: item.id_insumo,
          cantidad_usada: item.cantidad_usada,
        }))
      );
    } catch (error) {
      console.error("Error al cargar insumos del servicio:", error.message);
    }
  };

  useEffect(() => {
    if (mostrarModalInsumos && servicioSeleccionado) {
      setMensajeModal(null);
      cargarInsumosDelServicio();
    }
  }, [mostrarModalInsumos, servicioSeleccionado]);
  
  return (
    <Modal
      show={mostrarModalInsumos}
      onHide={() => setMostrarModalInsumos(false)}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-box-seam me-2"></i>
          Insumos de {servicioSeleccionado?.nombre}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensajeModal && (
          <Alert variant={mensajeModal.tipo} className="mb-3">
            {mensajeModal.texto}
          </Alert>
        )}
        <h6 className="fw-bold mb-3">Insumos disponibles</h6>

        <p className="text-muted small mb-3">
          Selecciona los insumos que utiliza este servicio e ingresa la cantidad usada
          según su unidad de medida.
        </p>

        {insumos.length === 0 ? (
          <p className="text-muted mb-0">
            No hay insumos activos disponibles.
          </p>
        ) : (
          insumos.map((insumo) => {
            const seleccionado = insumosSeleccionados.find(
              (item) => item.id_insumo === insumo.id_insumo
            );

            return (
              <div
                key={insumo.id_insumo}
                className="border rounded p-3 mb-2"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{insumo.nombre}</strong>

                    <div className="text-muted small">
                      {insumo.unidad_medida} | C$
                      {Number(insumo.costo_producto).toFixed(2)}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    
                    checked={!!seleccionado}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInsumosSeleccionados((prev) => [
                          ...prev,
                          {
                            id_insumo: insumo.id_insumo,
                            cantidad_usada: "",
                          },
                        ]);
                      } else {
                        setInsumosSeleccionados((prev) =>
                          prev.filter(
                            (item) => item.id_insumo !== insumo.id_insumo
                          )
                        );
                      }
                    }}
                  />
                </div>

                {seleccionado && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    placeholder={`Cantidad usada (${insumo.unidad_medida})`}
                    value={seleccionado.cantidad_usada}
                    onChange={(e) => {
                      setInsumosSeleccionados((prev) =>
                        prev.map((item) =>
                          item.id_insumo === insumo.id_insumo
                            ? {
                                ...item,
                                cantidad_usada: e.target.value,
                              }
                            : item
                        )
                      );
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalInsumos(false)}
        >
          Cerrar
        </Button>

        <Button variant="primary" onClick={guardarCambios}>
          <i className="bi bi-save me-2"></i>
          Guardar cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalInsumosServicio;