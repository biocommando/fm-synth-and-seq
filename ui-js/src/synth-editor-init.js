import { createKnob, labelFormatter, optionsFormatter } from './knobs';
import { fxList } from './fx-list';
import { currentFx, currentPage, fxKnobIds, pages, tempo } from './state';
import { updateSequence } from './play-sequence'
import { page, setFmParam, setOctave, setTempo, fxEdit, convertLoadedData} from './synth-editor';
import { bind, sealBindings } from './ui-bind';
import { initStaticBindings } from './init-static-bindings';
import * as dataStoreServerApi from './data-store-server-api';
import * as synthPresets from './synth-presets';

export const createNotes = () => new Array(16).fill().map(() => new Array(8).fill(false));
export const createPage = () => ({
    notes: createNotes(),
    start: 0,
    stop: 1,
    composition: [],
    compositionEditStartStep: 0,
    fmParams: [0, 0, 1, 0],
    octave: 4,
    name: 'new page',
    fx: [],
    chokeChords: true
});

export const init = () => {
    const grid = document.getElementById('grid');
    let html = '';
    for (let x = 0; x < 16; x++) {
        html += `<div class="col">`;
        for (let y = 0; y < 8; y++) {
            html += `<div data-step="${x},${y}" data-col="${x}" data-row="${y}"` +
                ` class="grid-cell${x % 4 === 0 ? ' ' + 'grid-cell--beat-start' : ''}" ${bind('onclick', () => clickGridCell(x, y))}></div>`;
        }
        html += `<div data-step="${x},8" class="grid-cell grid-cell--composition" ${bind('onclick', () => clickCompositionGridCell(x))}></div>`;
        html += `</div>`;
    }
    grid.innerHTML = html;
    sealBindings();
    page(0);
    document.getElementById('fx-list').innerHTML += fxList.map(fx => fx.name).map(name => `<option value="${name}">${name}</option>`).join('');
    let knobs = document.getElementById('fm-param-knobs');
    createKnob(knobs, 'ratio', v => {
        let val = 0;
        if (v < 0.75) val = Math.round(v * 8 / .75 * 4) / 4;
        else val = Math.round((v - 0.75) * 96 + 9);
        setFmParam(0, val);
    }, () => {
        const val = pages[currentPage].fmParams[0];
        if (val < 9) return Math.round(val * 4) / 4 / 8 * 3 / 4;
        if (val < 33) return (Math.round(val) - 9) / 96 + 0.75;
        return 1;
    }, () => pages[currentPage].fmParams[0].toFixed(2));
    createKnob(knobs, 'mod', v => {
        let val = 0;
        if (v < 0.25) val = v * 4;
        else if (v < 0.75) val = (v - 0.25) * 20 + 1;
        else val = (v - 0.75) * 4000 + 11;
        setFmParam(1, val);
    }, () => {
        const val = pages[currentPage].fmParams[1];
        if (val < 1) return val / 4;
        if (val < 11) return (val - 1) / 20 + 0.25;
        if (val < 1011) return (val - 11) / 4000 + 0.75;
        return 1;
    }, () => pages[currentPage].fmParams[1].toFixed(1));
    createKnob(knobs, 'vol1', v => setFmParam(2, v), () => pages[currentPage].fmParams[2], labelFormatter('%'));
    createKnob(knobs, 'vol2', v => setFmParam(3, v), () => pages[currentPage].fmParams[3], labelFormatter('%'));
    knobs = document.getElementById('other-param-knobs');
    createKnob(knobs, 'octave', v => setOctave(Math.round(v * 8)), () => pages[currentPage].octave / 8, () => {
        const normalizedOct = pages[currentPage].octave - 4;
        const sign = normalizedOct > 0 ? '+' : '';
        return sign + normalizedOct;
    });
    createKnob(knobs, 'polyphony', v => {
        pages[currentPage].chokeChords = v < 0.5;
        updateSequence();
    }, () => pages[currentPage].chokeChords ? 0 : 1, optionsFormatter(['choke', 'hold']));
    createKnob(knobs, 'seqPage', v => {
        const old = pages[currentPage].compositionEditStartStep;
        pages[currentPage].compositionEditStartStep = Math.round(v * 8) * 16;
        if (old !== pages[currentPage].compositionEditStartStep) {
            page(0);
            updateSequence();
        }
    }, () => pages[currentPage].compositionEditStartStep / 8 / 16, v => 1 + Math.round(v * 8));
    createKnob(knobs, 'tempo', v => setTempo(Math.round(v * 140) + 60), () => (tempo - 60) / 140, () => tempo);
    knobs = document.getElementById('fx-param-knobs');

    const fxKnobOnChange = param => {
        return knobValue => {
            if (!pages[currentPage].fx[currentFx]) return 0;
            const fxName = pages[currentPage].fx[currentFx].name;
            const fxParams = fxList.find(fx => fx.name === fxName).params[param];
            if (!fxParams) return 0;
            const min = fxParams.min;
            const max = fxParams.max;
            const value = knobValue * (max - min) + min;
            fxEdit(param, value);
        }
    };
    const fxKnobGetValue = param => {
        return () => {
            if (!pages[currentPage].fx[currentFx]) return 0;
            const fxName = pages[currentPage].fx[currentFx].name;
            const fxParams = fxList.find(fx => fx.name === fxName).params[param];
            if (!fxParams) return 0;
            const value = pages[currentPage].fx[currentFx].params[param];
            const min = fxParams.min;
            const max = fxParams.max;
            return (value - min) / (max - min);
        }
    };
    const fxKnobFormatter = param => {
        return () => {
            if (!pages[currentPage].fx[currentFx]) return 0;
            const fxName = pages[currentPage].fx[currentFx].name;
            const fxParams = fxList.find(fx => fx.name === fxName).params[param];
            if (!fxParams) return 0;
            const value = pages[currentPage].fx[currentFx].params[param];
            const precision = Math.max(0, 2 + Math.round(Math.log10(1 / fxParams.max)));
            const suffix = fxParams.suffix ? ' ' + fxParams.suffix : '';
            return value.toFixed(precision) + suffix;
        }
    }
    fxKnobIds.push(
        createKnob(knobs, 'param 1', fxKnobOnChange(0), fxKnobGetValue(0), fxKnobFormatter(0)),
        createKnob(knobs, 'param 2', fxKnobOnChange(1), fxKnobGetValue(1), fxKnobFormatter(1)),
        createKnob(knobs, 'param 3', fxKnobOnChange(2), fxKnobGetValue(2), fxKnobFormatter(2)),
        createKnob(knobs, 'param 4', fxKnobOnChange(3), fxKnobGetValue(3), fxKnobFormatter(3)),
    );
    fxEdit();
    setTimeout(() => {
        const search = location.search.substr(1).split('=');
        if (search[0] === 'shareToken') {
            dataStoreServerApi.getSharedData(search[1], response => {
                convertLoadedData(response);
                alert(`Loaded a track named '${response.name}' by ${response.owner}.`);
            });
        }
    }, 100);

    document.getElementById('preset-select').innerHTML += synthPresets.getPresetsAsHtml();
    initStaticBindings();
};


const clickGridCell = (x, y) => {
    if (!pages[currentPage].notes[x][y]) {
        pages[currentPage].notes[x][y] = true;
        document.querySelector(`[data-step="${x},${y}"]`).classList.add('grid-cell--active');
    } else {
        pages[currentPage].notes[x][y] = false;
        document.querySelector(`[data-step="${x},${y}"]`).classList.remove('grid-cell--active', 'grid-cell--playing--active');
    }
    updateSequence();
};

const clickCompositionGridCell = (x) => {
    if (!pages[currentPage].composition[x + pages[currentPage].compositionEditStartStep]) {
        pages[currentPage].composition[x + pages[currentPage].compositionEditStartStep] = true;
        document.querySelector(`[data-step="${x},8"]`).classList.add('grid-cell--active');
    } else {
        pages[currentPage].composition[x + pages[currentPage].compositionEditStartStep] = false;
        document.querySelector(`[data-step="${x},8"]`).classList.remove('grid-cell--active', 'grid-cell--playing--active');
    }
    updateSequence();
};