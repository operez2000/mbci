export default class Util {

	perfiles = [
    {
      id: "A",
      value: "Administrador"
    },
    {
      id: "S",
      value: "Supervisor"
    },
    {
      id: "CA",
      value: "Cajero"
    },
    {
      id: "V",
      value: "Vendedor"
    },
    {
      id: "CO",
      value: "Cobrador"
    },
    {
      id: "SU",
      value: "Súper Usuario"
    },
    {
      id: "O",
      value: "Operador"
    }
  ]

  estadosCiviles = [
    "Casado/a",
    "Soltero/a",
    "Comprometido/a",
    "Unión libre",
    "Separado/a",
    "Divorciado/a",
    "Viudo/a",
    "Otro"
  ]

  formasDePago = [
    "Quincenal",
    "Contado",
    "Mensual",
    "Semanal"
  ]

  diasCobranza = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  Numero = (valor) => {
    if (typeof valor == "string") {
      valor = Number(valor.replace(/,/g, ""))
    }
    return valor
  }

  NumberFormat = (valor, decimales = 2) => {
    return valor.toLocaleString('en-US', {minimumFractionDigits: decimales, maximumFractionDigits: decimales})
  }

  syncDelay = (milliseconds) => {
    let start = new Date().getTime()
    let end = 0
    while( (end-start) < milliseconds){
        end = new Date().getTime()
    }
  }

}  // export default class Util
