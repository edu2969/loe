// Labores de manteniemiento

// 1. Por evento deben ser contabilizados los asistentes, presentes, mujeres, hombres y actualizar los eventos.
// 2. Para aquellos que contengan información de hora de arrivo, se actualiza campo averageArriveTime del evento

Template.maintenance.events({
  'click #btn-generar-bi': function () {
    $('#btn-generar-bi').text('Working on it...');
    $('#btn-generar-bi').attr('readonly', false);

    Meteor.call('generarBI');
    
    $('#btn-generar-bi').text('Everything Ok!');
  },
  'click #btn-2': function () {
    $('#btn-2').text('Reiniciando evento...');
    $('#btn-2').attr('readonly', false);
    
    Meteor.call('reiniciarEventos');
    
    $('#btn-2').text('Done!');
  },
  'click #btn-go-inspect': function () {
    $('#btn-go-inspect').text('Inspecting...');
    $('#btn-go-inspect').attr('readonly', false);

    $('#btn-go-inspect').text('Check Console');
  }
});

function timeFormat(ms) {
  var hours = Math.floor(ms / 3600000);
  hours = hours + 12 * (hours < 12 ? 1 : -1);
  var minutes = Math.floor(Math.floor((ms - Math.floor(ms / 3600000) * 1000 * 60 * 60)) / 1000 / 60);

  var str = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":00";
  var d = new Object();
  d.str = str;
  d.hours = hours;
  d.minutes = minutes;
  return d;
}