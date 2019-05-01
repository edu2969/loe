// Fución generadora de expresión regular
function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}

// Definición de fuentes
SearchSource.defineSource('eventos', function(searchText, options) {
  var options = { sort: { date: -1 }, limit: 10 };
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var asistentes = Guests.find({ names: regExp });
    var arrayIds = [], evntsIds = [];
    asistentes.forEach(function(a) {
      arrayIds.push(a._id);
    });
    var registros = Attenders.find({ guestId: { $in: arrayIds } });
    registros.forEach(function(r) {
      evntsIds.push(r.eventId);
    });
    var selector = { $or: [ { name: regExp }, { _id: { $in: evntsIds }} ] };
    return Events.find(selector, options).fetch();
  } else {
    return Events.find({}, options).fetch();
  }
});

SearchSource.defineSource('invitados', function(searchText, options) {
  var eventoId = options.eventoId;
  var options = { sort: { fecha: -1 }, limit: 20 };
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var guestIds = [], rpIds = [];
    // Busquedan entre los RPs
    var rps = Meteor.users.find({ 
      $and: [ 
        { "profile.role": { $in: [1, 2, 3] } }, 
        { "profile.name": regExp }
      ]
    });
    rps.forEach(function(rp) {
      rpIds.push(rp._id);
    });
    // Busqueda entre asistentes del evento
    var asistentes = Guests.find({ names: regExp });
    asistentes.forEach(function(a) {
      guestIds.push(a._id);
    });
    return Attenders.find({
      $and: [
        { eventId: eventoId },
        { $or: [
          { guestId: { $in: guestIds } }, 
          { rpId: { $in: rpIds }}
        ]}
      ]
    }).map(function(a, i) {
      a.names = Guests.findOne(a.guestId).names;
      a.rp = Meteor.users.findOne(a.rpId).username;
      return a;
    });
  } else {
    return Attenders.find({ eventId: eventoId }, options).map(function(a, i) {
      a.names = Guests.findOne(a.guestId).names;
      a.rp = Meteor.users.findOne(a.rpId).username;
      return a;
    });
  }
});

SearchSource.defineSource('clientes', function(searchText, options) {
  var options = { limit: 20 };
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = { $or: [ { names: regExp }, { rut: regExp } ] };
    return Guests.find(selector, options).fetch();
  } else {
    return Guests.find({}, options).fetch();
  }
});