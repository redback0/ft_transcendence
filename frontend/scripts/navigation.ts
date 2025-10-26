const mainMenu = document.getElementById("main-menu");
const warning = document.getElementById("warning");
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
        body.style.overflow = "auto";
    }
    else
        console.error("ERROR: mainMenu element not found.");
}

(window as any).openMenu = openMenu;
(window as any).closeMenu = closeMenu;


function openWarning() {

	const warning = document.getElementById("warning");
	if (warning) {
    warning.classList.add("active");
    body.style.overflow = "";
  } else {
    console.error("ERROR: warning element not found.");
  }
}

function closeWarning() {
	const warning = document.getElementById("warning");
  if (warning) {
    warning.classList.remove("active");
    body.style.overflow = "auto";
  } else {
    console.error("ERROR: warning element not found.");
  }
}

(window as any).openWarning = openWarning;
(window as any).closeWarning = closeWarning;

