package com.empresa.incidencias.controllers;

import com.empresa.incidencias.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("open", incidentRepository.countByStatus("OPEN"));
        stats.put("inProgress", incidentRepository.countByStatus("IN_PROGRESS"));
        stats.put("closed", incidentRepository.countByStatus("CLOSED"));

        return ResponseEntity.ok(stats);
    }
}
