// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.guestEdit.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    // Handle for launch screen defined in app-body.js
    listRenderHold.release();
    firstRender = false;
  }
}

Template.guestEdit.helpers({
  guest: function () {
    return Session.get('GuestSelected');
  },
  isFemale: function () {
    var g = Session.get('GuestSelected');
    return g ? g.gender == 'F' : false;
  },
  isMale: function (doc) {
    var g = Session.get('GuestSelected');
    return g ? g.gender == 'M' : false;
  },
  noGender: function () {
    var g = Session.get('GuestSelected');
    return g ? !g.gender : false;
  },
  noRPAdmin: function () {
    return ( Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1 ) 
      ? '' : 'disabled'
  }
});

Template.guestEdit.events({
  'click #btn-guardar': function (e) {
    e.preventDefault()
    var names = $('#guest-names').val();
    var gender = $('#hidden-gender').val();
    var baneado = $('#checkbox-baneado').is(':checked')
    var observacion = $('#textarea-observacion').val()
    
    var guest = Session.get('GuestSelected');
    
    Guests.update(guest._id, {
      $set: {
        names: names,
        gender: gender,
        baneado: baneado,
        observacion: observacion
      }
    });
    var evt = Session.get('EventoSeleccionado');
    history.go(-1);
  },
  'click #gender-male': function () {
    $('#hidden-gender').val('M');
  },
  'click #gender-noinfo': function () {
    $('#hidden-gender').val(null);
  },
  'click #gender-female': function () {
    $('#hidden-gender').val('F');
  },
  'click #btn-volver': function () {
    var guest = Session.get('GuestSelected');
    if(guest.global) {
      Router.go('/clientes'); 
      return;
    }
    var evt = Session.get('EventoSeleccionado');
    Router.go('/attendersList/' + ( evt ? evt._id : '-1' ));
  }
});