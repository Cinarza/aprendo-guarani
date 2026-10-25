/**
 * Jaguarete'i · Base de datos central en una planilla de Google.
 *
 * Instalación (una sola vez):
 * 1. Creá una planilla nueva en sheets.new.
 * 2. Menú Extensiones → Apps Script. Borrá lo que aparece y pegá todo este archivo. Guardá.
 * 3. Arriba elegí la función "autorizar" y tocá Ejecutar → Revisar permisos.
 * 4. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario. Implementá y autorizá.
 * 5. Copiá la URL que termina en /exec y ponela en config.js de la app.
 *
 * Hojas que crea solo: Estudiantes, Lecciones, Ingresos, Ajustes.
 * El PIN del adulto y las claves de los estudiantes se guardan cifrados (no se pueden leer).
 */

var VERSION = 2;
var HEAD = {
  Estudiantes: ['id', 'Nombre', 'Animal', 'Clave (cifrada)', 'Registrado'],
  Lecciones: ['Fecha', 'Estudiante', 'Nivel', 'Correctas', 'Total', '% aciertos', 'XP', 'Tiempo (seg)', 'Palabras para repasar', 'id_estudiante', 'id_nivel', 'dia', 'id_leccion', 'Palabras bien'],
  Ingresos: ['Fecha', 'Estudiante', 'Resultado', 'id_estudiante'],
  Ajustes: ['Clave', 'Valor']
};
var STUDENT_HOURS = 6;
var MAX_STUDENTS = 30;

/** Ejecutá esta función una vez desde el editor (botón Ejecutar) para dar los permisos. */
function autorizar() {
  sheet('Estudiantes'); sheet('Lecciones'); sheet('Ingresos'); sheet('Ajustes');
  CacheService.getScriptCache().put('prueba', '1', 10);
  Logger.log('Listo: la planilla quedó preparada.');
}

