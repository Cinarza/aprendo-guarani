# Jaguarete'i · Aprendé guaraní

App para que un niño de 2.º grado aprenda guaraní con lecciones cortas (estilo Duolingo):
11 niveles, dibujos, traducción al castellano, puntos XP, racha diaria y coronas.

## Publicarla con GitHub Pages
1. Creá un repositorio nuevo en GitHub (por ejemplo `aprendo-guarani`).
2. Subí `index.html` (botón **Add file → Upload files**).
3. Entrá a **Settings → Pages**, elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guardá.
4. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/aprendo-guarani/`.

## Inicio de sesión
La primera vez que se abre, el adulto crea su **PIN** (4 números).
Después, la pantalla de inicio ofrece dos opciones:

- **Soy estudiante**: escribe su nombre y toca sus 3 animales secretos en orden.
  Si es su primera vez, toca **Registrarme**: escribe su nombre, elige su animal y sus 3 animales secretos (y los repite una vez).
- **Soy adulto**: escribe el PIN y entra al panel de resultados.

La sesión del estudiante se cierra con **Salir** o tras 20 minutos sin uso.

## Resultados
En el panel ves los resultados por estudiante, los ingresos y registros
(incluidos los intentos con animales equivocados) y podés agregar, cambiar o quitar estudiantes.

## Recibir los resultados en tu celular
En **Familia → Recibir los resultados** hay dos opciones:

**Por WhatsApp.** Guardá tu número con el código de país (por ejemplo `595981123456`).
El botón *Enviar este informe por WhatsApp* arma el resumen. Si dejás marcada la opción, al
terminar cada lección el niño ve el botón *Contale a tu familia* para mandarte cómo le fue.

**Planilla de Google (automático).** Cada lección y cada ingreso se anotan solos en una planilla tuya:
1. En la computadora, entrá a `sheets.new` con tu cuenta de Google.
2. Menú **Extensiones → Apps Script**. Borrá lo que aparece y pegá el contenido de `planilla-google.gs`. Guardá.
3. **Implementar → Nueva implementación → Aplicación web**. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier usuario**. Implementá y autorizá.
4. Copiá la URL que termina en `/exec`, pegala en la app (Familia → Planilla de Google) y tocá **Enviar prueba**.

Si el dispositivo está sin internet, los resultados quedan en espera y se envían cuando vuelve la conexión.
