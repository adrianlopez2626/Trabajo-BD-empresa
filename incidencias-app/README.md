# Incidencias App - README

Aplicación web completa para gestionar incidencias técnicas en una empresa pequeña, creada con React, TailwindCSS, Node.js, Express y MySQL.

## Requisitos Previos

- **Node.js**: v16+ recomendado.
- **MySQL**: Servidor MySQL en ejecución.

## Configuración de la Base de Datos

El backend está configurado para conectarse a una base de datos MySQL local con las siguientes credenciales:
- Host: localhost
- Puerto: 3306
- Usuario: root
- Contraseña: admin123
- Base de datos: incidencias_app

*Si tus credenciales de MySQL son diferentes, puedes cambiarlas en `backend/.env`*.
*Nota: Si MySQL está apagado, por favor inícialo primero (ej. `sudo systemctl start mysql`).*

## Instalación y Ejecución

Sigue estos pasos en dos terminales distintas, una para el backend y otra para el frontend.

### 1. Backend (Terminal 1)

Ubicado en la carpeta del proyecto, entra a `backend` usando la ruta completa y arranca el servidor con Maven:

```bash
cd "/home/adrian/Escritorio/Trabajo BD empresa/incidencias-app/backend"
./mvnw spring-boot:run
```
*(Hibernate, al estar configurado en update, validará las tablas. El CommandLineRunner detectará si la base de datos está vacía e insertará el usuario administrador y unas incidencias de muestra automáticamente).*

### 2. Frontend (Terminal 2)

Abre otra terminal nueva, entra a la carpeta `frontend` mediante la ruta completa y levanta el entorno de React:

```bash
cd "/home/adrian/Escritorio/Trabajo BD empresa/incidencias-app/frontend"
npm install
npm run dev     # Inicia el frontend en http://localhost:5173 (o puerto asignado)
```

## Acceso a la Aplicación

Abre el enlace provisto por Vite (normalmente `http://localhost:5173`).
Puedes iniciar sesión utilizando el usuario administrador generado de prueba:

- **Email**: `admin@empresa.com`
- **Contraseña**: `admin123`

## Tecnologías Utilizadas

- **Frontend**: React (Vite), TailwindCSS, Recharts (Gráficos), Lucide React (Íconos), React Router, Axios. Diseño moderno oscuro con tarjetas y micro-animaciones.
- **Backend**: Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), Bcrypt.
- **Base de Datos**: MySQL.
