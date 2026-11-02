package com.example.backend.utils;

import java.util.ArrayList;
import java.util.List;

public class GeoJsonUtils {

    public static List<double[]> extractCoordinatesFlexible(Object coordinates) {
        if (coordinates == null) {
            throw new IllegalArgumentException("Coordinates cannot be null");
        }

        List<double[]> result = new ArrayList<>();

        if (coordinates instanceof List<?>) {
            processList((List<?>) coordinates, result);
        } else {
            throw new IllegalArgumentException("Unsupported coordinates type: " + coordinates.getClass().getSimpleName());
        }

        if (result.isEmpty()) {
            throw new IllegalArgumentException("No valid coordinates found");
        }

        // Ensure polygon is closed
        closePolygonIfNeeded(result);

        return result;
    }

    private static void processList(List<?> list, List<double[]> result) {
        for (Object item : list) {
            if (item instanceof List<?>) {
                processList((List<?>) item, result);
            } else if (item instanceof Number) {
                // This happens if coordinate pairs are not wrapped properly -> ignore
            }
        }

        // Detect low-level 2-number arrays like [x, y]
        if (list.size() == 2 && list.get(0) instanceof Number && list.get(1) instanceof Number) {
            double lon = ((Number) list.get(0)).doubleValue();
            double lat = ((Number) list.get(1)).doubleValue();
            result.add(new double[]{lon, lat});
        }
    }

    private static void closePolygonIfNeeded(List<double[]> coords) {
        if (coords.size() >= 3) {
            double[] first = coords.get(0);
            double[] last = coords.get(coords.size() - 1);

            if (first[0] != last[0] || first[1] != last[1]) {
                coords.add(new double[]{first[0], first[1]});
            }
        }
    }

    public static String convertTxtObjToString(Object zoneId) {
        if (zoneId == null) {
            return "unknown_zone";
        }
        return zoneId.toString();
    }
    /**
     * convert list of coordinates to EWKT polygon string
     */
    public static String convertToEwktPolygon(List<double[]> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) {
            throw new IllegalArgumentException("Coordinates cannot be null or empty");
        }

        StringBuilder ewktBuilder = new StringBuilder("SRID=4326;POLYGON((");

        for (int i = 0; i < coordinates.size(); i++) {
            double[] coord = coordinates.get(i);
            if (coord.length < 2) {
                throw new IllegalArgumentException("Each coordinate must have at least 2 values");
            }
            ewktBuilder.append(coord[0]).append(" ").append(coord[1]);

            if (i < coordinates.size() - 1) {
                ewktBuilder.append(", ");
            }
        }

        // close the polygon by repeating the first coordinate
        double[] firstCoord = coordinates.get(0);
        ewktBuilder.append(", ").append(firstCoord[0]).append(" ").append(firstCoord[1]);

        ewktBuilder.append("))");
        return ewktBuilder.toString();
    }
}
