# Jaguarete'i · Aprendé guaraní

App para que un niño de 2.º grado aprenda guaraní con lecciones cortas (estilo Duolingo):
11 niveles, dibujos, traducción al castellano, puntos XP, racha diaria y coronas.

## Publicarla con GitHub Pages
1. Creá un repositorio nuevo en GitHub (por ejemplo `aprendo-guarani`).
2. Subí `index.html` (botón **Add file → Upload files**).
3. Entrá a **Settings → Pages**, elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guardá.
4. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/aprendo-guarani/`.

## Inicio de sesión
La primera vez, un adulto crea el **PIN** (4 números) y el perfil del niño con sus
**3 animales secretos**. Después, para entrar, el niño escribe su nombre y toca sus 3 animales en orden.
Se cierra la sesión con **Salir** o tras 20 minutos sin uso.

## Resultados
Dentro de la app tocá **Familia**. En la pantalla de ingreso, mantené apretado el yaguareté 2 segundos. En los dos casos te pide el PIN.
Ahí ves los resultados por jugador, los ingresos (incluidos los intentos con animales equivocados)
y podés agregar jugadores o cambiar sus animales.
En esta versión los resultados se guardan en el navegador del dispositivo donde juega el niño,
así que el panel muestra lo que se jugó en ese mismo dispositivo y navegador.
Con **Copiar informe** podés pasarte el resumen por WhatsApp o correo.

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
