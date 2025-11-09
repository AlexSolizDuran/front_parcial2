interface VentaGet{
    id:string,
    numeroVenta:string,
    clienteId:string,
    vendedorId:string,
    metodoPago:string,
    tipoVendta:string,
    montoTotal:string,
    estadoPedido:string,
    fechaVenta:string
}

interface VentaSet{
    clienteID:string,
    vendedorID:string,
    metodoPago:string,
    tipoVenta:string,
}
export type {VentaGet,VentaSet}