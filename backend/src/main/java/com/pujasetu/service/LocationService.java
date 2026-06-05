package com.pujasetu.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pujasetu.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final ObjectMapper objectMapper;
    private JsonNode root;

    private JsonNode getRoot() {
        if (root == null) {
            try (InputStream is = new ClassPathResource("data/india-locations.json").getInputStream()) {
                root = objectMapper.readTree(is);
            } catch (Exception ex) {
                throw new IllegalStateException("Failed to load india-locations.json", ex);
            }
        }
        return root;
    }

    public Map<String, Object> getStates() {
        List<Map<String, String>> states = StreamSupport.stream(getRoot().get("states").spliterator(), false)
                .map(s -> Map.of("code", s.get("code").asText(), "name", s.get("name").asText()))
                .toList();
        return Map.of("success", true, "states", states);
    }

    public Map<String, Object> getDistricts(String stateCode) {
        JsonNode state = findState(stateCode);
        List<Map<String, String>> districts = StreamSupport.stream(state.get("districts").spliterator(), false)
                .map(d -> Map.of(
                        "code", d.has("code") ? d.get("code").asText() : d.get("name").asText(),
                        "name", d.get("name").asText()))
                .toList();
        return Map.of("success", true, "districts", districts);
    }

    public Map<String, Object> getCities(String stateCode, String districtName) {
        JsonNode state = findState(stateCode);
        JsonNode district = findDistrict(state, districtName);
        List<String> cities = district.has("cities")
                ? StreamSupport.stream(district.get("cities").spliterator(), false).map(JsonNode::asText).toList()
                : List.of();
        return Map.of("success", true, "cities", cities);
    }

    public Map<String, Object> getAllLocations() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", objectMapper.convertValue(getRoot(), Map.class));
        return response;
    }

    private JsonNode findState(String stateCode) {
        for (JsonNode state : getRoot().get("states")) {
            if (state.get("code").asText().equals(stateCode) || state.get("name").asText().equals(stateCode)) {
                return state;
            }
        }
        throw new ResourceNotFoundException("State not found");
    }

    private JsonNode findDistrict(JsonNode state, String districtName) {
        for (JsonNode district : state.get("districts")) {
            String code = district.has("code") ? district.get("code").asText() : district.get("name").asText();
            if (district.get("name").asText().equals(districtName) || code.equals(districtName)) {
                return district;
            }
        }
        throw new ResourceNotFoundException("District not found");
    }
}
