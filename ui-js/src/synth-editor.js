import { fetchKnobs } from './knobs';
import * as state from './state';
import { play, stop, updateSequence } from './play-sequence'
import { init, createNotes, createPage } from './synth-editor-init';
import { bind, sealBindings } from './ui-bind';
import dataStoreServerApi from './data-store-server-api';
import { fxList } from './fx-list';
import { getPreset } from './synth-presets';

export const clearPage = () => {
    state.pages[state.currentPage].notes = createNotes();
    state.pages[state.currentPage].composition = [];
    page(0);
    updateSequence();
};

export const copy = () => {
    state.clipBoard = state.pages[state.currentPage];
};

export const paste = () => {
    if (state.clipBoard) {
        state.pages[state.currentPage] = JSON.parse(JSON.stringify(state.clipBoard));
        page(0);
        updateSequence();
    }
};

const zeropad = (num, width) => {
    const strNum = String(num);
    return '0'.repeat(width - strNum.length) + strNum;
}

const updatePageSelector = () => {
    const pages = [...state.pages];
    if (pages.length < 32) {
        pages.push({ name: '+ Add new page' });
    }
    document.getElementById('page-selector').innerHTML = pages.map((page, pageNum) =>
        `<option value="${pageNum - state.currentPage}"${pageNum === state.currentPage ? ' selected' : ''}>${zeropad(pageNum + 1, 2)}: ${page.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</option>`);
}

export const page = direction => {
    state.currentPage += direction;
    if (state.currentPage < 0) state.currentPage = 0;
    else if (state.currentPage >= 32) state.currentPage = 31;
    if (!state.pages[state.currentPage]) state.pages[state.currentPage] = createPage();
    Array.from(document.querySelectorAll(`.grid-cell`))
        .forEach(el => el.classList.remove('grid-cell--active', 'grid-cell--playing--active'));
    state.pages[state.currentPage].notes.forEach((singleNotes, x) => {
        singleNotes.forEach((isOn, y) => {
            if (isOn) {
                document.querySelector(`[data-step="${x},${y}"]`).classList.add('grid-cell--active');
            }
        })
    });
    state.pages[state.currentPage].composition.forEach((st, x) => {
        if (st && x >= state.pages[state.currentPage].compositionEditStartStep && x < (state.pages[state.currentPage].compositionEditStartStep + 1) * 16) {
            const el = document.querySelector(`[data-step="${x - state.pages[state.currentPage].compositionEditStartStep},8"]`);
            el && el.classList.add('grid-cell--active');
        }
    });
    state.currentFx = 0;
    //document.getElementById('page-num').innerText = zeropad(state.currentPage + 1, 2);
    setFmParam();
    fxEdit();
    document.getElementById('page-name').value = state.pages[state.currentPage].name;
    updatePageSelector();
};

export const selectPage = () => {
    const offset = Number(document.getElementById('page-selector').value);
    if (!isNaN(offset)) {
        page(offset);
    }
}

export const setFmParam = (paramNum, value) => {
    if (paramNum >= 0 && paramNum <= 3) {
        const newVal = value === undefined ? Number(prompt('Type the new value', state.pages[state.currentPage].fmParams[paramNum])) : value;
        if (!isNaN(newVal) && newVal >= 0) {
            state.pages[state.currentPage].fmParams[paramNum] = newVal;
        }
    }
    updateSequence();
    fetchKnobs();
};

/*export const selectPreset = () => {
    const val = document.getElementById('preset-select').value;
    if (val !== 'none') {
        JSON.parse(val).forEach((a, i) => setFmParam(i, a));
        updateSequence();
    }
    document.getElementById('preset-select').value = 'none';
};*/

