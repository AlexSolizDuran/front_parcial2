interface VentaGet{
    id:number,
    numeroVenta:number,
    clienteId:number,
    vendedorId:number,
    metodoPago:string,
    tipoVendta:string,
    montoTotal:number,
    estadoPedido:string,
    fechaVenta:string
}

interface VentaSet{
    clienteID:number,
    vendedorID:number,
    metodoPago:string,
    tipoVenta:string,
}
export type {VentaGet,VentaSet}