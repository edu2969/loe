if (Meteor.users.find().count() === 0) {

}

Meteor.startup(function() {
    Guests.rawCollection().createIndex({ names: 1 });
    Events.rawCollection().createIndex({ date: 1 });
})