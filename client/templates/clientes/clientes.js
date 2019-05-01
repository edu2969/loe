var EDITING_KEY = 'clientes';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

var options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
};
var fields = ['names', 'rut'];
ClientesSearch = new SearchSource('clientes', fields, options);

Template.clientes.rendered = function () {
    if (firstRender) {
        listFadeInHold = LaunchScreen.hold();
        listRenderHold.release();
        firstRender = false;
    }

    ClientesSearch.search('');
};

Template.clientes.helpers({
    top10: function () {
        return Guests.find({}, {
            sort: {
                asistencias: -1
            },
            limit: 10
        }).map(function (a, i) {
            a.indice = i + 1;
            return a;
        });
    },
    baneados: function () {
        return Guests.find({
            baneado: true
        }).map(function (a, i) {
            a.indice = i + 1;
            return a;
        });
    },
    isLoading: function () {
        return ClientesSearch.getStatus().loading;
    },
    clientes: function () {
        return ClientesSearch.getData({
            transform: function (matchText, regExp) {
                return matchText.replace(regExp, "<span style='color: #BF55EC'>$&</span>")
            },
            sort: {
                isoScore: -1
            }
        });
    },
});

Template.clientes.events({
    'click .btn-ver': function (e) {
        var id = e.currentTarget.id;
        var guest = Guests.findOne(id);
        guest.global = true;
        Session.set('GuestSelected', guest);
        Router.go('/guestEdit');
    },
    'keyup #lupa': _.throttle(function (e) {
        var text = $(e.target).val().trim();
        ClientesSearch.search(text);
    }, 200)
});