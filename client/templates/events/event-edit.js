var EDITING_KEY = 'eventEdit'
Session.setDefault(EDITING_KEY, false);

var firstRender = true
var listRenderHold = LaunchScreen.hold()
listFadeInHold = null

Template.eventEdit.rendered = function () {
    if (firstRender) {
        listFadeInHold = LaunchScreen.hold()
        listRenderHold.release()
        firstRender = false
    }

    $('#input-evento-fecha').datetimepicker({
        format: 'DD/MM/YY'
    });

    $('#event-close-time').datetimepicker({
        format: 'HH:mm',
        defaultDate: new Date(1979, 0, 1, 1, 0, 0, 0)
    });

    IniciarTortaEfectividad();
}

Template.eventEdit.events({
    'click #btn-guardar': function (e) {
        e.preventDefault();
        var name = $('#event-name').val();
        var fecha = moment($('#input-evento-fecha').val(), 'DD/MM/YY').toDate()

        var parts = $('#event-close-time').val().split(":")
        var hours = Number(parts[0])
        hours = hours + 12 * (hours < 12 ? 1 : -1)
        var closeTime = hours * 60 * 60 * 1000 + Number(parts[1]) * 60 * 1000

        var eventSelected = Session.get('EventoSeleccionado');

        if (!eventSelected) {
            var id = Events.insert({
                created: new Date(),
                userId: Meteor.userId(),
                name: name,
                date: fecha,
                closeTime: closeTime,
                total: 0,
                arrives: 0,
                averageCheckTime: 0
            });
        } else {
            Events.update(eventSelected._id, {
                $set: {
                    'name': name,
                    'date': fecha,
                    'closeTime': closeTime
                }
            });
        }
        Router.go('eventsList');
    }
});

Template.eventEdit.helpers({
    eventSelected: function () {
        var e = Session.get('EventoSeleccionado');
        if (e) return e;

        var today = new Date();
        e = new Object();
        e.name = '';
        e.date = new Date();
        e.closeTime = 13 * 1000 * 60 * 60 + 30 * 1000 * 60; // 01:30 a.m.
        e._newMark = true;
        return e;
    },
    errorMessages: function () {
        return false
    },
    rps: function () {
        return TablaRPs();
    },
    disabled: function () {
        return (Meteor.user().profile.isRPAdmin || Meteor.user().profile.role == 1) ? '' : 'disabled'
    }
});

TablaRPs = function () {
    return BIRPs.find().map(function (reg, indice) {
        var evento = Session.get('EventoSeleccionado');
        reg.nombre = Meteor.users.findOne({
            _id: reg.rpId
        }).profile.name;
        if(!reg.inscritos) reg.inscritos = 0;
        if(!reg.asisten) reg.asisten = 0;
        if(!evento.arrives) reg.arrives = 0;
        reg.porcentajeEfectividad = (reg.inscritos ? Math.round(reg.asisten / reg.inscritos * 100) + '%' : '--');
        reg.porcentajeAsistencia = (evento.arrives ? Math.round(reg.asisten / evento.arrives * 100) + '%' : '--');
        return reg;
    }).sort(function (a, b) {
        if(!a.asisten) a.asisten = 0;
        if(!b.asisten) b.asisten = 0;
        return a.asisten < b.asisten ? 1 : a.asisten == b.asisten ? 0 : -1
    }).map(function (rp, indice) {
        rp.indice = indice + 1;
        return rp;
    });
}

IniciarTortaEfectividad = function () {
    var colores = [];
    var rps = TablaRPs();
    var colores = [
    "#7e3838", "#7e6538", "#7c7e38", "#587e38",
    "#387e45", "#387e6a", "#386a7e", "#f00",
    "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];
    var contenido = [],
        color = 0;
    rps.forEach(function (rp) {
        if (rp.asisten) {
            contenido.push({
                "label": rp.nombre,
                "value": Number(rp.asisten),
                "color": colores[color++],
                "caption": rp.asisten + " de " + rp.inscritos
            });
        }
    });
    if (contenido.length == 0) return false;
    var pie = new d3pie("torta-efectividad", {
        "footer": {
            "text": "Potenciado por Beenken https://github.com/benkeen/d3pie",
            "color": "#444",
            "fontSize": 11,
            "location": "bottom-center"
        },
        "size": {
            "canvasHeight": 400,
            "canvasWidth": $('#torta-efectividad').width(),
            "pieOuterRadius": "88%"
        },
        "data": {
            "content": contenido
        },
        "labels": {
            "outer": {
                "pieDistance": 32
            },
            "inner": {
                "format": "percentage"
            },
            "mainLabel": {
                "color": "#fff",
                "font": "verdana"
            },
            "percentage": {
                "color": "#fff",
                "font": "verdana",
                "decimalPlaces": 0
            }
        },
        tooltips: {
            enabled: true,
            type: "caption"
        }
    });
}