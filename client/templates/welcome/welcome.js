var EDITING_KEY = 'welcome'
Session.setDefault(EDITING_KEY, false)

var firstRender = true
var listRenderHold = LaunchScreen.hold()
listFadeInHold = null

Template.welcome.rendered = function () {
  if (firstRender) {
    listFadeInHold = LaunchScreen.hold()
    listRenderHold.release()
    firstRender = false
  }

  updateTime()
  setInterval(updateTime, 1000)

  if (document.getElementById('guest-rut')) {
    document.getElementById('guest-rut').value = '';
    document.getElementById('guest-rut').focus();
  }
  
  Session.set('ImportMessages', false);
  Session.set('GuestToRegister', false);
  Session.set("Bloqueado", false);
  
  $(window).on('keydown', function(e){
    if(e.which==32) {
      $('#btn-female').click();
    } else if(e.which==13) {
      $('#btn-male').click();
    }
  });
}

var value = 0
var cadena = new String()

function updateTime() {
  var now = moment().format('HH:mm:ss')
  $('#time').text(now)
  $('#guest-checktime').text(now)
}

function evaluar(cadena) {
  var mascara = "0123456789"
  var legible = ""
  for (var i = 0; i < cadena.length; i++) {
    if (mascara.indexOf(cadena[i]) != -1) legible = legible + cadena[i]
  }
  if (cadena.length < 7) return false;
  if (cadena.substring(0, 4) == "HTTP") {
    document.getElementById('guest-rut').value = legible.substring(0, 8);
  } else {
    document.getElementById('guest-rut').value = legible.substring(0, 8);
  }
  return true;
}

Template.welcome.helpers({
  actualEvent: function () {
    return Events.findOne();
  },
  messages: function () {
    var messages = Session.get('ImportMessages');
    return messages;
  },
  noGender: function () {
    var guest = Session.get('GuestToRegister');
    if (!guest) return true;

    if (!guest.gender) return false;
    return true;
  }
});

Template.welcome.events({
  'keyup #guest-rut': function (e) {
    var keycode = e.keyCode
    if (keycode == 13) return false;
  },
  'keydown #guest-rut': function (e) {
    var bloqueado = Session.get("Bloqueado");
    if(bloqueado) return false;
    var keycode = e.keyCode;
    if ( keycode==8 ) {
      cadena = ( cadena.length > 0 ? cadena.substring( 0, cadena.length - 1 ) : '' )
      $('#guest-rut').val(cadena);
    } else if ( keycode!=13 ) {
      cadena = cadena + String.fromCharCode(keycode);
      $('#guest-rut').val(cadena);
    } else {
      evaluar(cadena);
      Session.set("Bloqueado", true);
      var rut = Session.get('GuestToRegister');
      Meteor.call("RegistrarIngreso", $("#guest-rut").val(), $("#btn-ban img").attr("src").includes("dudosa"), function(err, resp) {
        if(!err) {
          $('#guest-rut').val('');
          $('#div-rut').show();
          $('#guest-rut').focus();
          Session.set('GuestToRegister', false);
          Session.set('ImportMessages', resp);
          Session.set("Bloqueado", false);
        }
      });
      cadena = "";
    }
    return false;
  },
  'click #btn-female': function (e) {
    /*e.preventDefault();
    var guest = Session.get('GuestToRegister');
    guest.gender = 'F';
    Session.set('GuestToRegister', guest);
    registrate();*/
  },
  'click #btn-male': function (e) {
    /*e.preventDefault();
    var guest = Session.get('GuestToRegister');
    guest.gender = 'M';
    Session.set('GuestToRegister', guest);*/
  },
  "click #btn-ban": function(e) {
    $("#btn-ban").toggleClass("btn-default btn-danger");
    var img = $("#btn-ban img").attr("src");
    if(img.includes("feliz")) {
      img = img.replace("feliz", "dudosa");
    } else {
      img = img.replace("dudosa", "feliz");
    }
    $("#btn-ban img").attr("src", img);
  }
});