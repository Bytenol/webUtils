interface initParam {
    debug?: boolean,
    transition?: string,
    className: string,
    theme: any,
    default: string,
}

let DEBUG = false;
let isInitialised = false;
let className: string;
let lastTheme: string | null;
let transition: string | null;
let currentTheme: string;
let themes: any = { };

const enum N {
    BACKGROUND = "bg",
    FOREGROUND = "fg",
    FILL = "fl",
    SEPERATOR = '-'
}

const init = (props: initParam): void => {
    // prevent multiple initialisation
    if (isInitialised) {
        dLog("themefy: multiple Initialisation ineffective");
        return;
    }

    DEBUG = props.debug || false;
    transition = props.transition || null;
    className = props.className;
    themes = { ...props.theme };
    if(!themes[props.default]) {
        dLog("error", "themefy: Default theme does not exists");
        return;
    }

    initStyle();
    setTheme(props.default);

    if (!isInitialised) isInitialised = true;
}

const dLog = (type: string = "log", ...msg: string[]): void => {
    if(!DEBUG) return;
    // @ts-ignore
    console[type](...msg);
}

const initStyle = (): void => {
    let styles = "";
    for(const name in themes) {
        for(const attr in themes[name]) {
            const cssclass = `${className}-${name}-${attr}`;
            const propName = cssclass.split(N.SEPERATOR)[2];
            const prop = propName.startsWith(N.BACKGROUND) ? "background-color":
                propName.startsWith(N.FOREGROUND) ? "color" :
                    propName.startsWith(N.FILL) ? "fill" : "fill";
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
}

const isTheme = (name: string): boolean => themes[name] !== undefined;

const getCurrentTheme = () => themes[currentTheme];

const setTheme = (name: string): void => {
    if(!isTheme(name)) {
        dLog("error", `themefy: ${name} is not a theme`);
        return;
    }

    // update last and current themes
    lastTheme = lastTheme ? currentTheme : name;
    currentTheme = name;

    for(const attr in getCurrentTheme()) {
        const _className = `${className}-${attr}`;
        const elNodes = <Array<HTMLElement>>[...document.querySelectorAll(`.${_className}`)];
        const _cssClassLast = `${className}-${lastTheme}-${attr}`;  //T-default-bg0 [class, themeName, themeProp]
        const _cssClassNew = `${className}-${currentTheme}-${attr}`;
        elNodes.forEach(el => {
            const hasLast = [...el.classList].includes(_cssClassLast);
            if(hasLast) el.classList.remove(_cssClassLast);
            el.classList.add(_cssClassNew);
        });
    }
}

const createThemeChooser = () => {
    const el = document.createElement("select");
    el.classList.add(`${className}-themeChooser`);
    for(const name in themes) {
        const option = document.createElement("option");
        if(name === currentTheme) {
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
}

export { init, isTheme, setTheme, createThemeChooser }