# Jaguarete'i · Aprendé guaraní

App para que un niño de 2.º grado aprenda guaraní con lecciones cortas (estilo Duolingo):
17 niveles y un nivel extra, 4 repasos de bloque, repaso de palabras difíciles, 4 juegos,
dibujos, traducción al castellano, puntos XP, racha diaria y coronas.

## Contenido
- **Bloque 1 · Primeros pasos:** saludos, números, colores, familia → Repaso 1
- **Bloque 2 · Mi mundo:** animales, cuerpo, opuestos, cómo me siento → Repaso 2
- **Bloque 3 · Mi casa y mi escuela:** naturaleza, comidas, mi casa, la escuela → Repaso 3
- **Bloque 4 · Hablo en guaraní:** lo que hago, más acciones, los días, frases, el cuento → Repaso 4
- **Extra · Mi clase:** las palabras del cuaderno de la escuela

Cada nivel se puede repetir hasta 3 coronas; con cada corona hay más ejercicios de escribir.
La tarjeta **Repaso para vos** arma una lección con las palabras que más le cuestan a cada estudiante.

## Juegos
- **Memoria del ñandutí:** dar vuelta tarjetas y unir dibujo con palabra.
- **Lluvia de palabras:** tocar la gota con la palabra correcta antes de que llegue al suelo.
- **Letra por letra:** armar cada palabra con las letras del guaraní (ch, mb, nd, ', ã…).
- **¡Pya'e!:** responder rápido Hẽe o Nahániri: ¿el dibujo es esa palabra?

Sitio: https://cinarza.github.io/aprendo-guarani/

## Base de datos central (una sola para todos los dispositivos)
Los estudiantes, las lecciones y los ingresos se guardan en **una planilla de Google del adulto**.
Así se puede entrar desde cualquier celular o computadora y el adulto ve todo en un solo lugar.

Configuración (una sola vez, desde una computadora):
1. Entrá a `sheets.new` con tu cuenta de Google. Ponele de nombre *Jaguarete'i – base de datos*.
2. Menú **Extensiones → Apps Script**. Borrá lo que aparece y pegá todo el contenido de `servidor-google.gs`. Tocá **Guardar**.
3. **Implementar → Nueva implementación**. En el engranaje elegí **Aplicación web**.
   *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier usuario**. Tocá **Implementar** y autorizá con tu cuenta.
   (Si aparece "Google no verificó esta app", tocá *Configuración avanzada → Ir a …*: es tu propio script.)
4. Copiá la **URL de la aplicación web** (termina en `/exec`) y pegala en `config.js`, entre las comillas.

La planilla crea sola sus hojas: **Estudiantes**, **Lecciones**, **Ingresos** y **Ajustes**.
El PIN y las claves de los estudiantes se guardan cifrados.

**Actualizar el servidor** (por ejemplo, a la versión 2, que recuerda las palabras aprendidas y permite cerrar los registros):
pegá el `servidor-google.gs` nuevo en Apps Script, Guardar, y después
Si más adelante cambiás el código del servidor: **Implementar → Gestionar implementaciones → editar → Versión nueva**, así la URL sigue siendo la misma.

## Inicio de sesión
La primera vez que se abre, el adulto crea su **PIN** (4 números).
Después, la pantalla de inicio ofrece dos opciones:

- **Soy estudiante**: escribe su nombre y toca sus 3 animales secretos en orden.
  Si es su primera vez, toca **Registrarme**: escribe su nombre, elige su animal y sus 3 animales secretos (y los repite una vez).
- **Soy adulto**: escribe el PIN y entra al panel de resultados.

La sesión del estudiante se cierra con **Salir** o tras 20 minutos sin uso.
Después de 5 intentos fallidos, el estudiante espera 30 segundos y el adulto 5 minutos.

## Resultados
En el panel ves los resultados por estudiante, los ingresos y registros
(incluidos los intentos con animales equivocados y nombres no registrados),
y podés agregar, cambiar o quitar estudiantes, cambiar el PIN y borrar progreso.

**¿Te olvidaste el PIN?** En la planilla: Extensiones → Apps Script → Configuración del proyecto →
Propiedades del script → borrá la propiedad `pin`. La app te pide uno nuevo y no se pierde nada.

## WhatsApp
En el panel podés guardar tu número (con código de país, por ejemplo `595981123456`).
El botón *Enviar este informe por WhatsApp* arma el resumen, y al terminar cada lección el niño
puede tocar *Contale a tu familia*.
