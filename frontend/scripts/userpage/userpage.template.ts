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
                    <h2><b>User Name</b></h2>
                    <br>
                    <section>
                        <h3><b>Friends List</b></h3>
                    </section>
                    <br>
                    <section>
                        <h3><b>Match History</b></h3>
                    </section>
                    <br>
                </div>
                <br>
                <br>
                <p> <b>Want to Change your Password</b></p>
                <form id="ChangePasswordForm">
                    <div class= "container">
                        <big-label for="old_password"><b>Old Password</b></big-label>
                        <input type="password" placeholder="Enter Old Password" name="old_password" required>
                        <br>
                        <big-label for="new_password"><b>New Password</b></big-label>
                        <input type="password" placeholder="Enter New Password" name="new_password" required>
                        <br>
                        <big-label for="repeat_password"><b>Repeat New Password</b></big-label>
                        <input type="password" placeholder="Enter New Password" name="repeat_password" required>
                        <br>
                        <button type="submit">Submit</button>
                   </div>
                </form>
            `;
    }
}
customElements.define('user-page', UserPage);