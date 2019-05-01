var EDITING_KEY = 'signin';
var ERRORS_KEY = 'loginErrors';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.signin.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    // Handle for launch screen defined in app-body.js
    listRenderHold.release();
    firstRender = false;
  }
}

Template.signin.created = function () {
  Session.set(ERRORS_KEY, {});
};

Template.signin.helpers({
  errorMessages: function () {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function (key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.signin.events({
  'submit': function (event, template) {
    Meteor.call("LogHT", "LOGIN", true);
    event.preventDefault();

    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();

    var errors = {};

    if (!email) {
      errors.email = 'Email is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Meteor.loginWithPassword(email, password, function (error) {
      if (error) {
        return Session.set(ERRORS_KEY, {
          'none': error.reason
        });
      }
      switch (Meteor.user().profile.role) {
      case 1:
        Router.go('/eventsList');
        break;
      case 2:
        Router.go('/eventsList');
        break;
      case 3:
        Router.go('/eventsList');
        break;
      default:
        Router.go('/welcome');
      }
      // Router.go('/_underConstruction');
    });
  }
});