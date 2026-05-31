package com.empresa.incidencias;

import com.empresa.incidencias.repositories.IncidentRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class IncidentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IncidentRepository incidentRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private String bearerToken;

    @BeforeEach
    void setUp() {
        incidentRepository.deleteAll();

        // Generamos un token JWT válido con el mismo secret que usa la aplicación
        byte[] key = jwtSecret.getBytes(StandardCharsets.UTF_8);
        bearerToken = "Bearer " + Jwts.builder()
                .setClaims(Map.of("id", 1, "email", "test@empresa.com"))
                .setSubject("test@empresa.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(Keys.hmacShaKeyFor(key), SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void testCreateAndRetrieveIncidentFlow() throws Exception {
        // 2. Formular la prueba (TDD) y su entrada json
        String json = "{\"title\":\"Fallo de red\", \"description\":\"Switch de la planta 3 dañado\"}";

        // Realizamos el envío simulando cliente HTTP (con token válido)
        mockMvc.perform(post("/api/incidents")
                .header("Authorization", bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fallo de red"))
                .andExpect(jsonPath("$.priority").value("MEDIUM")) // Lo impone el controlador
                .andExpect(jsonPath("$.status").value("OPEN"));

        // 3. Comprobar que en BD existe recuperando mediante endpoint interno
        mockMvc.perform(get("/api/incidents")
                .header("Authorization", bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Fallo de red"));
    }
}
