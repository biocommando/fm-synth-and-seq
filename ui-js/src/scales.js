const mapScale = (...scale) => {
    let note = 2;
    const notes = [note];
    for (let i = 0; i < 7; i++) {
        note += scale[i];
        notes.push(note);
    }
    return notes.reverse();
};

export const scales = {
    'n.min': mapScale(2, 1, 2, 2, 1, 2, 2),
    'major': mapScale(2, 2, 1, 2, 2, 2, 1),
    'h.min': mapScale(2, 1, 2, 2, 1, 3, 1),
    'm.min': mapScale(2, 1, 2, 2, 2, 2, 1),
    'penta': mapScale(2, 2, 3, 2, 3, 2, 2)
};
