package com.pujasetu.controller;

import com.pujasetu.service.LocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Locations")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/states")
    public ResponseEntity<Map<String, Object>> getStates() {
        return ResponseEntity.ok(locationService.getStates());
    }

    @GetMapping("/states/{stateCode}/districts")
    public ResponseEntity<Map<String, Object>> getDistricts(@PathVariable String stateCode) {
        return ResponseEntity.ok(locationService.getDistricts(stateCode));
    }

    @GetMapping("/states/{stateCode}/districts/{districtName}/cities")
    public ResponseEntity<Map<String, Object>> getCities(
            @PathVariable String stateCode,
            @PathVariable String districtName
    ) {
        return ResponseEntity.ok(locationService.getCities(stateCode, districtName));
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
}
