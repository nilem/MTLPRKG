import { isRestrictedInNext24Hours } from './restriction_logic.js';

describe('isRestrictedInNext24Hours', () => {
    // Tuesday, July 1, 2025, 11:00 AM
    const now = new Date('2025-07-01T11:00:00');
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // --- Tests for the new format --- 

    test('should return true for a restriction starting in less than 24 hours', () => {
        // Restriction on Wednesday at 10:00, which is in 23 hours
        const restriction = '10h-12h MERCREDI 1 AVRIL AU 1 DEC.';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(true);
    });

    test('should return true for a restriction currently active', () => {
        // Restriction on Tuesday from 10:00 to 12:00
        const restriction = '10h-12h MARDI 1 AVRIL AU 1 DEC.';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(true);
    });

    test('should return false for a restriction on the correct day but outside the 24-hour window', () => {
        // Restriction on Wednesday at 11:30, which is more than 24 hours away
        const now_late = new Date('2025-07-01T10:00:00');
        const in24Hours_late = new Date(now_late.getTime() + 24 * 60 * 60 * 1000);
        const restriction = '11h30-12h30 MERCREDI 1 AVRIL AU 1 DEC.';
        expect(isRestrictedInNext24Hours(restriction, now_late, in24Hours_late)).toBe(false);
    });

    test('should return false for a restriction on a different day of the week', () => {
        // Restriction on Thursday
        const restriction = '10h-12h JEUDI 1 AVRIL AU 1 DEC.';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(false);
    });

    test('should return false for a restriction outside the month range', () => {
        // Restriction is in March, but current date is July
        const restriction = '10h-12h MARDI 1 JAN AU 31 MARS';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(false);
    });

    // --- Tests for the original format ---

    test('should return true for an active restriction in the original format', () => {
        // Restriction from Monday to Friday, 9am to 5pm. Current time is Tuesday 11am.
        const restriction = 'LUN 09H A VEN 17H';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(true);
    });

    test('should return false for a restriction in the original format that is not active', () => {
        // Restriction on Saturday and Sunday.
        const restriction = 'SAM 09H A DIM 17H';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(false);
    });

    test('should return true for a restriction starting tomorrow within 24 hours (original format)', () => {
        // Restriction starts on Wednesday at 10am.
        const restriction = 'MER 10H A JEU 17H';
        expect(isRestrictedInNext24Hours(restriction, now, in24Hours)).toBe(true);
    });
});
