interface UsuarioGet {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  telefono: number;
  rolNombre: string;
}
interface UsuarioSet {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  username: string;
  telefono: number;
  rolId: number;
}
interface UsuarioList {
  id: number;
  username: string;
  nombre: string;
  apellido:string;
  email: string;
  rolNombre: string;
}

export type { UsuarioGet, UsuarioSet, UsuarioList };
