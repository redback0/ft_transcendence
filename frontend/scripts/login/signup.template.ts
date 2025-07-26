//Authored by Bethany Milford 26/07/25
export class SignUpPage extends HTMLElement
{
    constructor()
    {
        super();
        this.innerHTML =
        `
        <p> This is the Sign Up section :)))</p>
        <form method="POST" id="SignUpForm">
            <div class="container">
                <label for="new_user"><b>Username</b></label>
                <input type="text" placeholder="Enter Username" id="new_user" name="new_user" required>
            </div
                <br>
            <div class="container">
                <label for="new_pass"><b>Password</b></label>
                <input type="password" placeholder="Enter Password" id="new_pass" name="new_pass" required>
            </div>
                <br>
            <div class="container">
                <label for="new_pass2"><b>Re-Enter Password</b></label>
                <input type="password" placeholder="Re-Enter Password" id="new_pass2" name="new_pass2" required>
            </div>
                <br>
            <div>
                <button type="submit">Sign Up</button>
            </div>
        </form>
        `;
    }
}
customElements.define('signup-page', SignUpPage);