//Authored by Bethany Milford 19/07/2025

export class UserPage extends HTMLElement 
{
    constructor() {
        super();
        this.innerHTML = 
            ` 
            <p>This is your User Home Page, Welcome!! </p>
            <h1>User Profile </h1>
            <div class="profile-container">
                <img src="profile_picture.jpg" alt="User's Profile Picture" class="profile-picture">

                <div class="user-info">
                    <h2>User Name</h2>
                    <br>
                    <section>
                        <h3>Friends List</h3>
                    </section>
                    <br>
                    <section>
                        <h3>Match History</h3>
                    </section>
                    <br>
                </div>
                <form id="ChangePasswordForm">
                    <div class="container">
                        <label for="old_password"<b>Old Password</b></label>
                        <input type="text" placeholder="Enter Old Password" name="old_password" required>
                        <br>
                        <label for="new_password"<b>New Password</b></label>
                        <input type="text" placeholder="Enter New Password" name="new_password" required>
                        <br>
                        <label for="repeat_password"<b>Repeat New Password</b></label>
                        <input type="text" placeholder="Enter New Password" name="repeat_password" required>
                        <br>
                        <button type="submit">Submit</button>
                   </div>
                </form>
            `;
    }
}
customElements.define('user-page', UserPage);