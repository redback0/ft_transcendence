//Authored by Bethany Milford 22/06/2025
export class LoginPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
            `
            <p> This is the login page, Welcome!!</p>
            <form action="login_action.js"  method="post" >
                <div class= "container">
                    <label for="user"><b>Username</b></label>
                    <input type="text"
                        placeholder="Enter Username" 
                        name="user" 
                        required
                        minlength="6"
                        maxlength="16"
                     />
                    <br>
                    <label for="pass"><b>Password </b></label>
                    <input type="password" 
                        placeholder="Enter Password" 
                        name="pass" 
                        required
                        minlength="8"
                        maxlength="16
                    />
                    <br>
                    <button onclick="loginbutton()">Login</button>
                </div>
                <!-- <div class= "container" style="background-color:#dacecb">
                    <span class="pass"><a href="password">Forgot password?</a></span>
                </div> 
                -->
            </form> 
            `;
    }
}
customElements.define('login-page', LoginPage);