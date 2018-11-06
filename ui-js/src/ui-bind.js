const bindings = [];

let counter = 0;
/**
 * Creates a data-attribute for insertion to HTML code as is, that is used later
 * to bind the element's event handler to the provided function.
 * Usage:
 * ```
 * const html = `<button ${bind('onclick', () => handleClick())}>my button</button>`
 * // ... other dynamic html creation code here ...
 * element.innerHTML = html
 * // This binds the created data-attribute to the
 * // provided function using the onclick event.
 * // After calling this function, bind's state is cleared
 * // and calling this again will not bind already bound
 * // elements.
 * sealBindings()
 * ```
 */ 
export const bind = (event, fn) => {
    ++counter;
    bindings.push({counter, event, fn});
    return `data-dynamic-binding-id="${counter}"`;
}

/**
 * See bind.
 */
export const sealBindings = () => {
    bindings.splice(0).forEach(b => {
        document.querySelector(`[data-dynamic-binding-id="${b.counter}"]`)[b.event] = b.fn;
    });
};
