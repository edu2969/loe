
FechaEventoActual = function () {
  var fecha = moment();
  if(fecha.get('hour') < 12) fecha.subtract(1, 'd');
  return fecha.startOf('day').hours(12);
}

HoraNocturna = function (ms) {
  var newms = (ms > 12 * 3600000 ? ms - 12 * 3600000 : ms + 12 * 3600000)
  var hours = Math.floor(newms / 3600000)
  var minutes = Math.floor(( newms - hours * 3600000 ) / 60000)
  if(hours==24) hours = 0
  return ( hours < 10 ? '0' + hours : hours ) + ':' + ( minutes < 10 ? '0' + minutes : minutes )
}