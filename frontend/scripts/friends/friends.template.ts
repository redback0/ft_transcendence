export class FriendsPage extends HTMLElement 
{
    constructor() {
        super();
        this.innerHTML = 
            ` 
		<script defer src="./friends.js"></script>
		<!-- TO DO: ADD ERROR FUNCTIONALITY -->
		<!-- TO DO: 'ADD' FUNCTIONALITY : API POST REQUEST -->
		<!-- Main Content -->
		<div id="friends-main-content">
			<form method="POST" id="addFriend">
				<h1 style="font-weight:bold; font-size:10vh; text-align:center !important; background-color:#520404; color:#DED19C; margin-bottom: 3vh">FRIENDS</h1>
				<p style="font-size:2vh; color:#520404; margin-top:1vh; font-weight:bold">ADD FRIENDS:</p>
				<input id="friends-user-search" type="text" name="username" placeholder="ENTER USERNAME" autocomplete="off" style="color:#DED19C;" required>
				<h1 style="font-weight:bold; font-size:1.5vh; color:red">USER DOES NOT EXIST/USER ADDED!</h1>
				<!--<h1 id="friends-redHover" onclick="submitForm()" style="font-weight:bold; font-size:5vh; color:#520404;">ADD -></h1>-->
				<button type="button" id="addFriendButton" style="font-weight:bold; font-size:5vh; color:#520404;>Add Friend</button>

				</form>
		</div>

		<div id="down-arrow">
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18vh" zoomAndPan="magnify" viewBox="0 0 375 374.999991" height="18vh" preserveAspectRatio="xMidYMid meet" version="1.2">
				<defs>
					<clipPath id="b066340efd"><rect x="0" width="375" y="0" height="351"/></clipPath>
				</defs>
				<g id="36c4ec811d">
					<g transform="matrix(1,0,0,1,0,0)">
						<g clip-path="url(#b066340efd)">
							<g style="fill:#520404;fill-opacity:1;">
								<g transform="translate(80.595063, -23.382025)">
									<path style="stroke:none" d="M 96.828125 203.71875 L 96.828125 51.53125 L 137.9375 51.53125 L 137.9375 203.71875 Z M 96.828125 203.71875 "/>
								</g>
							</g>
							<g style="fill:#520404;fill-opacity:1;">
								<g transform="translate(80.595063, 154.390047)">
									<path style="stroke:none" d="M 152.375 29.421875 L 201.53125 29.421875 L 134.65625 193.859375 L 93.1875 193.859375 L 26.125 29.421875 L 75.453125 29.421875 L 110.53125 134.109375 L 114.1875 145.25 L 117.84375 134.296875 Z M 152.375 29.421875 "/>
								</g>
							</g>
						</g>
					</g>
				</g>
			</svg>
		</div>

		<!-- Table of Friends -->
		<!-- TO DO: IF SQL GET NUMBER OF FRIENDS = 0, "YOU HAVE NO FRIENDS" ELSE: -->
		<h1 style="text-align:center; font-weight:bold; font-size:5vh; color:#520404">*USERNAME*'S FRIENDS:</h1>
		<div id="table-friends"></div>
            `;
    }
}
customElements.define('friends-page', FriendsPage);