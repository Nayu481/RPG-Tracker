# RPG Tracker

Productividad con misiones, hábitos y objetivos. React + Vite; autenticación y datos en Supabase. El progreso del juego se guarda en PostgreSQL, no en localStorage.

## Desarrollo

```sh
npm ci
npm run dev
```

Configura `.env.local` (no se sube a Git):

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

Usa el mismo proyecto Supabase en localhost y en los secrets de GitHub Actions. Nunca pongas claves secretas, `service_role` ni contraseñas de PostgreSQL en variables `VITE_`.

## Base de datos

Ejecuta las migraciones pendientes, en orden, en el SQL Editor de Supabase:

1. `supabase/migrations/001_initial.sql`: tablas, RLS y creación automática del perfil. **No repetir si ya se ejecutó.**
2. `supabase/migrations/002_game_backend.sql`: RPC de recompensas y progreso.
3. `supabase/migrations/003_secure_persistence.sql`: permisos por columna, recompensas según dificultad y rachas por fecha de America/Santiago.

La migración 003 es necesaria: RLS por sí sola no impide que un usuario modifique su propia XP. Las recompensas y los estados de finalización solo se modifican desde las funciones del servidor. Esta migración también normaliza las recompensas de las filas existentes según su dificultad.

El frontend no ejecuta migraciones. Publicar en GitHub Pages tampoco las aplica. Los datos antiguos del juego que existan en localStorage no se importan automáticamente.

## Validación

```sh
npm run lint
npm run build
```

Las pruebas SQL usan PostgreSQL local mediante PGlite, sin conectarse al proyecto Supabase. Para ejecutarlas sin añadir dependencias a la aplicación:

```sh
npm install --prefix /tmp/rpg-validation --no-save @electric-sql/pglite
PGLITE_MODULE=/tmp/rpg-validation/node_modules/@electric-sql/pglite/dist/index.js npm test
```

Cubren RLS entre dos usuarios, CRUD, protección de recompensas, repetición de completados, niveles, progreso de objetivos y hábitos diarios. Las pruebas de mapeo cubren medianoche y cambio de horario de Chile.

Para validar el despliegue real:

1. Inicia sesión y crea «Terminar tarea de matemáticas». Recarga y comprueba que permanece.
2. Completa la misión; comprueba XP, oro y contador después de recargar.
3. Cierra sesión e inicia con otra cuenta: no debe ver esos datos.
4. Inicia con la primera cuenta en GitHub Pages u otro dispositivo: debe recuperar el mismo progreso.
5. Crea un objetivo con cuatro misiones; verifica 25/50/75/100% y su recompensa al cerrarlo.
6. Completa un hábito; no debe entregar otra recompensa ese mismo día.

## Publicación

GitHub Actions publica `dist/` al hacer push a `main`. Se mantiene `base: "/RPG-Tracker/"` y los secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

Supabase Auth debe permitir localhost y `https://nayu481.github.io/RPG-Tracker/` en sus URLs de redirección.
