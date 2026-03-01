import { POSITION_FRET_SPAN } from "./constants.js";

export function getPositionFretRange(degree, frets) {
    const deg = Number(degree) || 1;
    const minFret = Math.max(0, 2 + (deg - 1) * 2);
    const maxFret = Math.min(frets, minFret + POSITION_FRET_SPAN - 1);
    return { minFret, maxFret };
}

export const position = {
    generatePositions: (tuning, numFrets) => {
        return tuning.map(stringNote => {
            const stringPositions = [];
            for (let fret = 0; fret <= numFrets; fret++) {
                stringPositions.push({ note: stringNote, degree: null });
            }
            return stringPositions;
        });
    }
};