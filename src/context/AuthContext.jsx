import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../database/supabaseconfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [rol, setRol] = useState("invitado");
  const [cargando, setCargando] = useState(true);

  const obtenerPerfil = async (user) => {
    setCargando(true);

    try {
      if (!user) {
        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        return;
      }

      const { data, error } = await supabase
        .from("Usuarios")
        .select(`
          *,
          Clientes (*),
          Empleados (*)
        `)
        .eq("auth_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error obteniendo perfil:", error);

        sessionStorage.setItem(
          "mensaje-login",
          "No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente."
        );

        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        return;
      }

      if (!data) {
        console.warn("Usuario autenticado, pero no registrado en tabla Usuarios");

        sessionStorage.setItem(
          "mensaje-login",
          "Tu cuenta aún no tiene acceso al sistema. Contacta al administrador."
        );

        await supabase.auth.signOut();

        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        return;
      }

      const rolesPermitidos = ["admin", "cliente", "empleado"];

      if (data.estado?.toLowerCase().trim() !== "activo") {
        sessionStorage.setItem(
          "mensaje-login",
          "Tu usuario está inactivo. Contacta al administrador."
        );

        await supabase.auth.signOut();

        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        return;
      }

      if (!rolesPermitidos.includes(data.rol)) {
        sessionStorage.setItem(
          "mensaje-login",
          "Tu rol no es válido. Contacta al administrador."
        );

        await supabase.auth.signOut();

        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        return;
      }

      if (data.rol === "cliente") {
        const { data: cliente, error: errorCliente } = await supabase
          .from("Clientes")
          .select("id_cliente, estado")
          .eq("id_cliente", data.id_cliente)
          .maybeSingle();

        if (
          errorCliente ||
          !cliente ||
          cliente.estado?.toLowerCase().trim() !== "activo"
        ) {
          sessionStorage.setItem(
            "mensaje-login",
            "Tu perfil de cliente está inactivo. Contacta al administrador."
          );

          await supabase.auth.signOut();

          setUsuario(null);
          setPerfil(null);
          setRol("invitado");
          return;
        }
      }

      if (data.rol === "empleado") {
        const { data: empleado, error: errorEmpleado } = await supabase
          .from("Empleados")
          .select("id_empleado, estado")
          .eq("id_empleado", data.id_empleado)
          .maybeSingle();

        if (
          errorEmpleado ||
          !empleado ||
          empleado.estado?.toLowerCase().trim() !== "activo"
        ) {
          sessionStorage.setItem(
            "mensaje-login",
            "Tu acceso como empleado está inactivo. Contacta al administrador."
          );

          await supabase.auth.signOut();

          setUsuario(null);
          setPerfil(null);
          setRol("invitado");
          return;
        }
      }

      setUsuario(user);
      setPerfil(data);
      setRol(data.rol);

    } catch (error) {
      console.error("Error general auth:", error);
      setUsuario(null);
      setPerfil(null);
      setRol("invitado");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const obtenerSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await obtenerPerfil(session?.user ?? null);
    };

    obtenerSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
          setTimeout(() => {
            obtenerPerfil(session?.user ?? null);
          }, 0);
        });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

    const cerrarSesion = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      } finally {
        setUsuario(null);
        setPerfil(null);
        setRol("invitado");
        setCargando(false);
        sessionStorage.removeItem("mensaje-login");
      }
    };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        rol,
        cargando,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};