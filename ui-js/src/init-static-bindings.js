import {play, stop} from './play-sequence'
import {setPageName, changeCurrentFx, fromToJson, clearPage, copy, insertFx, page, paste, removeCurrentFx, selectPreset, clearTrack, selectPage} from './synth-editor'

export const initStaticBindings = () => {
    document.getElementById('play-button').onclick = play;
    document.getElementById('stop-button').onclick = stop;
    document.getElementById('page-name').onchange = setPageName;
    document.getElementById('clear-button').onclick = clearPage;
    document.getElementById('copy-button').onclick = copy;
    document.getElementById('paste-button').onclick = paste;
    /*document.getElementById('page-minus-button').onclick = () => page(-1);
    document.getElementById('page-plus-button').onclick =  () => page(1);*/
    document.getElementById('current-fx').onchange = changeCurrentFx;
    document.getElementById('fx-list').onchange = insertFx;
    document.getElementById('remove-fx-button').onclick = removeCurrentFx;
    document.getElementById('save-load-button').onclick = fromToJson;
    document.getElementById('preset-select').onchange = selectPreset;
    document.getElementById('clear-track-button').onclick = clearTrack;
    document.getElementById('page-selector').onchange = selectPage;
}