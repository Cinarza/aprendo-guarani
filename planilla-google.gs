// Jaguarete'i: recibe los resultados de la app y los anota en esta planilla.
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var fecha = new Date(d.ts || Date.now());
  if (d.type === 'leccion') {
    var sh = hoja(ss, 'Lecciones', ['Fecha', 'Jugador', 'Nivel', 'Correctas', 'Total', '% aciertos', 'XP', 'Tiempo (seg)', 'Palabras para repasar']);
    sh.appendRow([fecha, d.player, d.unitName, d.correct, d.total, Math.round(d.correct / d.total * 100), d.xp, d.seconds, (d.mistakes || []).join(', ')]);
  } else if (d.type === 'ingreso') {
    var si = hoja(ss, 'Ingresos', ['Fecha', 'Perfil', 'Resultado']);
    si.appendRow([fecha, d.player, d.ok ? 'Entró' : 'Dibujos equivocados']);
  } else {
    var sp = hoja(ss, 'Pruebas', ['Fecha', 'Mensaje']);
    sp.appendRow([fecha, 'Conexión correcta: ' + (d.player || '')]);
  }
  return ContentService.createTextOutput('ok');
}
function hoja(ss, nombre, titulos) {
  var sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  if (sh.getLastRow() === 0) { sh.appendRow(titulos); sh.setFrozenRows(1); sh.getRange(1, 1, 1, titulos.length).setFontWeight('bold'); }
  return sh;
}
