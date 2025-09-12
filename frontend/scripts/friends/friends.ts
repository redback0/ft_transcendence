// Move to back end

window.onload = function () {
	window.scrollTo(0, 0);
  };

const friends = [
	{ username: "poopy", profilePicture: "./assets/images/profilePics/friend1.jpg" },
	{ username: "coopy", profilePicture: "./assets/images/profilePics/friend2.jpg" },
	{ username: "friend3", profilePicture: "./assets/images/profilePics/friend3.jpg" },
	{ username: "orphan100rox", profilePicture: "./assets/images/profilePics/friend4.jpg" },
	{ username: "momotheally", profilePicture: "./assets/images/profilePics/friend5.jpg" },
	{ username: "3amtoes", profilePicture: "./assets/images/profilePics/friend6.jpg" }
  ]

const tableFriends = document.getElementById("table-friends");
  
  friends.forEach(friend => {
	const friendItem = `
	  <div class="flex items-center gap-4 p-3 bg-[#520404] mb-2" style="height: 5vh;">
		<div class="profile-container flex items-center gap-4" style="padding-left:1rem;">
		  <a href="/profile/${friend.username}">
			<img src="${friend.profilePicture}" alt="user-profile-picture" class="w-7 h-7 rounded-full border">
		  </a>
		  <a href="/profile/${friend.username}" class="profile-name font-bold text-[#DED19C]" style="font-size:1.25rem">${friend.username}</a>
		</div>
			<div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0" style="margin-left:auto; padding-right:1rem;">
				<div class="relative inline-block text-left">
					<button onclick="this.nextElementSibling.classList.toggle('hidden')" class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">ACTIONS ▼</button>
					<div class="dropdown-menu hidden absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10" style="border: 2px solid #DED19C;">
						<button class="block w-full text-left px-4 py-2 text-sm text-[#DED19C] bg-[#000000] hover:bg-[#520404]" style="border-radius:0.375rem 0.375rem 0 0;">BLOCK</button>
						<button class="block w-full text-left px-4 py-2 text-sm text-[#DED19C] bg-[#000000] hover:bg-[#520404]" style="border-radius:0 0 0.375rem 0.375rem;">DE-FRIEND</button>
					</div>
				</div>
				<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">CHAT -></button>
				<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">PLAY -></button>
			</div>
	  </div>
	`;
	if (tableFriends) {
	  tableFriends.innerHTML += friendItem;
	} else {
	  console.error("ERROR: No 'tableFriends' element");
	}
  });