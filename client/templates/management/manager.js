var EDITING_KEY = 'manager'
Session.setDefault(EDITING_KEY, false)

var firstRender = true
var listRenderHold = LaunchScreen.hold()
listFadeInHold = null

Template.manager.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold()
    listRenderHold.release()
    firstRender = false
  }
  
  if (!Session.get('RoleSelected'))
    Session.set('RoleSelected', 3)
}

Template.manager.events({
  'click #tab-rps': function (e) {
    e.preventDefault();
    Session.set('RoleSelected', 3)
  },
  'click #tab-keepers': function (e) {
    e.preventDefault();
    Session.set('RoleSelected', 4)
  },
  'click #tab-admins': function (e) {
    e.preventDefault();
    Session.set('RoleSelected', 1)
  },
  'click #tab-owners': function (e) {
    e.preventDefault();
    Session.set('RoleSelected', 2)
  },
  'click #tab-eliminados': function (e) {
    e.preventDefault();
    Session.set('RoleSelected', 5)
  },
  'click .btn-agregar': function (e) {
    e.preventDefault()
    Session.set('AccountSelected', false)
    Router.go('/accountEdit')
  },
  'click .btn-editar': function (e) {
    var btn = e.currentTarget;
    var userId = btn.id;
    var user = Meteor.users.findOne({
      _id: userId
    });
    Session.set('AccountSelected', user);
    Router.go('/accountEdit');
  },  
  'click .btn-reintegrar': function (e) {
    var id = e.currentTarget.id;
    Meteor.call('reintegrarUsuario', id, 3);
  },
  'click .btn-eliminar': function (e) {
    var btnid = e.currentTarget.id;
    Meteor.call('eliminarUsuario', Meteor.userId(), btnid);
  }
})

Template.manager.helpers({
  isAdmin: function () {
    return Meteor.user().profile.role == 1
  },
  accountsCount: function () {
    var roleSelected = Session.get('RoleSelected')
    if(!roleSelected) return false
    return Meteor.users.find({
      "profile.role": roleSelected
    }).count();
  },
  accounts: function () {
    var roleSelected = Session.get('RoleSelected');
    return Meteor.users.find({
        "profile.role": roleSelected
      })
      .map(function (a, index) {
        a.index = index + 1;
        return a;
      })
  },
  estaEliminado: function() {
    return Session.get('RoleSelected')==5;
  },
  isRPAdmin: function() {
    return Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1
  }
})

