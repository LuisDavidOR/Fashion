import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCategorias = ({
    categorias,
    abrirModalEdicion,
    abrirModalEliminacion,
    cambiarEstadoCategoria
  }) => {
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categorias && categorias.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [categorias]);

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando categorías...</h4>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="d-none d-md-table-cell">Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id_categoria}>
                <td>{categoria.id_categoria}</td>
                <td>{categoria.nombre}</td>
                <td className="d-none d-md-table-cell">{categoria.descripcion}</td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(categoria)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(categoria)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                  <Button
                    variant={
                      categoria.estado === "activo"
                        ? "outline-secondary"
                        : "outline-success"
                    }
                    size="sm"
                    className="m-1"
                    onClick={() => cambiarEstadoCategoria(categoria)}
                    title={categoria.estado === "activo" ? "Inactivar" : "Activar"}
                  >
                    <i
                      className={
                        categoria.estado === "activo"
                          ? "bi bi-toggle-off"
                          : "bi bi-toggle-on"
                      }
                    ></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaCategorias;