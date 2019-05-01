// Guests
Guests = new Meteor.Collection('guests');
Guests.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

// Attenders
Attenders = new Meteor.Collection('attenders');
Attenders.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

// Events
Events = new Meteor.Collection('events');
Events.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

// Users - Permission
Meteor.users.allow({
  insert: function () {
    return false;
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});

// BI RPs
BIRPs = new Meteor.Collection('birps');
BIRPs.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return false;
  }
});

// BI RPs
LogComportamientos = new Meteor.Collection('logcomportamientos');
LogComportamientos.allow({
  insert: function () {
    return false;
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});