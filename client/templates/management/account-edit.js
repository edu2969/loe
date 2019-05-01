Template.accountEdit.rendered = function () {
  Session.set('ImportMessages', false);
}

Template.accountEdit.events({
  'click #btn-save': function (e) {
    e.preventDefault();
    var name = $('#account-name').val();
    var email = $('#account-email').val();
    var username = $('#account-username').val();
    var password = $('#account-password').val();
    var repassword = $('#account-repassword').val();
    var accountSelected = Session.get('AccountSelected');

    var messages, roleSelected;
    if (password != repassword) {
      if (!messages) messages = {
        danger: []
      };
      if (!messages.danger) messages.danger = [];
      messages.danger.push({
        item: 'El password y su verificación deben coincidir'
      });
      Session.set('ImportMessages', messages);
      return;
    }

    roleSelected = Session.get('RoleSelected');
    if (!roleSelected) {
      if (!messages) messages = {
        danger: []
      };
      if (!messages.danger) messages.danger = [];
      messages.danger.push({
        item: 'Insconsitencia. Vuelva a identificarse'
      });
      Session.set('ImportMessages', messages);
      return;
    }

    var isRPAdmin = false, privilegiado = false;
    if (roleSelected == 3) {
      isRPAdmin = $('#checkbox-rp-admin').is(':checked');
      privilegiado = $("#checkbox-privilegiado").is(":checked");
    }
    if (!accountSelected) {
      var userId = Meteor.call('registerNewUser', username, name, email, password, roleSelected, isRPAdmin, privilegiado);
      Session.set('AccountSelected', null);
      Router.go('manager');
      return;
    } else {
      Meteor.call('updateUser', Meteor.userId(), accountSelected._id, name, username, email, isRPAdmin, privilegiado);
    }

    if (accountSelected && password && password == repassword) {
      Meteor.call('setPassword', accountSelected._id, password);
      if (accountSelected._id == Meteor.userId()) {
        Router.go('signin');
        return;
      }
    }
    
    Session.set('AccountSelected', null);
    Router.go('manager');
  }
});

Template.accountEdit.helpers({
  accountSelected: function () {
    var k = Session.get('AccountSelected');
    if (k) return k;
  },
  messages: function () {
    var messages = Session.get('ImportMessages');
    return messages;
  },
  isRPAdmin: function () {
    return Session.get('AccountSelected').profile.isRPAdmin;
  },
  roleName: function () {
    var accountSelected = Session.get('AccountSelected')
    var roleSelected = Session.get('RoleSelected')
    if (!roleSelected) return '#&8*!@&ˆ#)'
    if (roleSelected == 1) return 'Administrador'
    if (roleSelected == 2) return 'Dueño'
    if (roleSelected == 3) return 'RP'
    if (roleSelected == 4) return 'Guardia'
    return '#&8*!@&ˆ#)'
  },
  isRP: function () {
    return Session.get('RoleSelected') == 3
  }
});