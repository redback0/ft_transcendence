//Authored by Bethany Milford 18/07/2025
import { formatDiagnostic } from "typescript";
import { hashPassword } from "./signup_action";

const Loginform = document.getElementById('LoginForm') as HTMLFormElement;
//const Loginerror = document.getElementById('error') as HTMLParagraphElement;


Loginform.addEventListener('submit', (event) =>
    {
        event.preventDefault();
        const username = (document
          .getElementById('user') as HTMLInputElement)
          .value; 
        Loginform.innerHTML = `<p> Yay stuff </p>`;
        const password = (document
            .getElementById('pass') as HTMLInputElement)
            .value;
   });