function doGet() {
  return out({ ok: true, app: 'jaguaretei', version: VERSION });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad_request' }); }
  var fn = ACTIONS[req && req.action];
  if (!fn) return out({ ok: false, error: 'unknown_action' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return out(fn(req));
  } catch (err) {
    return out({ ok: false, error: 'server', message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ---------- Acciones ---------- */
var ACTIONS = {
  status: function () {
    return { ok: true, hasPin: !!prop('pin'), version: VERSION, allowReg: getSetting('allowReg') !== 'no' };
  },

  setup: function (r) {
    if (prop('pin')) return { ok: false, error: 'pin_exists' };
    if (!/^\d{4}$/.test(String(r.pin || ''))) return { ok: false, error: 'bad_pin' };
    setProp('pin', hash('pin:' + r.pin));
    return { ok: true };
  },

  register: function (r, byAdmin) {
    if (!byAdmin && getSetting('allowReg') === 'no') return { ok: false, error: 'reg_closed' };
    var name = cleanName(r.name);
    if (!name) return { ok: false, error: 'bad_name' };
    if (!validSeq(r.seq)) return { ok: false, error: 'bad_seq' };
    var list = students();
    if (list.some(function (s) { return norm(s.name) === norm(name); })) return { ok: false, error: 'name_taken' };
    if (list.length >= MAX_STUDENTS) return { ok: false, error: 'too_many' };
    var p = { id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), name: name, avatar: cleanAvatar(r.avatar) };
    sheet('Estudiantes').appendRow([p.id, safe(p.name), p.avatar, hash(p.id + ':' + r.seq.join('-')), new Date()]);
    logIn(p, 'Se registró');
    return studentOk(p);
  },

  login: function (r) {
    var name = cleanName(r.name);
    if (!name || !validSeq(r.seq)) return { ok: false, error: 'bad_request' };
    var cache = CacheService.getScriptCache();
    var key = 'fail:' + norm(name).slice(0, 80);
    var fails = Number(cache.get(key) || 0);
    if (fails >= 5) return { ok: false, error: 'locked', seconds: 30 };
    var p = studentsFull().filter(function (s) { return norm(s.name) === norm(name); })[0];
    if (!p) {
      logIn({ id: '', name: name }, 'Nombre no registrado');
      return { ok: false, error: 'no_name' };
    }
    if (hash(p.id + ':' + r.seq.join('-')) !== p.key) {
      cache.put(key, String(fails + 1), 30);
      logIn(p, 'Animales equivocados');
      return { ok: false, error: 'bad_seq', left: Math.max(0, 4 - fails) };
    }
    cache.remove(key);
    logIn(p, 'Entró');
    return studentOk({ id: p.id, name: p.name, avatar: p.avatar });
  },

  progress: function (r) {
    var pid = studentFromToken(r.token);
    if (!pid) return { ok: false, error: 'auth' };
    return { ok: true, sessions: lessons().filter(function (s) { return s.playerId === pid; }) };
  },

  saveSession: function (r) {
    var pid = studentFromToken(r.token);
    if (!pid) return { ok: false, error: 'auth' };
    var s = r.session || {};
    if (!s.id || !s.unit) return { ok: false, error: 'bad_request' };
    var sh = sheet('Lecciones');
    var n = sh.getLastRow();
    if (n > 1) {
      var ids = sh.getRange(2, 13, n - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(s.id)) return { ok: true, duplicate: true };
    }
    var p = students().filter(function (x) { return x.id === pid; })[0];
    var correct = num(s.correct), total = Math.max(1, num(s.total));
    sh.appendRow([
      new Date(num(s.ts) || Date.now()), safe(p ? p.name : (s.player || '')), safe(String(s.unitName || '')),
      correct, total, Math.round(correct / total * 100), num(s.xp), num(s.seconds),
      safe((s.mistakes || []).map(String).join(', ')), pid, "'" + String(s.unit), "'" + String(s.day || ''), "'" + String(s.id),
      safe((s.ok || []).map(String).join(', '))
    ]);
    return { ok: true };
  },

  adminLogin: function (r) {
    var cache = CacheService.getScriptCache();
    var fails = Number(cache.get('adminfail') || 0);
    if (fails >= 5) return { ok: false, error: 'locked', seconds: 300 };
    if (!prop('pin') || hash('pin:' + String(r.pin || '')) !== prop('pin')) {
      cache.put('adminfail', String(fails + 1), 300);
      return { ok: false, error: 'bad_pin' };
    }
    cache.remove('adminfail');
    var t = Utilities.getUuid();
    cache.put('a:' + t, '1', 21600);
    return { ok: true, adminToken: t };
  },

  adminData: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    return {
      ok: true,
      players: students(),
      sessions: lessons(),
      logins: ingresos(),
      waNumber: getSetting('waNumber'),
      kidShare: getSetting('kidShare') !== 'no',
      allowReg: getSetting('allowReg') !== 'no',
      version: VERSION
    };
  },

  adminSettings: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    if (r.waNumber !== undefined) setSetting('waNumber', String(r.waNumber).replace(/\D/g, '').slice(0, 15));
    if (r.kidShare !== undefined) setSetting('kidShare', r.kidShare ? 'si' : 'no');
    if (r.allowReg !== undefined) setSetting('allowReg', r.allowReg ? 'si' : 'no');
    return { ok: true };
  },

  adminSetPin: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    if (!/^\d{4}$/.test(String(r.pin || ''))) return { ok: false, error: 'bad_pin' };
    setProp('pin', hash('pin:' + r.pin));
    return { ok: true };
  },

  adminAddPlayer: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    var res = ACTIONS.register(r, true);
    if (res.ok) { delete res.token; }
    return res;
  },

  adminUpdatePlayer: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    var sh = sheet('Estudiantes');
    var data = rows('Estudiantes');
    var name = cleanName(r.name);
    if (!name) return { ok: false, error: 'bad_name' };
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]) !== String(r.id) && norm(data[i][1]) === norm(name)) return { ok: false, error: 'name_taken' };
    }
    for (var j = 0; j < data.length; j++) {
      if (String(data[j][0]) === String(r.id)) {
        sh.getRange(j + 2, 2, 1, 2).setValues([[safe(name), cleanAvatar(r.avatar)]]);
        if (r.seq) {
          if (!validSeq(r.seq)) return { ok: false, error: 'bad_seq' };
          sh.getRange(j + 2, 4).setValue(hash(r.id + ':' + r.seq.join('-')));
        }
        return { ok: true };
      }
    }
    return { ok: false, error: 'not_found' };
  },

  adminDeletePlayer: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    var sh = sheet('Estudiantes');
    var data = rows('Estudiantes');
    for (var i = data.length - 1; i >= 0; i--) if (String(data[i][0]) === String(r.id)) sh.deleteRow(i + 2);
    return { ok: true };
  },

  adminReset: function (r) {
    if (!isAdmin(r.adminToken)) return { ok: false, error: 'auth' };
    var sh = sheet('Lecciones');
    var data = rows('Lecciones');
    for (var i = data.length - 1; i >= 0; i--) {
      if (r.playerId === 'all' || String(data[i][9]) === String(r.playerId)) sh.deleteRow(i + 2);
    }
    return { ok: true };
  }
};

