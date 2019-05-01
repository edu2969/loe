Template.modalConfirmacion.rendered = function () {

}

Template.modalConfirmacion.helpers({
  item: function () {
    var params = Session.get('ParametrosConfirmacion')
    if(!params) return false;
    switch(params.entidad) {
      case 'Evento':   
        var evento = Events.findOne({ _id: params.id });
        return evento ? 'el evento ' + evento.name : '??';
    }
  }
})

Template.modalConfirmacion.events({
  'click #btn-aceptar': function () {
    var params = Session.get('ParametrosConfirmacion')
    if(!params) return false
    switch(params.entidad) {
      case 'Evento': 
        Meteor.call('eliminarEvento', params.id);
        break;
    }
    $('#modal-confirmacion').modal('hide')
  }
})
