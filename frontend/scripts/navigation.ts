const mainMenu = document.getElementById("main-menu");
const navBar = document.getElementById("nav-bar");
const body = document.body;

function openMenu() {
    if (mainMenu) {
        mainMenu.style.height = "100vh";
        body.style.overflow = "";
    }
    else
        console.error("ERROR: mainMenu element not found.");
}

function closeMenu() {
    if (mainMenu) {
        mainMenu.style.height = "0";
        body.style.overflow = "hidden";
    }
    else
        console.error("ERROR: mainMenu element not found.");
}

(window as any).openMenu = openMenu;