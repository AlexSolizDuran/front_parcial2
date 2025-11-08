import { UsuarioGet } from "../usuario/usuarioGet";

interface AuthResponse{
    token:string,
    usuario:UsuarioGet
}

export type {AuthResponse}