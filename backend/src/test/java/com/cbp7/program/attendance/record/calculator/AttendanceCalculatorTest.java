package com.cbp7.program.attendance.record.calculator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AttendanceCalculatorTest {

    private final AttendanceCalculator calculator = new AttendanceCalculator();

    @Test
    @DisplayName("calculatePercentage returns correct rounded percentage")
    void testCalculatePercentage() {
        assertThat(calculator.calculatePercentage(3, 4)).isEqualTo(75.0);
        assertThat(calculator.calculatePercentage(2, 3)).isEqualTo(66.67);
        assertThat(calculator.calculatePercentage(0, 5)).isEqualTo(0.0);
        assertThat(calculator.calculatePercentage(5, 0)).isEqualTo(0.0);
    }

    @Test
    @DisplayName("calculateAbsentCount returns non-negative absent count")
    void testCalculateAbsentCount() {
        assertThat(calculator.calculateAbsentCount(100, 80)).isEqualTo(20);
        assertThat(calculator.calculateAbsentCount(100, 105)).isEqualTo(0);
    }
}
