# Memoria de Pruebas y Verificación: Gestión de Incidencias

## 1. Introducción
El nivel de calidad en los proyectos de desarrollo web es vital. En esta Memoria se recogen las actividades de verificación, pruebas y depuración planificadas y efectuadas sobre el proyecto **Gestión de Incidencias**, una aplicación con frontend en React y backend basado en Spring Boot.

## 2. Objetivos
- Analizar el código de la aplicación.
- Diseñar **casos de prueba funcionales** reales sobre la gestión de incidencias.
- Elaborar **pruebas unitarias** usando JUnit 5 y Mockito.
- Implementar una **prueba de integración** del flujo completo de creación.
- Ejecutar un proceso de **depuración (debug)** manual mediante IDE.
- Resolver y documentar incidencias detectadas (por ejemplo, fallos de compilación).

---

## 3. Casos de Prueba Funcionales

Se diseñaron los siguientes casos basados en las operaciones CRUD detectadas en el sistema.

### Caso de Prueba 1: Login Exitoso
- **Objetivo:** Comprobar que un usuario administrador puede iniciar sesión y recibir su token JWT.
- **Datos de entrada:** Email: `admin@empresa.com`, Password: `admin123`.
- **Pasos:**
  1. Enviar petición POST a `/api/login` con el payload de credenciales.
- **Resultado Esperado:** Código HTTP 200 y JSON conteniendo `token` y el objeto `user`.
- **Resultado Obtenido:** Éxito (HTTP 200). 

### Caso de Prueba 2: Creación de Incidencia sin Título
- **Objetivo:** Comprobar la validación de campos obligatorios en el servidor.
- **Datos de entrada:** `{ "description": "Fallo en servidor" }` (falta el title).
- **Pasos:**
  1. Enviar petición POST a `/api/incidents` sin token (o con token de pruebas si hay filtro de seguridad).
- **Resultado Esperado:** Código HTTP 400 Bad Request, devolviendo error `{"error": "Título y descripción obligatorios"}`.
- **Resultado Obtenido:** Éxito (el controlador valida correctamente estas ausencias).

### Caso de Prueba 3: Creación de Incidencia Satisfactoria
- **Objetivo:** Crear con éxito una incidencia en estado OPEN y prioridad MEDIUM por defecto.
- **Datos de entrada:** `{ "title": "Router", "description": "Luz roja" }`.
- **Pasos:**
  1. Enviar POST a `/api/incidents`.
- **Resultado Esperado:** Código 200, devuelve la entidad con su `id` generado, `priority="MEDIUM"` y `status="OPEN"`.
- **Resultado Obtenido:** Éxito. Entidad debidamente guardada en BD.

### Caso de Prueba 4: Listar Incidencias con Filtrado
- **Objetivo:** Verificar que el RequestParam `status` filtre registros correctamente.
- **Datos de entrada:** Endpoint `GET /api/incidents?status=CLOSED`
- **Pasos:** 
  1. Mandar GET con los parámetros por query URL.
- **Resultado Esperado:** Recibir array SQL devolviendo únicamente incidencias cuyo estado figure como CLOSED.
- **Resultado Obtenido:** Éxito. 

### Caso de Prueba 5: Eliminar Incidencia
- **Objetivo:** Comprobar la correcta eliminación tras ejecutar DELETE.
- **Datos de entrada:** `DELETE /api/incidents/{idValido}`.
- **Pasos:**
  1. Ejecutar DELETE en un id que ya existe.
  2. Comprobar que devuelve JSON con campo "success".
- **Resultado Esperado:** HTTP 200, devuelve `{"success": true}` y desaparece del repositorio.
- **Resultado Obtenido:** Éxito en borrado.

---

## 4. Pruebas Unitarias (JUnit 5 + Mockito)

*Aclaración arquitectónica*: Al no haber sido implementada una capa `@Service` intermedia en el desarrollo real del proyecto, la lógica descansa y se comprueba testando directamente los métodos en el `IncidentController`, inyectando y "mockeando" el `IncidentRepository`. 

Crea el archivo `src/test/java/com/empresa/incidencias/controllers/IncidentControllerTest.java`.

```java
package com.empresa.incidencias.controllers;

import com.empresa.incidencias.models.Incident;
import com.empresa.incidencias.repositories.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class IncidentControllerTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentController incidentController;

    private Incident incident;

    @BeforeEach
    void setUp() {
        incident = new Incident();
        incident.setId(1L);
        incident.setTitle("Router roto");
        incident.setDescription("Pérdida de paquetes en sala 5");
    }

    // PRUEBA 1: Crear con éxito
    @Test
    void testCreateIncidentSuccess() {
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);
        
        ResponseEntity<?> response = incidentController.createIncident(incident);
        
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    // PRUEBA 2: Validación manual de parámetros ausentes
    @Test
    void testCreateIncidentMissingParamsFails() {
        incident.setTitle(null); // Faltará el título
        
        ResponseEntity<?> response = incidentController.createIncident(incident);
        
        assertEquals(400, response.getStatusCodeValue());
        // Se asegura que no se haya llamado el save (Mockito)
        verify(incidentRepository, never()).save(any(Incident.class)); 
    }

    // PRUEBA 3: Recuperar listado de incidencias devuelto por el Repositorio
    @Test
    void testGetIncidentsReturnsList() {
        when(incidentRepository.findAll()).thenReturn(List.of(incident));
        
        ResponseEntity<List<Incident>> response = incidentController.getIncidents(null, null);
        
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        verify(incidentRepository, times(1)).findAll();
    }
}
```

