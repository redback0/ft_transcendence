//Authored by Bethany Milford 22/06/2025
export class LoginPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
        `
            <p> This is the login page, Welcome!!</p>
            <form method="POST" id="LoginForm">
                <div class="container">
                    <label for="user"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" id="user" name="user" required>
                </div>
                    <br>
                <div> 
                    <label for="pass"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" id="pass" name="pass" required>
                </div>
                    <br>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form> 
        `; 
    }
}
customElements.define('login-page', LoginPage);