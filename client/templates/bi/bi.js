var EDITING_KEY = 'bi';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

InicializarTorta = function () {
  return false;
  // Paleta para torta
  var PALETA_COLORES = [
    "#7e3838", "#7e6538", "#7c7e38", "#587e38",
    "#387e45", "#387e6a", "#386a7e", "#f00",
    "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];
  // Obtencion de la data
  var regs = [];

  var contenido = [];
  var indice = 0;
  regs.forEach(function (reg) {
    if (!contenido[reg.rp._id]) {
      contenido[reg.rp._id] = {
        label: reg.rp.profile.name,
        value: reg.asisten,
        color: PALETA_COLORES[indice],
        caption: reg.asisten + ' de ' + reg.inscritos,
        asisten: reg.asisten,
        total: reg.total
      };
      indice++;
    } else {
      contenido[reg.rp._id].asisten += reg.asisten;
      contenido[reg.rp._id].total += reg.total;
      contenido[reg.rp._id].caption = reg.asisten + ' de ' + reg.inscritos;
    }
  });
  var pieArray = [];
  for (key in contenido) {
    pieArray.push({
      label: contenido[key].label,
      value: contenido[key].value,
      color: contenido[key].color,
      caption: contenido[key].caption
    });
  }
  // Creacion de la torta
  var pie = new d3pie("torta-efectividad", {
    "footer": {
      "text": "Potenciado por Beenken https://github.com/benkeen/d3pie",
      "color": "#999",
      "fontSize": 11,
      "location": "bottom-center"
    },
    "size": {
      "canvasHeight": 400,
      "canvasWidth": $('#torta-efectividad').width(),
      "pieOuterRadius": "88%"
    },
    "data": {
      "content": pieArray
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

Template.bi.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold();
    listRenderHold.release();
    firstRender = false;
  }

  var fechaDesde = moment().add(-2, 'months').toDate();
  var fechaHasta = new Date();

  $('#input-desde').datetimepicker({
    format: 'DD/MM/YY',
    defaultDate: fechaDesde
  });

  $('#input-hasta').datetimepicker({
    format: 'DD/MM/YY',
    defaultDate: fechaHasta
  });
  
  Session.set("FiltroBI", {
    resumen: true
  });

  Meteor.call("ObtenerVistaBI",
    fechaDesde, fechaHasta,
    function (err, resp) {
      if (!err) {
        Session.set("VistaBI", resp);
        InicializarTorta();
      }
    });  
};

Template.bi.helpers({
  tabla() {
    return Session.get("VistaBI");
  },
  filtro() {
    return Session.get("FiltroBI");
  }
});

Template.bi.events({
  "click #btn-refrescar": function (e) {
    var desde = moment($('#input-desde').val(), "DD/MM/YY").toDate();
    var hasta = moment($('#input-hasta').val(), "DD/MM/YY").toDate();
    Meteor.call("ObtenerVistaBI", desde, hasta, function (err, resp) {
      if (!err) {
        Session.set("VistaBI", resp);
        InicializarTorta();
      }
    });
  },
  "click input[type='checkbox']"(e) {
    var tipo = e.currentTarget.attributes.name.value;
    var filtro = Session.get("FiltroBI");
    filtro[tipo]  = !filtro[tipo];
    Session.set("FiltroBI", filtro);
  }
})