export const selectPreset = () => {
    const val = document.getElementById('preset-select').value;
    if (val === 'none') {
        return;
    }

    const preset = getPreset(val);
    preset.synth.forEach((a, i) => setFmParam(i, a));
    state.pages[state.currentPage].fx = [...preset.fx];
    state.pages[state.currentPage].octave = preset.octave;
    document.getElementById('preset-select').value = 'none';
    updateSequence();
    page(0);
};

export const setPageName = () => {
    state.pages[state.currentPage].name = name = document.getElementById('page-name').value;
    updatePageSelector();
};
export const setTempo = value => {
    state.tempo = value;
    updateSequence();
    fetchKnobs();
};
export const setOctave = (value) => {
    state.pages[state.currentPage].octave = value;
    updateSequence();
}
const toJson = () => {
    return JSON.stringify({
        tempo: state.tempo, tempo: state.pages
    });
};
const fromJson = json => {
    const obj = JSON.parse(json);
    state.tempo = obj.tempo;
    /*obj.pages.forEach(page => {
        page.notes = page.notes.map(n => n === null ? undefined : n);
    });*/
    state.pages.splice(0);
    state.pages.push(...obj.pages);
    updateSequence();
    page(0);
}
export const fxEdit = (paramNum, value) => {
    if (state.pages[state.currentPage].fx[state.currentFx]) {
        document.getElementById('fx-param-knobs').classList.remove('hidden');
        if (paramNum >= 0 && paramNum <= 3) {
            const newVal = value === undefined ? Number(prompt('Type the new value', state.pages[state.currentPage].fx[state.currentFx].params[paramNum])) : value;
            if (!isNaN(newVal) && newVal >= 0) {
                state.pages[state.currentPage].fx[state.currentFx].params[paramNum] = newVal;
                updateSequence();
            }
        }
        const fx = fxList.find(f => f.name === state.pages[state.currentPage].fx[state.currentFx].name);
        state.pages[state.currentPage].fx[state.currentFx].params.forEach((val, i) => {
            document.getElementById(state.fxKnobIds[i]).parentElement.classList.remove('hidden');
            document.querySelector(`#${state.fxKnobIds[i]} + span`).innerText = fx.params[i].name;
        });
        for (let i = state.pages[state.currentPage].fx[state.currentFx].params.length; i < 4; i++) {
            document.getElementById(state.fxKnobIds[i]).parentElement.classList.add('hidden');
        }
    } else {
        document.getElementById('fx-param-knobs').classList.add('hidden');
        [0, 1, 2, 3].forEach(i => {
            if (state.fxKnobIds[i]) { // this is false during page init
                document.getElementById(state.fxKnobIds[i]).parentElement.classList.add('hidden');
            }
        });
    }
    let currentFxHtml = `<option value="none">choose...</option>`;
    state.pages[state.currentPage].fx.forEach((fx, i) => {
        currentFxHtml += `<option ${state.currentFx === i ? 'selected' : ''}>${fx.name}</option>`;
    });
    document.getElementById('current-fx').innerHTML = currentFxHtml;
    fetchKnobs();
};
export const insertFx = () => {
    const val = document.getElementById('fx-list').value;
    if (val !== 'none') {
        const defaultParams = fxList.find(fx => fx.name === val).params.map(param => param.default);
        state.pages[state.currentPage].fx.push({
            name: val,
            params: [...defaultParams]
        });
        updateSequence();
    }
    document.getElementById('fx-list').value = 'none';
    fxEdit();
};
export const changeCurrentFx = () => {
    const val = document.getElementById('current-fx').value;
    if (val !== 'none') {
        state.currentFx = document.getElementById('current-fx').selectedIndex - 1;
        fxEdit();
        updateSequence();
    }
};

export const clearTrack = () => {
    if (confirm('Clear all the data on the current track?')) {
        state.pages.splice(0);
        state.pages.push(createPage());
        page(-100);
    }
}

export const removeCurrentFx = () => {
    if (state.pages[state.currentPage].fx[state.currentFx]) {
        state.pages[state.currentPage].fx.splice(state.currentFx, 1);
        state.currentFx = 0;
        fxEdit();
        updateSequence();
    }
};

