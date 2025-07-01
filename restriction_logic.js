export const dayMap = {
    "LUN": 1, "MAR": 2, "MER": 3, "JEU": 4, "VEN": 5, "SAM": 6, "DIM": 0,
    "LUNDI": 1, "MARDI": 2, "MERCREDI": 3, "JEUDI": 4, "VENDREDI": 5, "SAMEDI": 6, "DIMANCHE": 0
};

export const monthMap = {
    "JAN": 0, "FEV": 1, "MARS": 2, "AVR": 3, "MAI": 4, "JUIN": 5, "JUI": 6, "AOU": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11,
    "JANVIER": 0, "FÉVRIER": 1, "MARS": 2, "AVRIL": 3, "MAI": 4, "JUIN": 5, "JUILLET": 6, "AOÛT": 7, "SEPTEMBRE": 8, "OCTOBRE": 9, "NOVEMBRE": 10, "DÉCEMBRE": 11
};

export function isRestrictedInNext24Hours(restriction, now, in24Hours) {
    // New format: "\P 13h30-15h30 MERCREDI 1 AVRIL AU 1 DEC."
    const regex2 = /(?:P\s*)?(\d{1,2})h(\d{2})?-(\d{1,2})h(\d{2})?\s+([A-Z.]{3,9})\s+(\d{1,2})\s+([A-ZÈ]+)\s+AU\s+(\d{1,2})\s+([A-ZÈ]+)/i;
    let match2 = restriction.match(regex2);

    if (match2) {
        const startHour = parseInt(match2[1], 10);
        const startMinute = match2[2] ? parseInt(match2[2], 10) : 0;
        const endHour = parseInt(match2[3], 10);
        const endMinute = match2[4] ? parseInt(match2[4], 10) : 0;
        const dayStr = match2[5].toUpperCase().replace('.', '');
        const startMonthDay = parseInt(match2[6], 10);
        const startMonthStr = match2[7].toUpperCase();
        const endMonthDay = parseInt(match2[8], 10);
        const endMonthStr = match2[9].toUpperCase().replace('.','');

        const restrictionDay = dayMap[dayStr];
        const startMonth = monthMap[startMonthStr];
        const endMonth = monthMap[endMonthStr];

        if (restrictionDay === undefined || startMonth === undefined || endMonth === undefined) return false;

        const currentYear = now.getFullYear();
        const startDate = new Date(currentYear, startMonth, startMonthDay);
        const endDate = new Date(currentYear, endMonth, endMonthDay);

        if (now >= startDate && now <= endDate) {
            const today = now.getDay();
            const daysUntilRestriction = (restrictionDay - today + 7) % 7;
            
            const nextRestrictionDate = new Date(now);
            nextRestrictionDate.setDate(now.getDate() + daysUntilRestriction);

            let restrictionStart = new Date(nextRestrictionDate.getFullYear(), nextRestrictionDate.getMonth(), nextRestrictionDate.getDate(), startHour, startMinute);
            let restrictionEnd = new Date(nextRestrictionDate.getFullYear(), nextRestrictionDate.getMonth(), nextRestrictionDate.getDate(), endHour, endMinute);

            if (restrictionStart < in24Hours && restrictionEnd > now) {
                return true;
            }
        }
    }

    // Original format: "LUN 09H A VEN 17H"
    const regex1 = /([A-Z]{3,8})\s*(\d{1,2})H(\d{2})?\s*A\s*([A-Z]{3,8})\s*(\d{1,2})H(\d{2})?/gi;
    let match1;

    while ((match1 = regex1.exec(restriction)) !== null) {
        const startDayStr = match1[1].toUpperCase();
        const startHour = parseInt(match1[2], 10);
        const startMinute = match1[3] ? parseInt(match1[3], 10) : 0;
        const endDayStr = match1[4].toUpperCase();
        const endHour = parseInt(match1[5], 10);
        const endMinute = match1[6] ? parseInt(match1[6], 10) : 0;

        const startDay = dayMap[startDayStr];
        const endDay = dayMap[endDayStr];

        if (startDay === undefined || endDay === undefined) continue;

        for (let i = 0; i < 7; i++) {
            let restrictionDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
            if (restrictionDate.getDay() >= startDay && restrictionDate.getDay() <= endDay) {
                let restrictionStart = new Date(restrictionDate.getFullYear(), restrictionDate.getMonth(), restrictionDate.getDate(), startHour, startMinute);
                let restrictionEnd = new Date(restrictionDate.getFullYear(), restrictionDate.getMonth(), restrictionDate.getDate(), endHour, endMinute);

                if (restrictionStart < in24Hours && restrictionEnd > now) {
                    return true;
                }
            }
        }
    }
    return false;
}
