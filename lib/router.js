Router.configure({
  layoutTemplate: 'appBody',
  notFoundTemplate: 'appNotFound',
  loadingTemplate: 'appLoading',
  waitOn: function () {
    return [
      
    ]
  }
})

Router.onBeforeAction(function() {
  if (! Meteor.userId()) {
    this.render('signin');
  } else {
    this.next();
  }
})

dataReadyHold = null;

if (Meteor.isClient) {
  dataReadyHold = LaunchScreen.hold();
  Router.onBeforeAction('loading', {
    except: ['signin']
  });
  Router.onBeforeAction('dataNotFound', {
    except: ['signin']
  });
}

Router.map(function () {
  this.route('eventImport', {
    path: '/eventImport',
    action: function () {
      this.render();
    }
  })

  this.route('guestEdit', {
    path: '/guestEdit',
    action: function () {
      this.render();
    }
  });

  this.route('accountEdit', {
    path: '/accountEdit',
    action: function () {
      this.render();
    }
  })

  this.route('_underConstruction', {
    path: '/_underConstruction',
    action: function () {
      this.render();
    }
  });  
});

Router.route("signin", {
  path: "/",
  layoutTemplate: 'appBody',
  action: function () {
    this.render();
  }
});

Router.route("accountsList", {
  path: "/accountsList",
  layoutTemplate: "appBody",
  waitOn: function() {
    return [
      //Meteor.subscribe('users')
    ];
  }
});

Router.route("manager", {
  path: "/manager",
  layoutTemplate: "appBody",
  waitOn: function() {
    return [
      Meteor.subscribe('users')
    ];
  }
})

Router.route('welcome', {
  path: '/welcome',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('eventoActual')
      ];
  },
  action: function () {
    if(Meteor.user().profile.role!=4 && Meteor.user().profile.role!=1) {
      Router.go("/");
    }
    this.render();
  }
})

Router.route('eventsList', {
  path: '/eventsList',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('eventos')
  },
  action: function () {
    this.render();
  }
})

Router.route('attendersList', {
  path: '/attendersList/:_eventoId/:pagina',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('asistentes', this.params._eventoId, Number(this.params.pagina));
  },
  action: function () {
    this.render();
  }
})

Router.route('eventEdit', {
  path: '/eventEdit/:_eventoId',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('birpevento', this.params._eventoId)
    ];
  },
  action: function () {
    this.render();
  }
});

Router.route('bi', {
  path: '/bi',
  layoutTemplate: 'appBody',
  action: function () {
    this.render();
  }
});

Router.route('clientes', {
  path: '/clientes',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
        Meteor.subscribe('baneados'),
        Meteor.subscribe("top10")
        ];        
  },
  action: function () {
    this.render();
  }
});

Router.route("maintenance", {
  path: "/maintenance",
  layoutTemplate: "appBody",
  waitOn: function() {
    return [
    ];
  }
});