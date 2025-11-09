interface DetalleVentaGet{
    id:string,
    cantidad:string,
    precio_unit:string,
    descuento:string,
    subtotal:string,
    ventaId:string,
    prodVarianteId:string
}

interface DetalleVentaSet{
    cantidad:string,
    precio_unit:string,
    descuento:string,
    subtotal:string,
    ventaId:string,
    prodVarianteId:string

}
export type {DetalleVentaGet,DetalleVentaSet}