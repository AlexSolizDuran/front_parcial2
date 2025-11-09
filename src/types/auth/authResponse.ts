import { UsuarioGet } from "../usuario/usuario";

interface AuthResponse{
    token:string,
    usuario:UsuarioGet
}

export type {AuthResponse}