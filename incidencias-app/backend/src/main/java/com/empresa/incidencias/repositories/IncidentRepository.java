package com.empresa.incidencias.repositories;

import com.empresa.incidencias.models.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(String status);

    List<Incident> findByPriority(String priority);

    List<Incident> findByStatusAndPriority(String status, String priority);

    long countByStatus(String status);
}