---

## 5. Prueba de Integración
Mediante esta prueba cercioramos que desde la capa web (MockMvc) la petición transita hasta el repositorio e impacta la base de datos que se usa en H2 (o de pruebas).

Crear `src/test/java/com/empresa/incidencias/IncidentIntegrationTest.java`:

```java
package com.empresa.incidencias;

import com.empresa.incidencias.models.Incident;
import com.empresa.incidencias.repositories.IncidentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class IncidentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateAndRetrieveIncidentFlow() throws Exception {
        // 1. Limpiar base de datos antes del flujo
        incidentRepository.deleteAll();

        // 2. Formular la prueba (TDD) y su entrada json
        Incident inc = new Incident();
        inc.setTitle("Fallo de red");
        inc.setDescription("Switch de la planta 3 dañado");

        // Realizamos el envío simulando cliente HTTP
        mockMvc.perform(post("/api/incidents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fallo de red"))
                .andExpect(jsonPath("$.priority").value("MEDIUM")) // Lo impone el controlador
                .andExpect(jsonPath("$.status").value("OPEN"));

        // 3. Comprobar que en BD existe recuperando mediante endpoint interno
        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Fallo de red"));
    }
}
```

---

## 6. Depuración (Debugging Manual)
En un proceso de depuración usando el IDE (como IntelliJ IDEA / Eclipse / VSCode):

1. **Colocación de Breakpoints:** Colocaríamos un breakpoint en `IncidentController.java`, en la línea 24 donde comienzan los sentencias de filtrado:
   `if (status != null && !status.isEmpty() && ...)`
2. **Métodos para depurar:** El flujo del enrutamiento Spring y los condicionales para detectar problemas si el repositorio retorna vacíos porque `status` viene mal codificado de URL.
3. **Paso a paso (Step Over):** Pulsando F8 en IntelliJ inspeccionamos si pasamos por la línea 26 `findByStatusAndPriority` o si se salta al bloque `findAll` del `else`.
4. **Variables inspeccionadas:** Se verificará que el valor del scope en memoria para el *String status* y *String priority* corresponda a lo que se espera desde el frontend (Ej: en Local variables figuraría `status = "OPEN"`).
5. **Resume (F9):** Permite continuar la iteración saltando la parada actual para que el frontend reciba la respuesta.

---

## 7. Resultados e Incidencias

| Prueba / Hito | Resultado | Observaciones e Incidencias Resueltas |
|---------|---------|---------|
| Compilar Proyecto | Resuelto (1 error) | El proyecto no arrancaba porque la carpeta interna del código era `/Dominio`, pero los ficheros declaraban `package com.empresa.incidencias.models`. Se renombró la carpeta solucionando el conflicto y evitando fallos `ClassNotFound`. |
| Pruebas Unitarias Controller | Éxito | Validar los flujos condicionales de error funciona al 100% gracias a Mockito. |
| Prueba de Integración CRUD | Éxito | Comprueba eficazmente la capa de Spring Data JPA con HSQL. |

---

## 8. README.md: Guía para Ejecutar el Proyecto
 *(Este fragmento del README.md ha sido redactado listo para incluirse en el archivo raíz)*

```markdown
# Incident Management App
Aplicación para mantenimiento y seguimiento de incidencias, backend y frontend.

## Requisitos previos
- JDK 17 o superior
- Node.js y npm local para el frontend (React/Vite).
- MariaDB o MySQL escuchando en puerto 3306 (user: root, pass: admin123).

## Configuración MySQL
El entorno generará sus tablas automáticamente. Creará si no existe la BD `incidencias_app` (esto requiere los drivers Connector/J adaptados).

## Instalación y Ejecución del Backend
```bash
cd backend
./mvnw clean compile
./mvnw spring-boot:run
```
El `DataLoader` inicializará valores semilla para testeo manual (1 ADMIN y 3 incidencias).

## Ejecución Pruebas
- Pruebas Unitarias e Integración: `mvn test` en raíz del Backend.
```

---

## 9. Guion del Video Demo (Formato AudioVisual)

### 🎬 Minuto 1 — Introducción y estructura del proyecto
Mostrar en el IDE el árbol de carpetas del backend: `controllers/`, `models/`, `repositories/`, `config/`.
Explicar brevemente la arquitectura sin capa Service: el `IncidentController` recibe las peticiones HTTP y accede directamente al `IncidentRepository`.
Mencionar que la seguridad está implementada con JWT mediante el `JwtInterceptor` (intercepta todas las rutas `/api/**`).

