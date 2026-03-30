Deploy temporal a Render — pasos rápidos

1. Pre-requisitos

- Cuenta en https://render.com
- Repositorio Git con tu proyecto (GitHub/GitLab)

2. Subir cambios al repo

- Asegúrate de commitear y pushear el `Dockerfile` y `render.yaml`.

3. Crear servicio en Render

- En Render, crea un nuevo `Web Service` y elige "Deploy from a Dockerfile".
- Conecta tu repo y selecciona la rama (ej. `main`).
- O usa el `render.yaml` para crear el servicio automáticamente desde la UI (Importar desde repo).

4. Variables de entorno (IMPORTANTE)

- En el panel del servicio, añade env vars (Settings → Environment):
  - `NODE_ENV=production`
  - `PORT=3000`
  - `SESSION_SECRET` (valor fuerte)
  - `DATABASE_URL` (Render te dará la URL del DB creado o usa la proporcionada por el servicio de Postgres gestionado)
  - `MERCADO_PAGO_ACCESS_TOKEN` si usas pagos
  - `REQUEST_LIMIT=100kb`
  - `TRUST_PROXY=1`

5. Base de datos

- En Render crea una Postgres desde la sección Databases o usa `render.yaml`.
- Copia la `DATABASE_URL` y pégala en las env vars del servicio.
- Ejecuta las migraciones/crea tablas según tu app (puedes usar `psql` o un script SQL).

6. Acceder al deploy temporal

- Render te entregará un dominio temporal `https://loreweb-backend.onrender.com` con HTTPS.
- Prueba las rutas: `/`, `/productos`, `/auth/registro`.

7. Detener/Eliminar el deploy

- Desde el panel de Render puedes pausar o eliminar el servicio y la base de datos cuando termines las pruebas.
- Si eliminaste la DB y quieres conservar datos, haz backup antes.

Notas

- El plan gratuito tiene limitaciones (sleep/idle, conexiones, etc.). Para pruebas rápidas es suficiente.
- Si prefieres no usar Docker, en el panel de Render puedes elegir "Node" runtime y configurar build/start commands.
