// Navegacion
AddNav = function (path) {
  var navObj = Session.get('NavigationPath');
  if(!navObj) navObj = [];
  navObj.push(path);
  Session.set('NavigationPath', navObj);
}

NavBack = function () {
  var navObj = Session.get('NavigationPath');
  if(!navObj) return false;
  var path = navObj.pop();
  if(path!='/bi') {
    Router.go(path);
  }
  Session.set('NavigationPath', navObj)
}

MaskPrice = function (valor, decimales, simbolo) {
  if(valor==undefined) return "∞"
  var parts = (valor + "").split("."),
    main = parts[0],
    len = main.length,
    output = "",
    i = len - 1

  while (i >= 0) {
    output = main.charAt(i) + output;
    if ((len - i) % 3 === 0 && i > 0) {
      output = "." + output
    }
    --i
  }
  // put decimal part back
  if (parts.length > 1 && decimales) {
    output += "," + parts[1].substring(0, decimales < len ? decimales : len)
  }
  return (Number(valor)<0?'-':'') + (simbolo?simbolo + ' ':'') + output.replace('-', '')
}

// Handlebars
Handlebars.registerHelper("simpleDate", function (d) {
  if( !d ) return 'null'
  return ( ( d.getDate() + 1 ) < 10 ? '0' + ( d.getDate() + 1 ) : ( d.getDate() + 1 ) ) + '/'
    + ( ( d.getMonth() + 1 ) < 10 ? '0' + ( d.getMonth() + 1 ):( d.getMonth() + 1 ) ) + '/'
    + ( ( d.getYear() - 100 ) < 10 ? '0' + ( d.getYear() - 100 ) : ( d.getYear() - 100 ) )
})

Handlebars.registerHelper("inputDate", function (d) {
  if( !d ) return 'null'
  return d.getFullYear() + '-'
    + ( ( d.getMonth() + 1 ) < 10 ? '0' + ( d.getMonth() + 1 ):( d.getMonth() + 1 ) ) + '-'
    +  ( ( d.getDate() + 1 ) < 10 ? '0' + ( d.getDate() + 1 ) : ( d.getDate() + 1 ) )
})

Handlebars.registerHelper("formatDate", function(d, m) {
  return d instanceof Date ? moment(d).format(m) : 'Fecha invalida'
})

Handlebars.registerHelper("formatoHora", function(ms) {
  return moment(ms).format('HH:mm')
})


Handlebars.registerHelper("formatoHoraNocturno", function(ms) {
  return HoraNocturna(ms)
})


Handlebars.registerHelper("selectedEval", function (idOption, idSelected) {
  if(idOption==idSelected) return 'selected'
  return ''
})

Handlebars.registerHelper("currencyFormat", function (valor, decimales) {
  return MaskPrice(valor, decimales)
})
