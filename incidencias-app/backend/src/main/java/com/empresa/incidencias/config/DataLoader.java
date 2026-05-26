package com.empresa.incidencias.config;

import com.empresa.incidencias.models.Incident;
import com.empresa.incidencias.models.User;
import com.empresa.incidencias.repositories.IncidentRepository;
import com.empresa.incidencias.repositories.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Sembrando base de datos con valores iniciales...");

            User admin = new User();
            admin.setEmail("admin@empresa.com");
            admin.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt()));
            admin.setName("Administrador");
            admin.setRole("ADMIN");
            userRepository.save(admin);

            Incident inc1 = new Incident();
            inc1.setTitle("Fallo en la red WiFi de la oficina principal");
            inc1.setDescription(
                    "Los usuarios del ala sur no pueden conectarse a la red inalámbrica desde esta mañana.");
            inc1.setPriority("HIGH");
            inc1.setStatus("OPEN");
            incidentRepository.save(inc1);

            Incident inc2 = new Incident();
            inc2.setTitle("Actualización de software de contabilidad");
            inc2.setDescription("El programa requiere una actualización para generar los reportes del mes.");
            inc2.setPriority("LOW");
            inc2.setStatus("CLOSED");
            incidentRepository.save(inc2);

            Incident inc3 = new Incident();
            inc3.setTitle("Impresora atascada en recepción");
            inc3.setDescription("La impresora láser principal reporta un error de atasco de papel interno.");
            inc3.setPriority("MEDIUM");
            inc3.setStatus("IN_PROGRESS");
            incidentRepository.save(inc3);

            System.out.println("Semilla insertada correctamente.");
        }
    }
}
