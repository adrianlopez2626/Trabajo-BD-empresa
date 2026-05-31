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

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    // PRUEBA 2: Validación manual de parámetros ausentes
    @Test
    void testCreateIncidentMissingParamsFails() {
        incident.setTitle(null); // Faltará el título

        ResponseEntity<?> response = incidentController.createIncident(incident);

        assertEquals(400, response.getStatusCode().value());
        // Se asegura que no se haya llamado el save (Mockito)
        verify(incidentRepository, never()).save(any(Incident.class));
    }

    // PRUEBA 3: Recuperar listado de incidencias devuelto por el Repositorio
    @Test
    void testGetIncidentsReturnsList() {
        when(incidentRepository.findAll()).thenReturn(new java.util.ArrayList<>(List.of(incident)));

        ResponseEntity<List<Incident>> response = incidentController.getIncidents(null, null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        verify(incidentRepository, times(1)).findAll();
    }
}
