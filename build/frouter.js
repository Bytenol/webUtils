let DEBUG = false;
let isInitialised = false;
let history = [];
const routes = {};
const routesEnterCb = {};
const routesExitCb = {};
const init = (props) => {
    if (isInitialised) {
        dLog("frouter: multiple Initialisation ineffective");
        return;
    }
    DEBUG = props.debug || false;
    if (!updatePages(props.pageClass)) {
        dLog("error", "frouter: Initialisation Failed");
        return;
    }
    if (!isPath(props.homePage)) {
        dLog("error", "frouter: Starting page does not exist");
        return;
    }
    goto(props.homePage);
    if (!updateNavigations(props.navClass)) {
        dLog("warn", "frouter: No navigator found on this site");
    }
    initStyle(props.pageClass);
    if (!isInitialised) {
        isInitialised = true;
    }
};
const dLog = (type = "log", ...msg) => {
    if (!DEBUG)
        return;
    console[type](...msg);
};
const initStyle = (pageClass) => {
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
};
const updatePages = (className) => {
    const allPages = [...document.querySelectorAll(`.${className}`)];
    if (!allPages.length)
        return false;
    allPages.forEach((page) => {
        const urls = [...page.attributes].filter(i => i.name === "data-url");
        if (urls.length) {
            const url = urls[0].value;
            routes[url] = page;
        }
    });
    return true;
};
const updateNavigations = (className) => {
    const allNavs = [...document.querySelectorAll(`.${className}`)];
    if (!allNavs.length)
        return false;
    allNavs.forEach((nav) => {
        const urls = [...nav.attributes].filter(i => i.name === "data-goto");
        if (urls.length) {
            const url = urls[0].value;
            nav.addEventListener("click", () => {
                if (url === "back") {
                    back();
                }
                else {
                    goto(url);
                }
            });
        }
    });
    return true;
};
const pageEnter = (path) => {
    routes[path].style.display = "block";
    if (typeof routesEnterCb[path] === "function")
        routesEnterCb[path]();
};
const pageExit = (path) => {
    if (typeof routesExitCb[path] === "function")
        routesExitCb[path]();
    routes[path].style.display = "none";
};
const goto = (path) => {
    if (!isPath(path)) {
        console.error("frouter: The path " + path + " does not exist");
        return;
    }
    if (!isInitialised) {
        history.push(path);
        pageEnter(getCurrentPage());
        return;
    }
    if (path === getCurrentPage()) {
        dLog("log", "frouter: last and goto-page are the same");
        return;
    }
    history.push(path);
    pageExit(getLastPage());
    pageEnter(getCurrentPage());
};
const back = () => {
    if (history.length <= 1) {
        dLog("log", "frouter: Reached the minimum history");
        return;
    }
    pageExit(getCurrentPage());
    history.pop();
    pageEnter(getCurrentPage());
};
const isPath = (url) => routes[url] || false;
const getCurrentPage = () => history[history.length - 1];
const getLastPage = () => history[history.length - 2];
const onEnter = (path, cb) => {
    if (!isPath(path))
        return false;
    routesEnterCb[path] = cb;
    return true;
};
const onExit = (path, cb) => {
    if (!isPath(path))
        return false;
    routesExitCb[path] = cb;
    return true;
};
const clearHistory = () => {
    history = [getCurrentPage()];
};
export { init, getCurrentPage, getLastPage, clearHistory, back, onExit, onEnter };
