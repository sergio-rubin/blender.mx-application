# NIDO / Zapopan

Aplicación del reto de Blender.mx para presentar un departamento y captar interesados. El frontend es una SPA en Vue 3; Django REST Framework persiste los registros en PostgreSQL y protege la pantalla administrativa con sesión de personal.

## Qué incluye

- Ficha exacta: Zapopan, Jalisco; `$3,450,000 MXN`; 2 recámaras; 2 baños; 95 m²; 1 estacionamiento; alberca y gimnasio.
- Formulario accesible con validación cliente/servidor, protección CSRF, honeypot, límites de frecuencia y confirmación “Gracias, te contactaremos pronto”.
- Pantalla `/interesados` protegida, ordenada del registro más reciente al más antiguo y con búsqueda por nombre.
- Galería responsiva, estados skeleton, loaders sin saltos de layout, transiciones con preferencia de movimiento reducido y respuesta háptica progresiva cuando el dispositivo la soporta.
- SEO técnico: metadata social, URL canónica, JSON-LD, `robots.txt`, `sitemap.xml` y página administrativa `noindex`.
- PostgreSQL local en el servidor (`127.0.0.1:5432`), cookies seguras, Argon2, CORS explícito, HSTS y configuración Nginx/systemd.

## Desarrollo local

```bash
cp .env.example .env
make install
make migrate
make dev-api
```

En otra terminal:

```bash
make dev-web
```

Para una prueba rápida sin PostgreSQL se puede declarar temporalmente `DATABASE_URL=sqlite:////tmp/blender-application.sqlite3`; producción rechaza cualquier motor que no sea PostgreSQL.

## Calidad

```bash
make check
```

El comando ejecuta lint y typecheck de Vue, pruebas unitarias de frontend, pruebas de API, Ruff y build de producción. Los tests E2E están disponibles con `cd frontend && npm run test:e2e`.

