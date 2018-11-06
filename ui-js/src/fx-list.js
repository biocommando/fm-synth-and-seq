export const fxList = [
    {
        name: 'delay', params: [
            { name: 'delay', default: 250, min: 1, max: 1000, suffix: 'ms' },
            { name: 'feed', default: 0.25, min: 0, max: 1 },
            { name: 'wet', default: 0.25, min: 0, max: 1 }]
    },
    {
        name: 'distortion', params: [
            { name: 'gain', default: 5, min: 0.1, max: 20 },
            { name: 'clip', default: 1, min: 0.1, max: 2 }
        ]
    },
    {
        name: 'overdrive', params: [
            { name: 'gain', default: 5, min: 0, max: 20 }
        ]
    },
    {
        name: 'flanger', params: [
            { name: 'frequency', default: 1, min: 0, max: 20, suffix: 'Hz' },
            { name: 'delay', default: 0.3, min: 0, max: 1 },
            { name: 'depth', default: 0.3, min: 0, max: 1 },
            { name: 'wet', default: 0.5, min: 0, max: 1 }
        ]
    },
    {
        name: 'amplify', params: [
            { name: 'gain', default: 1, min: 0, max: 5 }
        ]
    },
    {
        name: 'tremolo', params: [
            { name: 'frequency', default: 1, min: 0, max: 20, suffix: 'Hz' },
            { name: 'depth', default: 0.5, min: 0, max: 1 }
        ],
    },
    {
        name: 'tone', params: [
            { name: 'lowCutFreq', default: 1, min: 0, max: 1 },
            { name: 'highCutFreq', default: 0, min: 0, max: 1 }
        ]
    },
    {
        name: 'compressor', params: [
            { name: 'threshold', default: 0.1, min: 0, max: 1 },
            { name: 'ratio', default: 4, min: 0, max: 10 },
            { name: 'attack', default: 200, min: 0, max: 1000, suffix: 'ms' },
            { name: 'release', default: 200, min: 0, max: 1000, suffix: 'ms' }
        ]
    },
    {
        name: 'percussion', params: [
            { name: 'decay', default: 200, min: 0, max: 1000, suffix: 'ms' }
        ]
    }
];
