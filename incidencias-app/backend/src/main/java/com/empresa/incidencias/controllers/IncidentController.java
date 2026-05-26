package com.empresa.incidencias.controllers;

import com.empresa.incidencias.models.Incident;
import com.empresa.incidencias.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    public ResponseEntity<List<Incident>> getIncidents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {

        List<Incident> incidents;
        if (status != null && !status.isEmpty() && priority != null && !priority.isEmpty()) {
            incidents = incidentRepository.findByStatusAndPriority(status, priority);
        } else if (status != null && !status.isEmpty()) {
            incidents = incidentRepository.findByStatus(status);
        } else if (priority != null && !priority.isEmpty()) {
            incidents = incidentRepository.findByPriority(priority);
        } else {
            incidents = incidentRepository.findAll();
        }

        incidents.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(incidents);
    }

    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody Incident incident) {
        if (incident.getTitle() == null || incident.getDescription() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Título y descripción obligatorios"));
        }
        if (incident.getPriority() == null)
            incident.setPriority("MEDIUM");
        if (incident.getStatus() == null)
            incident.setStatus("OPEN");

        Incident saved = incidentRepository.save(incident);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncident(@PathVariable Long id, @RequestBody Incident incident) {
        return incidentRepository.findById(id).map(existing -> {
            if (incident.getTitle() != null)
                existing.setTitle(incident.getTitle());
            if (incident.getDescription() != null)
                existing.setDescription(incident.getDescription());
            if (incident.getPriority() != null)
                existing.setPriority(incident.getPriority());
            if (incident.getStatus() != null)
                existing.setStatus(incident.getStatus());

            return ResponseEntity.ok(incidentRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncident(@PathVariable Long id) {
        if (incidentRepository.existsById(id)) {
            incidentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        }
        return ResponseEntity.notFound().build();
    }
}
