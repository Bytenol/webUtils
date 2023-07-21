/**
 * @todo
 * Add animation for enter/exit
 * add support for dynamic page creation/buttons navigator by updating state
 */
interface initParam {
    debug?: boolean,
    pageClass: string,  // name for page classes
    navClass: string,   // name for navigations widget class [button, a, etc]
    homePage: string   // home pafe
}

let DEBUG = false;
let isInitialised = false;
let history: string[] = [];
const routes: any = { };
const routesEnterCb: any = { };
const routesExitCb: any = { };

// attributes to expect
const enum E {
    URL = "data-url",
    GOTO = "data-goto",
    BACK = "back"
}

const init = (props: initParam): void => {
    // prevent multiple initialisation
    if(isInitialised) {
        dLog("frouter: multiple Initialisation ineffective");
        return;
    }

    DEBUG = props.debug || false;
    if(!updatePages(props.pageClass)) {
        dLog("error", "frouter: Initialisation Failed");
        return;
    }

    if(!isPath(props.homePage)) {
        dLog("error", "frouter: Starting page does not exist");
        return;
    }

    goto(props.homePage);

    if(!updateNavigations(props.navClass)) {
        dLog("warn", "frouter: No navigator found on this site");
    }

    initStyle(props.pageClass);

    // initialise only once
    if(!isInitialised) {
        isInitialised = true;
    }
}

const dLog = (type: string = "log", ...msg: string[]): void => {
    if(!DEBUG) return;
    // @ts-ignore
    console[type](...msg);
}

const initStyle = (pageClass: string): void => {
    const styles = `
    body {
        width: 100vw;
        height: 100vh;
        overflow: hidden;    
    }
    
    .${pageClass} {
        width: 100vw;
        height: 100vh;
        overflow: scroll;
        overflow-x: hidden;
        display: none;
    }`;

    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
}

const updatePages = (className: string): boolean => {
    // select all pages
    const allPages = [...document.querySelectorAll(`.${className}`)];

    if(!allPages.length) return false;

    allPages.forEach((page) => {
        const urls = [...page.attributes].filter(i => i.name === E.URL);
        if(urls.length) {
            const url = (urls[0] as Attr).value;
            routes[url] = page;
        }
    });
    return true;
}

const updateNavigations = (className: string): boolean => {
    // select all pages
    const allNavs = [...document.querySelectorAll(`.${className}`)];

    if(!allNavs.length) return false;

    allNavs.forEach((nav) => {
        const urls = [...nav.attributes].filter(i => i.name === E.GOTO);
        if(urls.length) {
            const url = (urls[0] as Attr).value;
            nav.addEventListener("click", () => {
                if(url === E.BACK) {
                    back();
                } else {
                    goto(url);
                }
            });
        }
    });

    return true;
}

const pageEnter = (path: string) => {
    (<HTMLElement>routes[path]).style.display = "block";
    if(typeof routesEnterCb[path] === "function") routesEnterCb[path]();
}

const pageExit = (path: string) => {
    if(typeof routesExitCb[path] === "function") routesExitCb[path]();
    (<HTMLElement>routes[path]).style.display = "none";
}

const goto = (path: string) => {
    if(!isPath(path)) {
        console.error("frouter: The path " + path + " does not exist");
        return;
    }
    if(!isInitialised) {
        history.push(path);
        pageEnter(getCurrentPage());
        return;
    }
    if(path === getCurrentPage()) {
        dLog("log", "frouter: last and goto-page are the same");
        return;
    }
    history.push(path);
    pageExit(getLastPage());
    pageEnter(getCurrentPage());
}

const back = (): void => {
    if(history.length <= 1) {
        dLog("log", "frouter: Reached the minimum history");
        return;
    }
    pageExit(getCurrentPage());
    history.pop();
    pageEnter(getCurrentPage());
}

const isPath = (url: string): boolean => routes[url] || false;

const getCurrentPage = () => history[history.length - 1];

const getLastPage = () => history[history.length - 2];

const onEnter = (path: string, cb: Function): boolean => {
    if(!isPath(path)) return false;
    routesEnterCb[path] = cb;
    return true;
}

const onExit = (path: string, cb: Function): boolean => {
    if(!isPath(path)) return false;
    routesExitCb[path] = cb;
    return true;
}

const clearHistory = () => {
    history = [getCurrentPage()];
}

export { init, getCurrentPage, getLastPage, clearHistory, back, onExit, onEnter }