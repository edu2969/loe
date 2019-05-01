Handlebars.registerHelper("timeFormat", function(ms) {
    var hours = Math.floor( ms / 3600000 );
    hours = hours + 12 * (hours < 12?1:-1);
    var minutes = Math.floor( Math.floor((ms - Math.floor( ms / 3600000 ) * 1000 * 60 * 60)) / 1000 / 60 );
    
    var str = ( hours < 10 ? "0" + hours : hours ) + ":" 
        + ( minutes < 10 ? "0" + minutes : minutes )  + ":00";
    return str;
});