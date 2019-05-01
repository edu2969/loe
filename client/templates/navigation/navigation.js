Template.navigation.helpers({
  isAdmin: function () {
    return Meteor.user().profile.role == 1
  },
  isRPAdmin: function () {
    return Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1
  },
  isOwner: function () {
    return Meteor.user().profile.role <= 2
  },
  accessManager: function () {
    return Meteor.user().profile.role <= 1 || Meteor.user().profile.isRPAdmin
  }
});