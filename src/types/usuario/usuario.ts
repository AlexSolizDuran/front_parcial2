interface UsuarioGet {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  telefono: string;
  rolNombre: string;
}
interface UsuarioSet {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  username: string;
  telefono: string;
  rolId: string;
}
interface UsuarioList {
  id: string;
  username: string;
  nombre: string;
  apellido:string;
  email: string;
  rolNombre: string;
}

export type { UsuarioGet, UsuarioSet, UsuarioList };
