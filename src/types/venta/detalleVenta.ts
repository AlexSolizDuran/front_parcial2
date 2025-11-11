interface DetalleVentaGet{
    id:number,
    cantidad:number,
    precio_unit:number,
    descuento:number,
    subtotal:number,
    ventaId:number,
    prodVarianteId:number
}

interface DetalleVentaSet{
    cantidad:number,
    precio_unit:number,
    descuento:number,
    subtotal:number,
    ventaId:number,
    prodVarianteId:number

}
export type {DetalleVentaGet,DetalleVentaSet}