import { Friend } from "./friend.schema";

export function renderFriendsTable(friends: Friend[])
{
	const tableFriends = document.getElementById("table-friends");
	if (!tableFriends)
	{
		console.error("ERROR: No 'tableFriends' element.");
		return ;
	}
	tableFriends.innerHTML = "";
	
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
						<!--
							<button onclick="this.nextElementSibling.classList.toggle('hidden')" class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">ACTIONS ▼</button>
							<div class="dropdown-menu hidden absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10" style="border: 2px solid #DED19C;">
							<button class="block w-full text-left px-4 py-2 text-sm text-[#DED19C] bg-[#000000] hover:bg-[#520404]" style="border-radius:0.375rem 0.375rem 0 0;" data-userid="${friend.user_id}" data-action="${friend.blocked_by_me ? 'unblock' : 'block'}">${friend.blocked_by_me ? "UNBLOCK" : "BLOCK"}</button>
							<button class="block w-full text-left px-4 py-2 text-sm text-[#DED19C] bg-[#000000] hover:bg-[#520404]" style="border-radius:0 0 0.375rem 0.375rem;" data-userid="${friend.user_id}" data-action="defriend">DE-FRIEND</button>
							</div>
							</div>
							<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">CHAT -></button>
							<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold">PLAY -></button>
						-->
						<!-- Block/Unblock button label and action are dynamic based on friend.blocked -->
						<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="${friend.blocked_by_me ? 'unblock' : 'block'}">${friend.blocked_by_me ? 'UNBLOCK' : 'BLOCK'} -></button>
						<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="defriend">UNFRIEND -></button>
						
				</div>
			</div>
		`;
		tableFriends.innerHTML += friendItem;
	});

}