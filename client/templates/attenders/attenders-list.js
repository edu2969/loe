var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

// Variables de busqueda  
var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['names', 'rp'];
InvitadosSearch = new SearchSource('invitados', fields, options);

Template.attendersList.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    // Handle for launch screen defined in app-body.js
    listRenderHold.release();
    firstRender = false;
  }
  InvitadosSearch.search('', { eventoId: Router.current().params._eventoId });
};

Template.attendersList.helpers({
  isLoading: function() {
    return InvitadosSearch.getStatus().loading;
  },
  invitados: function () {
    return InvitadosSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<span style='color: #BF55EC'>$&</span>")
      },
      sort: {isoScore: -1}
    });
  },
  arrivesCount: function () {
    return Attenders.find({
      checktime: {
        $exists: true
      }
    }).count();
  },
  evento: function () {
    return Session.get('EventoSeleccionado');
  }
});

Template.attendersList.events({
  'click .btn-edit-guest': function (e) {
    var btn = e.currentTarget;
    var id = btn.id.substring(9);
    var guest = Guests.findOne(id);
    Session.set('GuestSelected', guest);
    Router.go('/guestEdit');
  },
  'keyup #lupa': _.throttle(function(e) {
    var text = $(e.target).val().trim();
    InvitadosSearch.search(text, { eventoId: Router.current().params._eventoId });
  }, 200)
});

Handlebars.registerHelper("prettifyDate", function (timestamp) {
  return new Date(timestamp).toString('dd/MM/yy')
});