/* ---------- Datos ---------- */
function studentsFull() {
  return rows('Estudiantes').filter(function (x) { return x[0]; }).map(function (x) {
    return { id: String(x[0]), name: String(x[1]), avatar: String(x[2] || 'jaguar'), key: String(x[3]), created: x[4] instanceof Date ? x[4].getTime() : null };
  });
}
function students() {
  return studentsFull().map(function (s) { return { id: s.id, name: s.name, avatar: s.avatar, created: s.created }; });
}
function lessons() {
  return rows('Lecciones').filter(function (x) { return x[12]; }).map(function (x) {
    var ts = x[0] instanceof Date ? x[0].getTime() : Number(x[0]) || 0;
    return {
      id: String(x[12]), ts: ts, day: String(x[11]), unit: String(x[10]), unitName: String(x[2]),
      correct: Number(x[3]) || 0, total: Number(x[4]) || 1, xp: Number(x[6]) || 0, seconds: Number(x[7]) || 0,
      mistakes: String(x[8] || '') ? String(x[8]).split(', ') : [], ok: String(x[13] || '') ? String(x[13]).split(', ') : [],
      playerId: String(x[9]), player: String(x[1])
    };
  }).sort(function (a, b) { return a.ts - b.ts; });
}
function ingresos() {
  var data = rows('Ingresos');
  return data.slice(-300).map(function (x) {
    var res = String(x[2]);
    return { ts: x[0] instanceof Date ? x[0].getTime() : 0, p: String(x[3]), name: String(x[1]), ok: res === 'Entró' || res === 'Se registró', kind: res === 'Se registró' ? 'registro' : (res === 'Nombre no registrado' ? 'noname' : '') };
  });
}
function logIn(p, result) {
  sheet('Ingresos').appendRow([new Date(), safe(p.name), result, p.id || '']);
}
function studentOk(p) {
  var t = Utilities.getUuid();
  CacheService.getScriptCache().put('t:' + t, p.id, STUDENT_HOURS * 3600);
  return {
    ok: true, player: p, token: t,
    sessions: lessons().filter(function (s) { return s.playerId === p.id; }),
    waNumber: getSetting('waNumber'), kidShare: getSetting('kidShare') !== 'no'
  };
}
function studentFromToken(t) { return t ? CacheService.getScriptCache().get('t:' + t) : null; }
function isAdmin(t) { return !!t && CacheService.getScriptCache().get('a:' + t) === '1'; }

/* ---------- Planilla ---------- */
function book() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet(name) {
  var ss = book();
  var sh = ss.getSheetByName(name);
  if (sh && sh.getLastRow() > 0) {
    var first = sh.getRange(1, 1, 1, HEAD[name].length).getValues()[0];
    // Actualización: si faltan columnas nuevas al final, se agregan sin perder nada
    var fits = String(first[0]) === HEAD[name][0], missing = false;
    for (var c = 0; c < HEAD[name].length; c++) {
      if (String(first[c]) === '') missing = true;
      else if (missing || String(first[c]) !== HEAD[name][c]) { fits = false; break; }
    }
    if (fits && missing) {
      sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]]);
      first = HEAD[name];
    }
    if (String(first[0]) !== HEAD[name][0] || String(first[HEAD[name].length - 1]) !== HEAD[name][HEAD[name].length - 1]) {
      sh.setName(name + ' (anterior ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + ')');
      sh = null;
    }
  }
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold');
  }
  return sh;
}
function rows(name) {
  var sh = sheet(name);
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, HEAD[name].length).getValues();
}
function getSetting(k) {
  var r = rows('Ajustes').filter(function (x) { return x[0] === k; })[0];
  return r ? String(r[1]) : '';
}
function setSetting(k, v) {
  var sh = sheet('Ajustes');
  var data = rows('Ajustes');
  for (var i = 0; i < data.length; i++) if (data[i][0] === k) { sh.getRange(i + 2, 2).setValue("'" + v); return; }
  sh.appendRow([k, "'" + v]);
}

/* ---------- Utilidades ---------- */
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function setProp(k, v) { PropertiesService.getScriptProperties().setProperty(k, v); }
function hash(s) {
  var salt = prop('salt');
  if (!salt) { salt = Utilities.getUuid(); setProp('salt', salt); }
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + s, Utilities.Charset.UTF_8));
}
function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function cleanName(t) { return String(t || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20); }
function cleanAvatar(a) { return ['jaguar', 'frog', 'bird', 'butterfly', 'dog', 'cat', 'fish', 'hen'].indexOf(a) >= 0 ? a : 'jaguar'; }
function validSeq(s) { return Array.isArray(s) && s.length === 3 && s.every(function (k) { return k === Math.floor(k) && k >= 0 && k <= 8; }); }
function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function safe(t) { t = String(t || ''); return /^[=+\-@]/.test(t) ? "'" + t : t; }
