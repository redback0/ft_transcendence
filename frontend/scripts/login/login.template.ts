//Authored by Bethany Milford 22/06/2025
// DEPRICATED -- NOW IS JUST THE HOME PAGE AND /signup
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
                    <button type="button" id="loginButton">Login</button>
                </div>
            </form> 
            <br>
            <br>
            <p> This is the Sign Up section :)))</p>
            <form method="POST" id="SignInForm">
                <div class="container">
                    <label for="new_user"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" id="new_user" name="new_user" required>
                </div
                    <br>
                <div>
                    <label for="new_pass"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" id="new_pass" name="new_pass" required>
                </div>
                    <br>
                <div>
                    <label for="new_pass2"><b>Re-Enter Password</b></label>
                    <input type="password" placeholder="Re-Enter Password" id="new_pass2" name="new_pass2" required>
                </div>
                    <br>
                <div>
                    <button type="button" id="signupButton">Sign Up</button>
                </div>
            </form>
            `;
    }
}
customElements.define('login-page', LoginPage);