export const saveData = (id, name) => {
    if (id) {
        if (!confirm('Overwrite the existing track?')) {
            return;
        }
    }
    const requestData = { object: { tempo: state.tempo, pages: state.pages }, name };
    dataStoreServerApi.setData(id, requestData, response => {
        if (response.success) {
            fromToJson();
            alert('Data saved');
        }
    });
}

// for debugging
window.setTrackDataJSON = text => convertLoadedData({ success: true, data: JSON.parse(text) });

export const convertLoadedData = response => {
    if (response.success) {
        state.tempo = response.data.tempo;
        state.pages.splice(0);
        state.pages.push(...response.data.pages);
        updateSequence();
        page(-100); // Set the page to 0
    }
};

export const loadData = id => {
    document.getElementById('to-json').classList.add('hidden');
    dataStoreServerApi.getData(id, response => {
        convertLoadedData(response);
        alert('Data loaded');
    });
};

export const deleteData = id => {
    if (confirm('Delete the selected track?')) {
        dataStoreServerApi.deleteData(id, response => {
            if (response.success) {
                alert('Data deleted');
                fromToJson();
            }
        });
    }
};

export const shareData = id => {
    dataStoreServerApi.createShareToken(id, response => {
        if (response.success) {
            prompt(
                'Copy the share link:',
                location.origin + location.pathname + '?shareToken=' + response.shareToken
            );
            fromToJson();
        }
    });
};

export const fromToJson = () => {
    dataStoreServerApi.getDirectory(response => {
        if (response.code === 'DIRECTORY_OK') {
            document.getElementById('to-json').classList.remove('hidden');
            const html = response.data.map(d => `<tr>
                <td>${d.name}</td>
                <td>${new Date(d.modified).toDateString()}</td>
                <td><button ${bind('onclick', () => saveData(d.id, d.name))}>Overwrite</button></td>
                <td><button ${bind('onclick', () => deleteData(d.id))}>Delete</button></td>
                <td><button ${bind('onclick', () => loadData(d.id))}>Load</button></td>
                <td><button ${bind('onclick', () => shareData(d.id))}>Share</button></td>
                </tr>`).join('');
            document.getElementById('directory').innerHTML = html +
                `<tr>
            <td><input id="save-file" value="New file"/></td>
            <td></td>
            <td><button ${bind('onclick', () => saveData(undefined, document.getElementById('save-file').value))}>Save</button></td>
            <td colspan="3"></td>
            </tr>`;
            sealBindings();
        }
    })
    //document.getElementById('json-text').value = toJson();
};

const loadJson = () => {
    fromJson(document.getElementById('json-text').value);
    document.getElementById('to-json').classList.add('hidden');
};

export const updatePlayStatusToGrid = () => {
    if (!state.synth) {
        return;
    }
    if (state.synth.playing()) {
        document.querySelectorAll('[data-step]').forEach(e => e.classList.remove('grid-cell--playing'));
        const seqPageStartStep = Math.floor(state.synth.step() / 32 / 16) * 16;
        const compositionStep = Math.floor(state.synth.step() / 32) % 16;
        if (state.pages[state.currentPage].composition[seqPageStartStep + compositionStep]) {
            const seqStep = Math.floor(state.synth.step() / 2) % 16;
            for (let i = 0; i < 8; i++) {
                document.querySelector(`[data-step="${seqStep},${i}"]`).classList.add('grid-cell--playing');
            }
        }
        if (state.pages[state.currentPage].compositionEditStartStep === seqPageStartStep) {
            document.querySelector(`[data-step="${compositionStep},8"]`).classList.add('grid-cell--playing');
        }
    } else {
        document.querySelectorAll('[data-step]').forEach(e => e.classList.remove('grid-cell--playing'));
    }
};

setTimeout(init, 0);