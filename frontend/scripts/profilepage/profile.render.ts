//Authored By Bethany Milford 27/10/25
import {t} from '../translation.js';

export interface Match {
  left_id: string;
  left_username: string;
  left_result: string;
  right_id: string;
  right_username: string;
  right_result: string;
  left_score: number;
  right_score: number;
  date_game_made: string;
}

export function renderMatchesTable(matches: Match[])
{
	const tableMatches = document.getElementById("table-matches");
	if (!tableMatches)
	{
		console.error("ERROR: No 'tableMatches' element.");
		return ;
	}
	tableMatches.innerHTML = "";
	
	matches.forEach(match => {
		//const onlineIndicator = match.online ? 'ring-2 ring-green-500' : '';
		const matchItem = `
			<div class="flex items-center justify-center gap-4 p-3 bg-[#520404] mb-2 h-[5vh]">
                <p>${match.date_game_made ? match.date_game_made : "not found"}</p>
				<div class="profile-container flex items-center gap-4" style="padding-right:1rem;">
                    <p class="font-bold text-[#DED19C]" style="font-size:2rem">${match.left_result}</p>
                    <p class="font-bold text-[#DED19C]" style="font-size:2rem">${match.left_score}</p>
                    <a href="/users?id=${match.left_username}" class="profile-name font-bold text-[#DED19C]" style="font-size:2rem">${match.left_username}</a>
                    <a href="/users?id=${match.left_username}">
						<img src="/api/user/${match.left_id}/avatar" alt="user-profile-picture" class="w-7 h-7 rounded-full">
					</a>
				</div>
                <p class="profile-name font-bold text-[#DED19C]" style="font-size:2rem">
						${t('versus')}
					</p>
				<div class="profile-container flex items-center gap-4" style="padding-right:1rem;">
					<a href="/users/${match.right_username}">
						<img src="/api/user/${match.right_id}/avatar" alt="user-profile-picture" class="w-7 h-7 rounded-full">
					</a>
					<a href="/users?id=${match.right_username}" class="profile-name font-bold text-[#DED19C]" style="font-size:2rem">${match.right_username}</a>
                    <p class="font-bold text-[#DED19C]" style="font-size:2rem">${match.right_score}</p>
                    <p class="font-bold text-[#DED19C]" style="font-size:2rem">${match.right_result}</p>
				</div>
			</div>
		`;
		tableMatches.innerHTML += matchItem;
	});

}




                // <!-- 
                //     <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0" style="margin-left:auto; padding-right:1rem;">
                //         <div class="relative inline-block text-left">
                //             <button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="${friend.blocked_by_me ? 'unblock' : 'block'}">${friend.blocked_by_me ? 'UNBLOCK' : 'BLOCK'} -></button>
                //             <button class="px-3 py-0.7 rounded-lg bg-[#DED19C] text-[#520404] text-0.5rem hover:bg-[#b8b8b8] hover:font-bold" data-userid="${friend.user_id}" data-action="defriend">UNFRIEND -></button>
                //         </div>
                //     </div>
                // -->	