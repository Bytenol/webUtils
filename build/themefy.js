let DEBUG = false;
let isInitialised = false;
let className;
let lastTheme;
let transition;
let currentTheme;
let themes = {};
const init = (props) => {
    if (isInitialised) {
        dLog("themefy: multiple Initialisation ineffective");
        return;
    }
    DEBUG = props.debug || false;
    transition = props.transition || null;
    className = props.className;
    themes = { ...props.theme };
    if (!themes[props.default]) {
        dLog("error", "themefy: Default theme does not exists");
        return;
    }
    initStyle();
    setTheme(props.default);
    if (!isInitialised)
        isInitialised = true;
};
const dLog = (type = "log", ...msg) => {
    if (!DEBUG)
        return;
    console[type](...msg);
};
const initStyle = () => {
    let styles = "";
    for (const name in themes) {
        for (const attr in themes[name]) {
            const cssclass = `${className}-${name}-${attr}`;
            const propName = cssclass.split("-")[2];
            const prop = propName.startsWith("bg") ? "background-color" :
                propName.startsWith("fg") ? "color" :
                    propName.startsWith("fl") ? "fill" : "fill";
            let trans = `transition: ${(transition ? transition : "")};`;
            styles += `.${cssclass} {
                ${prop}:${themes[name][attr]};
                ${trans}
            }\n`;
        }
    }
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
};
const isTheme = (name) => themes[name] !== undefined;
const getCurrentTheme = () => themes[currentTheme];
const setTheme = (name) => {
    if (!isTheme(name)) {
        dLog("error", `themefy: ${name} is not a theme`);
        return;
    }
    lastTheme = lastTheme ? currentTheme : name;
    currentTheme = name;
    for (const attr in getCurrentTheme()) {
        const _className = `${className}-${attr}`;
        const elNodes = [...document.querySelectorAll(`.${_className}`)];
        const _cssClassLast = `${className}-${lastTheme}-${attr}`;
        const _cssClassNew = `${className}-${currentTheme}-${attr}`;
        elNodes.forEach(el => {
            const hasLast = [...el.classList].includes(_cssClassLast);
            if (hasLast)
                el.classList.remove(_cssClassLast);
            el.classList.add(_cssClassNew);
        });
    }
};
const createThemeChooser = () => {
    const el = document.createElement("select");
    el.classList.add(`${className}-themeChooser`);
    for (const name in themes) {
        const option = document.createElement("option");
        if (name === currentTheme) {
            option.selected = true;
        }
        option.value = name;
        option.textContent = name;
        el.appendChild(option);
    }
    el.addEventListener("change", e => {
        setTheme(el.options[el.options.selectedIndex].value);
    });
    return el;
};
export { init, isTheme, setTheme, createThemeChooser };
