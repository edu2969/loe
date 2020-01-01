function CheckRut(rutSinGuion) {
  if (rutSinGuion.toString().trim() != '') {
    var caracteres = new Array();
    var serie = new Array(2, 3, 4, 5, 6, 7);
    var dig = rutSinGuion.toString().substr(rutSinGuion.toString().length - 1, 1);
    rutSinGuion = rutSinGuion.toString().substr(0, rutSinGuion.toString().length - 1);

    for (var i = 0; i < rutSinGuion.length; i++) {
      caracteres[i] = parseInt(rutSinGuion.charAt((rutSinGuion.length - (i + 1))));
    }

    var sumatoria = 0;
    var k = 0;
    var resto = 0;

    for (var j = 0; j < caracteres.length; j++) {
      if (k == 6) {
        k = 0;
      }
      sumatoria += parseInt(caracteres[j]) * parseInt(serie[k]);
      k++;
    }

    resto = sumatoria % 11;
    dv = 11 - resto;

    if (dv == 10) {
      dv = "K";
    } else if (dv == 11) {
      dv = 0;
    }

    if (dv.toString().trim().toUpperCase() == dig.toString().trim().toUpperCase())
      return true;
    else
      return false;
  } else {
    return false;
  }
}

Meteor.methods({
  LogHT(accion, trackip) {
    var doc = {
      accion: accion,
      fecha: new Date()
    }
    if (Meteor.userId()) {
      doc.userId = Meteor.userId();
    }
    if (trackip) {
      doc.trackip = this.connection.clientAddress;
    }
    LogComportamientos.insert(doc);
  },
  registerNewUser: function (username, name, email, password, role, isRPAdmin, privilegiado) {
    var userId = Accounts.createUser({
      username: username,
      email: email,
      password: password,
      profile: {
        name: name,
        role: role,
        isRPAdmin: isRPAdmin,
        privilegiado: privilegiado
      }
    });
  },
  setPassword: function (userId, password) {
    Accounts.setPassword(userId, password);
  },
  processListImport: function (entradas, eventId) {
    var eventSelected = Events.findOne(eventId);
    var ms = eventSelected.closeTime;
    var horas = Math.floor(ms / 3600000);
    var minutos = Math.floor((ms - horas * 3600000) / 60000);
    var fechaCierre = moment(eventSelected.date).hours(12).minutes(0).add(horas, 'h').add(minutos, 'm');
    /*if (moment() > fechaCierre) {
      messages = {
        danger: []
      };
      messages.danger.push({
        item: 'La lista ha cerrado. Lo sentimos'
      });
      return messages;
    }*/

    var totalImported = 0;
    var messages;
    for (var i = 0; i < entradas.length; i++) {
      if (entradas[i].length > 0) {
        var datos = entradas[i].trim().split(" ");
        // Saca guión y espacios
        var rut = datos[datos.length - 1].replace("-", "");
        // Saca todos los puntos            
        rut = rut.split('.').join("");

        // Validando nombres (no contengan números
        if (!/^[a-zA-Z]+$/.test(datos[0]) && !/^[a-zA-Z]+$/.test(datos[1])) {
          if (!messages) messages = {
            success: []
          };
          if (!messages.success) messages.success = [];
          messages.success.push({
            item: entradas[i] + ' [Nombre irreconocible]'
          });
        }

        if (CheckRut(rut)) {
          // VALIDAR SI ESTA INSCRITO EN EL EVENTO (Find)
          var rutNoDv = rut.substr(0, rut.length - 1);
          var guest = Guests.findOne({
            rut: rutNoDv
          });

          if (!guest) {
            guestId = Guests.insert({
              rut: rutNoDv,
              names: datos[0] + ' ' + datos[1],
              asistencias: 0,
              inscripciones: 0
            });
            guest = Guests.findOne(guestId);
          }

          if (guest.baneado) {
            if (!messages) messages = {
              danger: []
            };
            if (!messages.danger) messages.danger = [];
            messages.danger.push({
              item: guest.names + ' baneado ' + (guest.observacion ? guest.observacion : '(Sin razón descrita)')
            });
          } else {
            var attender = Attenders.findOne({
              eventId: eventId,
              guestId: guest._id
            });
            if (attender) {
              var rp = Meteor.users.findOne(attender.rpId);
              if (!messages) messages = {
                warning: []
              };
              if (!messages.warning) messages.warning = [];
              if (rp) {
                messages.warning.push({
                  item: guest.names + ' inscrito por: ' + rp.username
                });
              }
            } else {
              var rpId = Meteor.userId();
              if (rpId) {
                var attenderId = Attenders.insert({
                  eventId: eventId,
                  rpId: rpId,
                  guestId: guest._id,
                  fecha: new Date()
                });
                if (!messages) messages = {
                  success: []
                };
                if (!messages.success) messages.success = [];
                messages.success.push({
                  item: entradas[i] + ' OK'
                });
                totalImported++;
                Guests.update({
                  _id: guest._id
                }, {
                  $set: {
                    inscripciones: guest.inscripciones + 1
                  }
                });
              } else {
                if (!messages) messages = {
                  danger: []
                };
                if (!messages.danger) messages.danger = [];
                messages.danger.push({
                  item: 'Se perdió la sesión. Por favor, autentíquese nuevamente'
                });
              }
            }


          }
        } else {
          if (!messages) messages = {
            danger: []
          };
          if (!messages.danger) messages.danger = [];
          messages.danger.push({
            item: 'Rut erroneo: [' + entradas[i] + ']'
          });
          if (!messages.wrongRuts)
            messages.wrongRuts = '';
          messages.wrongRuts = messages.wrongRuts + entradas[i] + '\n';
        }
      }
    }

    if (totalImported > 0) {
      // Actualizacion Eventos
      if (!eventSelected.total) eventSelected.total = 0;
      Events.update({
        _id: eventId
      }, {
        $inc: {
          "total": totalImported
        }
      });
      // Actualizacion BI
      var reg = BIRPs.findOne({
        eventoId: eventId,
        rpId: Meteor.userId()
      });
      if (!reg) {
        BIRPs.insert({
          eventoId: eventId,
          rpId: Meteor.userId(),
          asisten: 0,
          inscritos: totalImported
        });
      } else {
        BIRPs.update({
          _id: reg._id
        }, {
          $inc: {
            inscritos: totalImported
          }
        })
      }
    }

    return messages;
  },
  updateUser: function (userCaller, userId, name, username, email, isRPAdmin, privilegiado) {
    var u = Meteor.users.findOne(userCaller);
    Meteor.users.update({
      _id: userId
    }, {
      $set: {
        "profile.name": name,
        username: username,
        "profile.isRPAdmin": isRPAdmin,
        "profile.privilegiado": privilegiado,
        "emails": [{
          address: email
        }]
      }
    });
  },
  eliminarUsuario: function (userId, accountId) {
    Meteor.users.update({
      _id: accountId
    }, {
      $set: {
        "profile.role": 5
      }
    });
  },
  reintegrarUsuario: function (accountId, role) {
    Meteor.users.update({
      _id: accountId
    }, {
      $set: {
        "profile.role": role
      }
    });
  },
  /*reiniciarEventos: function () {
    // Reiniciar el evento y borra sus elementos
    var eventos = Events.find();
    eventos.forEach(function (e) {
      var asistentes = Attenders.find({
        eventId: e._id
      });
      asistentes.forEach(function (a) {
        Attenders.remove(a._id);
      });
      var regs = BIRPs.find({
        eventoId: e._id
      });
      regs.forEach(function (r) {
        BIRPs.remove(r._id);
      });
      Events.update({
        _id: e._id
      }, {
        $set: {
          total: 0,
          arrives: 0,
          averageCheckTime: 0,
          female: 0,
          male: 0
        }
      });
    });
  },*/
  cargarDatos: function () {
    var ids = []
    _BU_eventos.forEach(function (e) {
      Events.insert(e);
    });

    _BU_guests.forEach(function (doc) {
      Guests.insert(doc);
    })

    _BU_attenders.forEach(function (doc) {
      doc.rpId = ids[Math.floor(Math.random() * ids.length)];
      Attenders.insert(doc);
    })
  },
  testDate: function () {},
  eliminarEvento: function (eId) {
    var asistentes = Attenders.find({
      eventId: eId
    });
    asistentes.forEach(function (doc) {
      Attenders.remove(doc._id);
    });
    Events.remove(eId);
  },
  generarBI: function (eventoId) {
    var selector = eventoId ? {
      _id: eventoId
    } : {};

    BIRPs.find(eventoId ? {
      eventId: eventoId
    } : {}).forEach(function (reg) {
      BIRPs.remove({
        _id: reg._id
      });
    });

    var evnts = Events.find(selector);
    evnts.forEach(function (evnt) {
      evnt.total = 0;
      evnt.arrives = 0;

      var attenders = Attenders.find({
        eventId: evnt._id
      });

      attenders.forEach(function (a) {
        var reg = BIRPs.findOne({
          eventoId: evnt._id,
          rpId: a.rpId
        });
        if (reg) {
          BIRPs.update({
            _id: reg._id
          }, {
            $set: {
              inscritos: reg.inscritos + 1,
              asisten: reg.asisten + (a.checktime ? 1 : 0)
            }
          });
        } else {
          BIRPs.insert({
            eventoId: evnt._id,
            rpId: a.rpId,
            inscritos: 1,
            asisten: a.checktime ? 1 : 0
          });
        }
        evnt.total = evnt.total + 1;
        evnt.arrives = evnt.arrives + (a.checktime ? 1 : 0);
      });

      Events.update({
        _id: evnt._id
      }, {
        $set: {
          total: evnt.total,
          arrives: evnt.arrives
        }
      });
    });
  },
  RegistrarIngreso(rut, baneado) {
    if (!rut) return false;
    var messages;

    var fecha = FechaEventoActual();
    var desde = moment(fecha).startOf('day').toDate();
    var hasta = moment(fecha).add(1, 'd').startOf('day').toDate();
    var evnt = Events.findOne({
      date: {
        $gte: desde,
        $lt: hasta
      }
    });

    var guest = Guests.findOne({
      rut: rut
    });

    if (!guest) {
      if (!messages) messages = {
        danger: []
      };
      if (!messages.danger) messages.danger = [];
      messages.danger.push({
        item: rut + ' inexistente'
      });
      return messages;
    }

    var attender = Attenders.findOne({
      eventId: evnt._id,
      guestId: guest._id
    })

    if (!attender) {
      if (!messages) messages = {
        danger: []
      };
      if (!messages.danger) messages.danger = [];
      messages.danger.push({
        item: rut + ' no inscrito'
      });
      return messages;
    }

    var invitado = Guests.findOne({
      _id: guest._id
    });

    if (baneado) {
      invitado.baneado = true;
      Guests.update({
        _id: guest._id
      }, {
        $set: {
          baneado: true
        }
      });
    }

    if (invitado && invitado.baneado) {
      if (!messages) messages = {
        warning: []
      };
      if (!messages.warning) messages.warning = []
      messages.warning.push({
        item: rut + ' inexistente (O.o)'
      });

      return messages;
    }

    if (attender.checktime) {
      if (!messages) messages = {
        danger: []
      };
      if (!messages.danger) messages.danger = []
      var hora = HoraNocturna(attender.checktime)
      messages.danger.push({
        item: guest.names + ' ya ingresó ' + hora
      })
      return messages;
    }

    /*if (!guest.gender) {
      Session.set('GuestToRegister', guest)
      if (!messages) messages = {
        warning: []
      }
      if (!messages.warning) messages.warning = []
      messages.warning.push({
        item: 'Ingrese genero a ' + guest.names
      })
      return messages;
    }*/

    if (!messages) messages = {
      success: []
    };
    if (!messages.success) messages.success = []
    var nombreRP = Meteor.users.findOne({
      _id: attender.rpId
    }).profile.name
    messages.success.push({
      item: 'Bienvenid' + (guest.gender == 'F' ? 'a ' : 'o ') + guest.names + ' (RP: ' + nombreRP + ')'
    });

    Guests.update({
      _id: guest._id
    }, {
      $set: {
        "gender": guest.gender,
        "asistencias": (guest.asistencias ? guest.asistencias + 1 : 1)
      }
    });
    var today = new Date()
    // @TODO: checktime debe contener la hora en ms a partir de las 12:00 am.
    var checktime = today.getTime() - FechaEventoActual().toDate().getTime()
    Attenders.update({
      _id: attender._id
    }, {
      $set: {
        "checktime": checktime
      }
    });

    // BUSINESS-INTELIGENCE SECTION (BI)
    // Contador de inscritos, arrivos, mujeres y hombres
    var event = Events.findOne({
      _id: attender.eventId
    });
    event.arrives++;
    if (guest.gender == 'F') {
      if (!event.female) event.female = 0;
      event.female++;
    } else if (guest.gender == 'M') {
      if (!event.male) event.male = 0;
      event.male++;
    }

    // Calculador de hora promedio de llegada
    var averageCheckTime = (checktime + evnt.arrives * evnt.averageCheckTime) / (evnt.arrives + 1);

    Events.update({
      _id: event._id
    }, {
      $set: {
        "arrives": event.arrives,
        "male": event.male,
        "female": event.female,
        "averageCheckTime": averageCheckTime
      }
    });

    // BI - Incrementa el registro de asistencia
    var bireg = BIRPs.findOne({
      eventoId: event._id,
      rpId: attender.rpId
    });
    BIRPs.update({
      _id: bireg._id
    }, {
      $inc: {
        asisten: 1
      }
    });

    return messages;
  },
  ObtenerVistaBI(desde, hasta) {
    var fechas = [];
    var rps = [];
    Events.find({
      date: {
        $gte: desde,
        $lt: hasta
      }
    }).forEach(function (e, indice) {
      fechas.push({
        indice: indice,
        eventoId: e._id,
        fiesta: e.name,
        asistentes: e.arrives
      });
    });
    
    fechas.forEach(function(fecha) {
      var regs = BIRPs
        .find({
          eventoId: fecha.eventoId
        })
        .forEach(function (reg) {
          var indice = 0;          
          var rp = rps.find(function (rp) {
            return rp.rpId == reg.rpId;
          });
          if (!rp) {
            rp = {
              indice: rps.length,
              rp: reg.rpId ? Meteor.users.findOne({
                _id: reg.rpId
              }).profile.name : "???",
              rpId: reg.rpId,
              stats: fechas.map(function(f) {
                return {
                  resumen: '0 / 0',
                  pe: '--',
                  pa: '--'
                }
              })
            }
            indice = rps.length;
          } else {            
            indice = rp.indice;
          }
          
          
          rp.stats[fecha.indice].resumen = reg.asisten + " / " + reg.inscritos;
          rp.stats[fecha.indice].pe = reg.asisten 
            ? Math.round(reg.asisten / reg.inscritos * 100) + '%' 
          : '--';
          rp.stats[fecha.indice].pa = reg.asisten
            ? Math.round(reg.asisten / fecha.asistentes * 100) + '%' 
          : '--'; 
          
          rps[indice] = rp;            
        });
    });
    return {
      rps: rps.map(function(rp) {
        delete rp.indice;
        delete rp.rpId;
        stats = rp.stats.map(function(stat) {
          delete stat.indice;
          delete stat.eventoId;
          return stat;
        })
        return rp;
      }),
      fechas: fechas
    }
  },

  // Logs
  GetLogs(pagina) {
    let porpagina = 50;
    var PALETA_COLORES = [
    "#7e3838", "#7e6538", "#7c7e38", "#587e38",
    "#387e45", "#387e6a", "#386a7e", "#f00",
    "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];
    var ips = [];
    return LogComportamientos.find({}, {
      sort: {
        fecha: -1
      },
      limit: porpagina,
      skip: porpagina * pagina
    }).map(function (log) {
      // Busca el color segun la IP
      var indice = ips.indexOf(log.trackip);
      var color;
      if (indice != -1) {
        color = PALETA_COLORES[indice];
      } else {
        indice = ips.push(log.trackip);
        color = PALETA_COLORES[ips.length - 1];
      }
      let user = log.userId ? Meteor.users.findOne({
        _id: log.userId
      }).profile.name : false;
      var log = {
        accion: log.accion,
        fecha: moment(log.fecha).format("ddd DD/MM/YY HH:mm:ss"),
        ip: log.trackip,
        color: color
      }
      if (user) {
        log.rp = user;
      }
      return log;
    });
  }
});

