const getRawPreset = name => {
	switch(name) {
		case 'bass':
		return [0.5, 0.5, 0.42, 0.4];
		case 'pad':
		return [2.01, 0.22, .21, 0.33];
		case 'mallet':
		return [8, 0.61, .5, 0];
		case 'lead1':
		return [1.5, 1.8, 0.25, 0.1];
		case 'lead2':
		return [2.5, 3.4, 0.3, 0.3];
		case 'kick':
		return [0.2, 3.1, 1, 0];
		case 'hihat':
		return [26, 630, 0.5, 0];
		case 'sine':
		default:
		return [0, 0, 1, 0];
	}	
};
const getPreset = (name, vol, fx) => {
	const preset = getRawPreset(name);
	preset[2] *= vol;
	preset[3] *= vol;
	return [...preset, fx];
};
