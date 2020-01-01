// Labores de manteniemiento

// 1. Por evento deben ser contabilizados los asistentes, presentes, mujeres, hombres y actualizar los eventos.
// 2. Para aquellos que contengan información de hora de arrivo, se actualiza campo averageArriveTime del evento

Template.maintenance.rendered = function() {
  Meteor.call("GetLogs", 0, function(err, resp) {
    if(!err) {
      Session.set("Logs", resp);
    }
  })
}

Template.maintenance.helpers({
  logs() {
    return Session.get("Logs");
  }
})

Template.maintenance.events({

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