var EDITING_KEY = 'eventsList'
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.eventsList.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    listRenderHold.release();
    firstRender = false;
  }
};

Template.eventsList.helpers({
  eventos: function () {
    return Events.find({ }, { sort: {date: -1}});
  },
  isRPAdmin: function () {
    return Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1
  },
  isAdmin: function() {
    return Meteor.user() && Meteor.user().profile.role == 1;
  }
})

Template.eventsList.events({
  'click .btn-edit': function (e) {
    Meteor.call("LogHT", "VER_FIESTA", true);
    var btn = e.currentTarget
    var eventId = btn.id.substring(9)
    Session.set('EventoSeleccionado', Events.findOne(eventId))
    Router.go('/eventEdit/' + eventId);
  },
  'click .btn-import': function (e) {
    Meteor.call("LogHT", "IMPORT", true);
    var eventId = e.currentTarget.id.substring(11);
    var evnt = Events.findOne(eventId);
    Session.set('EventoSeleccionado', evnt);
    Session.set('ImportMessages', false);
    Router.go('/eventImport');
  },
  'click .btn-list': function (e) {
    Meteor.call("LogHT", "LISTADO_CLIENTES", true);
    var eventId = e.currentTarget.id.substring(9)
    Session.set('EventoSeleccionado', Events.findOne(eventId))
    Router.go('/attendersList/' + eventId)
  },
  'click .btn-eliminar': function (e) {
    var id = e.currentTarget.id;
    Session.set('ParametrosConfirmacion', { entidad: 'Evento', id: id });
    $('#modal-confirmacion').modal('show');
  },
  "click .btn-rbi": function(e) {
    Meteor.call("LogHT", "WARN:GENERAR_BI", true);
    Meteor.call("generarBI", e.currentTarget.id, function(err, resp) {
      
    });
  }
});