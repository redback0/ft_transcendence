//Authored by Bethany Milford 22/06/2025
export class LoginPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
            `
            <p> This is the login page, Welcome!!</p>
            <form method="GET" id="LoginForm">
                <div class= "container">
                    <label for="user"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="user" required>
                    <br>
                    <label for="pass"><b>Password </b></label>
                    <input type="password" placeholder="Enter Password" name="pass" required>
                    <br>
                    <button type="submit">Login</button>
                </div>
                <!-- <div class= "container" style="background-color:#dacecb">
                    <span class="pass"><a href="password">Forgot password?</a></span>
                </div> 
                -->
            </form> 
            <br>
            <br>
            <p> This is the Sign Up section :)))</p>
            <form method="POST" id="SignInForm">
                <div class= "container">
                    <label for="new_user"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="new_user" required>
                    <br>
                    <label for="new_pass"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="new_pass" required>
                    <br>
                    <label for="new_pass2"><b>Re-Enter Password</b></label>
                    <input type="password" placeholder="Re-Enter Password" name="new_pass2" required>
                    <br>
                    <button type="submit">Sign Up</button>
                </div>
            </form>
            `;
    }
}
customElements.define('login-page', LoginPage);