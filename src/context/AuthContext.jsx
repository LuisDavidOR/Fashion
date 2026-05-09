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
        await supabase.auth.signOut();

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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await obtenerPerfil(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    setUsuario(null);
    setPerfil(null);
    setRol("invitado");
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