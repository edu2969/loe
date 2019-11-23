var EDITING_KEY = 'eventImport'
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.eventImport.rendered = function () {
   if (firstRender) {
      listFadeInHold = LaunchScreen.hold();
      // Handle for launch screen defined in app-body.js
      listRenderHold.release();
      firstRender = false;
   }
}

Template.eventImport.helpers({
   evento: function () {
      var e = Session.get('EventoSeleccionado');
      if (e) return e;
   },
   messages: function () {
      var messages = Session.get('ImportMessages');
      return messages;
   }
});

Template.eventImport.events({
   'click #btn-import': function () {
      if (!Meteor.user()) Router.go("/");
      var messages;

      var eventSelected = Session.get('EventoSeleccionado');

      var totalImported = 0;

      var text2Import = $('#ruts-2-import').val().trim();

      if (text2Import.length == 0) {
         messages = {
            danger: []
         };
         messages.danger.push({
            item: 'Se requieren datos para importar'
         });
         Session.set('ImportMessages', messages);
         return;
      }
      var entradas = text2Import.split(/\r\n|\n|\r/);
      var fechaEvento;

      $('#ruts-2-import').val('');

      Meteor.call("LogHT", "IMPORTAR_LISTA(" + entradas.length + "-REGS)", true);

      Meteor.call('processListImport', entradas, eventSelected._id, function (err, data) {
         if (err) {} else {
            Session.set('ImportMessages', data);
            $('#ruts-2-import').val(data.wrongRuts);
         }
      });
   }
});