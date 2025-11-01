import { Friend } from "./friend.schema";
import {t} from '../translation.js';

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
		const onlineIndicator = friend.online ? 'ring-2 ring-green-500' : '';
		const friendItem = `
			<div class="flex items-center gap-4 p-3 bg-[#520404] mb-2" style="height: 5vh;">
				<div class="profile-container flex items-center gap-4" style="padding-left:1rem;">
					<a class="profile-nav-button" href="/users?id=${friend.username}">
						<img src="/api/user/${friend.user_id}/avatar" alt="user-profile-picture" class="w-7 h-7 rounded-full pointer-events-none ${onlineIndicator}">
					</a>
					<a class="profile-nav-button profile-name font-bold text-[#DED19C]" style="font-size:1.25rem" href="/users?id=${friend.username}">${friend.username}</a>
				</div>
				<div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0" style="margin-left:auto; padding-right:1rem;">
					<div class="relative inline-block text-left">
						<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="${friend.blocked_by_me ? 'unblock' : 'block'}">
							${friend.blocked_by_me ? t('unblock') : t('block')} -></button>
						<button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="defriend">
							${t('unfriend')} ->
						</button>
					</div>
				</div>
			</div>
		`;
		tableFriends.innerHTML += friendItem;
	});

}