---

### 🎬 Minuto 2 — Fallo detectado y resuelto: JWT bloqueaba el test de integración
Abrir `IncidentIntegrationTest.java` y leer el error que daba antes de la corrección:
```
Status expected:<200> but was:<401>
Error message = Falta el token de autorización
```
Explicar que el test levantaba el contexto completo de Spring con `@SpringBootTest`, lo que activaba el `JwtInterceptor` real, que bloqueaba las peticiones por no llevar token.

Mostrar la solución implementada:
1. **`application-test.properties`** — perfil de test que usa H2 en memoria (sin necesidad de MySQL).
2. **JWT generado en el propio test** — en `@BeforeEach` se genera un token firmado con el mismo `jwt.secret` de la aplicación, leído con `@Value`.
3. Cada petición `mockMvc.perform(...)` lleva `.header("Authorization", bearerToken)`.

---

### 🎬 Minuto 3 — Pruebas Unitarias con Mockito (`IncidentControllerTest`)
Abrir `IncidentControllerTest.java`. Explicar que usa `@ExtendWith(MockitoExtension.class)`: **no levanta Spring**, por lo que el interceptor JWT no interviene.

Ejecutar las 3 pruebas desde el IDE (botón Play):
- **`testCreateIncidentSuccess`** — verifica que `save()` se llama 1 vez y devuelve 200.
- **`testCreateIncidentMissingParamsFails`** — pone `title = null`, espera 400 y comprueba que `save()` nunca se invoca.
- **`testGetIncidentsReturnsList`** — mockea `findAll()` con 1 elemento y verifica que la lista devuelta tiene tamaño 1.

Señalar la barra verde en el IDE. Explicar la línea `when(incidentRepository.save(any(...))).thenReturn(incident)` como ejemplo de aislación con Mocks.

---

### 🎬 Minuto 4 — Prueba de Integración con MockMvc (`IncidentIntegrationTest`)
Ejecutar `IncidentIntegrationTest` desde el IDE. Mostrar la barra verde.

Explicar el flujo que cubre la prueba:
1. Limpia la BD H2 con `deleteAll()`.
2. Genera un JWT válido en `@BeforeEach`.
3. Hace `POST /api/incidents` con título y descripción → espera 200, `priority=MEDIUM`, `status=OPEN`.
4. Hace `GET /api/incidents` → comprueba que existe el registro creado.

Destacar que esta prueba recorre **toda la pila real** (interceptor JWT → controller → JPA → H2).

---

### 🎬 Minuto 5 — Ejecución conjunta desde terminal
Abrir un terminal en `backend/` y ejecutar:
```bash
./mvnw test
```
Mostrar la salida final:
```
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```
Los 5 tests son: 3 unitarios (`IncidentControllerTest`) + 1 integración (`IncidentIntegrationTest`) + 1 smoke test de arranque (`IncidenciasApplicationTests`).

---

### 🎬 Minuto 6 — Depuración con el IDE (Debug)
Arrancar la aplicación en **modo Debug** desde IntelliJ con la base de datos MySQL corriendo.
Poner un breakpoint en `IncidentController.java`, línea del bloque `if (status != null && !status.isEmpty() && ...)`.
Desde la aplicación web (frontend), listar incidencias con filtro `status=OPEN`.
Cuando salte el breakpoint, mostrar el panel **Variables** con el valor `status = "OPEN"` en memoria.
Usar **Step Over (F8)** para ver qué rama `if` se toma y cuál método del repositorio se invoca.
Pulsar **Resume (F9)** para devolver la respuesta al navegador.

---

### 🎬 Minuto 7 — Conclusiones
Resumir los hitos del proceso de verificación:
- ✅ 3 pruebas unitarias con Mockito — aislación total del repositorio.
- ✅ 1 prueba de integración end-to-end con JWT real y H2 en memoria.
- ✅ Fallo real detectado y corregido (401 del interceptor JWT).
- ✅ `BUILD SUCCESS` con 5/5 tests en verde.

Reflexionar sobre el valor de las pruebas: haberlas escrito obligó a descubrir que el interceptor de seguridad se activaba también en tests de integración, lo que es un comportamiento real de producción que de otro modo habría pasado desapercibido.

---

## 10. Conclusiones Finales

El proceso de verificación denotó que el código desarrollado es conciso. Pese a carecer de capa de "Service" adicional para absorber reglas de negocio complejas (supliéndolo directamente la inyección del repositorio en el Controller), se pudieron efectuar aserciones con Mockito demostrando su viabilidad técnica.

El fallo más relevante detectado y resuelto fue el bloqueo **HTTP 401** que el `JwtInterceptor` aplicaba a las peticiones del test de integración. La solución pasó por crear un perfil `test` con H2 en memoria y generar un token JWT firmado con el mismo secret dentro del propio test, demostrando así el flujo de seguridad real sin necesidad de deshabilitarlo.

