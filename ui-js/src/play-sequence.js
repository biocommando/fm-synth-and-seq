import {fx} from './fx';
import * as state from './state';
import {verySmallSynth} from './verysmallsynth';
import {updatePlayStatusToGrid} from './synth-editor';

const convertIndexToNote = i => {
    switch (i) {
        case 7: return 2;
        case 6: return 4;
        case 5: return 5;
        case 4: return 7;
        case 3: return 9;
        case 2: return 10;
        case 1: return 12;
        case 0: return 14;
    }
};

const mapFx = allFx => {
    if (allFx.length === 0) {
        return undefined;
    }
    return fx.stack(allFx.map(oneFx => fx[oneFx.name](...oneFx.params)));
};
const mapNotes = (notes, octave, chokeChords) => {
    const mapped = new Array(notes.length * 2).fill().map(() => new Array(8).fill(0));
    const lastNote = new Array(8).fill(false);
    notes.forEach((notegroup, i) => {
        notegroup.forEach((isOn, noteNum) => {
            if (isOn) {
                if (lastNote[noteNum] || (chokeChords && lastNote.includes(true) && i !== 0)) {
                    if (chokeChords) {
                        lastNote.forEach((n, j) => {
                            if (n) {
                                mapped[i * 2 - 1][j] = 1;
                            }
                        });
                    }
                    mapped[i * 2 - 1][noteNum] = 1;
                }
                mapped[i * 2][noteNum] = convertIndexToNote(noteNum) + octave * 12;
                lastNote[noteNum] = true;
            }
        });
    });
    const filledLanes = new Array(8).fill(false);
    mapped.forEach(notegroup => {
        notegroup.forEach((noteState, i) => filledLanes[i] = filledLanes[i] || noteState);
    });
    let maxLen = 0;
    for (let i = 0; i < mapped.length; i++) {
        mapped[i] = mapped[i].filter((value, idx) => filledLanes[idx]);
        /*if (chokeChords && mapped[i].includes(1)) {
            mapped[i] = mapped[i].map(() => 1);
        }*/
        const extraElementsStartAt = mapped[i].reduce((a, b, i) => b !== 0 ? i + 1 : a, 0);
        mapped[i].splice(extraElementsStartAt);
        maxLen = maxLen < mapped[i].length ? mapped[i].length : maxLen;
    }
    //if (lastNote !== undefined) {
    mapped[31] = new Array(maxLen).fill(1);
    //}
    return mapped;
};
const mapToSequence = () => {
    const seq = state.pages.map(page => [
        //[[page.start * 32, page.stop * 32]],
        page.composition
            .map((state, i) => state ? [i * 32, (i + 1) * 32] : undefined)
            .filter(range => range !== undefined)
            .reduce((a, b) => {
                if (a.length > 0 && b[0] === a[a.length - 1][1]) {
                    a[a.length - 1][1] = b[1];
                    return a;
                } else {
                    return [...a, b];
                }
            }, []),
        [...page.fmParams, mapFx(page.fx)],
        ...mapNotes(page.notes, page.octave, page.chokeChords)
    ]);
    const lastEnding = state.pages.map(page => page.composition.lastIndexOf(true) + 1).sort((a, b) => b - a)[0];
    seq.reset = lastEnding * 32;
    return seq;
};

export const play = () => {
    if (state.synth && state.synth.playing()) {
        return;
    }
    const seq = mapToSequence();
    if (!state.synth) {
        state.synth = verySmallSynth(seq, state.tempo * 2, updatePlayStatusToGrid);
    } else {
        state.synth.update(seq, state.tempo * 2);
    }
    state.synth.toggle(state.pages[state.currentPage].compositionEditStartStep * 32);
    updatePlayStatusToGrid();
};

export const stop = () => {
    if (!state.synth.playing()) {
        return;
    }
    state.synth.toggle();
    updatePlayStatusToGrid();
};

export const updateSequence = () => {
    if (state.synth) {
        state.synth.update(mapToSequence(), state.tempo * 2);
    }
};