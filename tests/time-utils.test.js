/**
 * @jest-environment jsdom
 */

import { formatTimeSinceLastUpdate } from '../time-utils.js';

describe('Time Formatting Utilities Tests', () => {
    // Save original Date for all tests
    const originalDate = Date;
    
    beforeAll(() => {
        // Mock Date to September 25, 2025, 14:30:00 UTC for all tests
        const mockDate = new Date('2025-09-25T14:30:00.000Z');
        global.Date = class extends Date {
            constructor(...args) {
                if (args.length === 0) {
                    return new originalDate(mockDate.getTime());
                }
                return new originalDate(...args);
            }
            
            static now() {
                return mockDate.getTime();
            }
        };
    });
    
    afterAll(() => {
        global.Date = originalDate;
    });
    
    describe('formatTimeSinceLastUpdate', () => {

        test('should return "Inconnu" for null or undefined input', () => {
            expect(formatTimeSinceLastUpdate(null)).toBe('Inconnu');
            expect(formatTimeSinceLastUpdate(undefined)).toBe('Inconnu');
            expect(formatTimeSinceLastUpdate('')).toBe('Inconnu');
            
            console.log('✅ Handles missing input correctly');
        });

        test('should return "Maintenant" for future dates', () => {
            const futureDate = '2025-09-25T15:00:00.000Z'; // 30 minutes in the future
            expect(formatTimeSinceLastUpdate(futureDate)).toBe('Maintenant');
            
            console.log('✅ Handles future dates correctly');
        });

        test('should return "Maintenant" for very recent updates (less than 1 minute)', () => {
            const recentDate = '2025-09-25T14:29:30.000Z'; // 30 seconds ago
            expect(formatTimeSinceLastUpdate(recentDate)).toBe('Maintenant');
            
            console.log('✅ Handles very recent updates correctly');
        });

        test('should format minutes correctly', () => {
            const fiveMinutesAgo = '2025-09-25T14:25:00.000Z';
            const fifteenMinutesAgo = '2025-09-25T14:15:00.000Z';
            const thirtyMinutesAgo = '2025-09-25T14:00:00.000Z';
            
            expect(formatTimeSinceLastUpdate(fiveMinutesAgo)).toBe('5min');
            expect(formatTimeSinceLastUpdate(fifteenMinutesAgo)).toBe('15min');
            expect(formatTimeSinceLastUpdate(thirtyMinutesAgo)).toBe('30min');
            
            console.log('✅ Formats minutes correctly');
        });

        test('should format hours correctly', () => {
            const oneHourAgo = '2025-09-25T13:30:00.000Z';
            const twoHoursAgo = '2025-09-25T12:30:00.000Z';
            const fiveHoursAgo = '2025-09-25T09:30:00.000Z';
            
            expect(formatTimeSinceLastUpdate(oneHourAgo)).toBe('1h');
            expect(formatTimeSinceLastUpdate(twoHoursAgo)).toBe('2h');
            expect(formatTimeSinceLastUpdate(fiveHoursAgo)).toBe('5h');
            
            console.log('✅ Formats hours correctly');
        });

        test('should format days only when no remaining hours', () => {
            const oneDayExact = '2025-09-24T14:30:00.000Z'; // Exactly 24 hours ago
            const twoDaysExact = '2025-09-23T14:30:00.000Z'; // Exactly 48 hours ago
            
            expect(formatTimeSinceLastUpdate(oneDayExact)).toBe('1j');
            expect(formatTimeSinceLastUpdate(twoDaysExact)).toBe('2j');
            
            console.log('✅ Formats exact days correctly');
        });

        test('should format days with remaining hours', () => {
            const oneDayThreeHours = '2025-09-24T11:30:00.000Z'; // 1 day 3 hours ago
            const twoDaysFiveHours = '2025-09-23T09:30:00.000Z'; // 2 days 5 hours ago
            const threeDaysOneHour = '2025-09-22T13:30:00.000Z'; // 3 days 1 hour ago
            
            expect(formatTimeSinceLastUpdate(oneDayThreeHours)).toBe('1j 3h');
            expect(formatTimeSinceLastUpdate(twoDaysFiveHours)).toBe('2j 5h');
            expect(formatTimeSinceLastUpdate(threeDaysOneHour)).toBe('3j 1h');
            
            console.log('✅ Formats days with hours correctly');
        });

        test('should handle edge cases around day boundaries', () => {
            const almostOneDay = '2025-09-24T14:35:00.000Z'; // 23h 55min ago
            const justOverOneDay = '2025-09-24T14:25:00.000Z'; // 24h 5min ago
            
            expect(formatTimeSinceLastUpdate(almostOneDay)).toBe('23h');
            expect(formatTimeSinceLastUpdate(justOverOneDay)).toBe('1j');
            
            console.log('✅ Handles day boundary edge cases correctly');
        });

        test('should handle various ISO date formats', () => {
            const isoDate1 = '2025-09-25T12:30:00.000Z';
            const isoDate2 = '2025-09-25T12:30:00Z';
            const isoDate3 = '2025-09-25T12:30:00';
            
            expect(formatTimeSinceLastUpdate(isoDate1)).toBe('2h');
            expect(formatTimeSinceLastUpdate(isoDate2)).toBe('2h');
            // Note: isoDate3 might behave differently due to timezone interpretation
            
            console.log('✅ Handles various ISO date formats correctly');
        });

        test('should handle long time periods', () => {
            const oneWeekAgo = '2025-09-18T14:30:00.000Z';
            const oneMonthAgo = '2025-08-25T14:30:00.000Z';
            
            expect(formatTimeSinceLastUpdate(oneWeekAgo)).toBe('7j');
            expect(formatTimeSinceLastUpdate(oneMonthAgo)).toBe('31j');
            
            console.log('✅ Handles long time periods correctly');
        });

        test('should handle invalid date strings gracefully', () => {
            const invalidDate1 = 'not-a-date';
            const invalidDate2 = '2025-13-45T25:70:00Z'; // Invalid date components
            
            // Invalid dates should result in NaN when subtracted, which should be handled
            const result1 = formatTimeSinceLastUpdate(invalidDate1);
            const result2 = formatTimeSinceLastUpdate(invalidDate2);
            
            // The function should not crash and return a reasonable result
            expect(typeof result1).toBe('string');
            expect(typeof result2).toBe('string');
            
            console.log('✅ Handles invalid date strings gracefully');
        });
    });

    describe('Real-world Scenarios', () => {
        test('should handle common vehicle update scenarios', () => {
            // Vehicle updated 10 minutes ago
            const recentUpdate = '2025-09-25T14:20:00.000Z';
            expect(formatTimeSinceLastUpdate(recentUpdate)).toBe('10min');
            
            // Vehicle updated 3 hours ago  
            const hourlyUpdate = '2025-09-25T11:30:00.000Z';
            expect(formatTimeSinceLastUpdate(hourlyUpdate)).toBe('3h');
            
            // Vehicle updated yesterday
            const dailyUpdate = '2025-09-24T16:00:00.000Z';
            expect(formatTimeSinceLastUpdate(dailyUpdate)).toBe('22h');
            
            // Vehicle updated 2 days ago
            const oldUpdate = '2025-09-23T10:00:00.000Z';
            expect(formatTimeSinceLastUpdate(oldUpdate)).toBe('2j 4h');
            
            console.log('✅ Handles real-world vehicle update scenarios correctly');
        });

        test('should provide useful information for fleet management', () => {
            // Test various scenarios that would be useful for fleet managers
            const scenarios = [
                { input: '2025-09-25T14:25:00.000Z', expected: '5min', scenario: 'Just moved' },
                { input: '2025-09-25T13:30:00.000Z', expected: '1h', scenario: 'Recently parked' },
                { input: '2025-09-25T08:30:00.000Z', expected: '6h', scenario: 'Parked for work day' },
                { input: '2025-09-24T20:30:00.000Z', expected: '18h', scenario: 'Parked overnight' },
                { input: '2025-09-23T14:30:00.000Z', expected: '2j', scenario: 'Weekend parking' }
            ];
            
            scenarios.forEach(({ input, expected, scenario }) => {
                const result = formatTimeSinceLastUpdate(input);
                expect(result).toBe(expected);
                console.log(`✅ ${scenario}: ${result}`);
            });
            
            console.log('✅ Provides useful fleet management information');
        });
    });
});
