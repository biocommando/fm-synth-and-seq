const baseOctave = 4;
const presets = {
    Init: {
        synth: [0, 0, 1, 0.0],
        fx: [],
        octave: baseOctave
    },
    Bass: {
        synth: [0.5, 0.5, 0.42, 0.4],
        fx: [
            { name: 'overdrive', params: [10] }
        ],
        octave: baseOctave - 1
    },
    Pad: {
        synth: [2.01, 0.22, 0.21, 0.33],
        fx: [
            { name: 'flanger', params: [1, .3, .3, .5] },
            { name: 'delay', params: [250, .25, .25] },
        ],
        octave: baseOctave
    },
    Mallet: {
        synth: [8, 0.61, 0.5, 0],
        fx: [
            { name: 'percussion', params: [300] },
            { name: 'delay', params: [250, .15, .3] },
        ],
        octave: baseOctave
    },
    'Lead 1': {
        synth: [1.5, 1.8, 0.25, 0.1],
        fx: [
            { name: 'distortion', params: [9, .7] },
            { name: 'flanger', params: [2.9, .21, .16, .44] },
            { name: 'tone', params: [0.6, .06] },
            { name: 'amplify', params: [1.9] },
            { name: 'delay', params: [125, .38, .34] },
        ],
        octave: baseOctave
    },
    'Lead 2': {
        synth: [2.5, 3.4, 0.3, 0.3],
        fx: [
            { name: 'tremolo', params: [10, 1] },
            { name: 'distortion', params: [10, .5] },
            { name: 'delay', params: [250, .25, .25] },
        ],
        octave: baseOctave
    },
    'Kick drum': {
        synth: [0.2, 3.1, 1, 0],
        fx: [
            { name: 'percussion', params: [90] },
            { name: 'compressor', params: [0.1, 4, 200, 200] },
            { name: 'tone', params: [1, 0.015] },
            { name: 'amplify', params: [2] },
            { name: 'amplify', params: [5] },
        ],
        octave: baseOctave - 2
    },
    'Hi-hat': {
        synth: [26, 630, 0.5, 0], fx: 
        [
            { name: 'percussion', params: [75] },
            { name: 'tone', params: [1, 0.08] },
            { name: 'amplify', params: [2] },
        ],
        octave: baseOctave
    },
    'Snare drum': {
        synth: [33, 1011, 1, 0], fx: 
        [
            { name: 'percussion', params: [250] },
        ],
        octave: baseOctave - 1
    }
};

export const getPresetsAsHtml = () => {
    return Object.keys(presets).map(preset => `<option value="${preset}">${preset}</option>`).join('');
};

export const getPreset = name => {
    return presets[name];
};
