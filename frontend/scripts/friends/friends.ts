import { Friend } from "./friend.schema";
import { renderFriendsTable } from "./friends.render";

window.onload = function () {
	window.scrollTo(0, 0);
  };

// import { ModuleDetectionKind } from 'typescript';
// import { attachBlockListeners } from './friends.controller';
// attachBlockListeners();

import { fetchFriends } from './friends.controller';
document.addEventListener('DOMContentLoaded', async() => {
	const friends = await fetchFriends();
	renderFriendsTable(friends);
});