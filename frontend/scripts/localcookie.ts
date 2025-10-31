//Authored by Nicole Lehmeyer

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function setLocal(key: string, value: string): void {
	if (!isBrowser)
		return;
	try {
		window.localStorage.setItem(key, value);
	} catch (err) {
		//PUT CONSOLE ERR HERE
	}
}

export function getLocal(key: string): string | null {
	if (!isBrowser)
		return null;
	try {
		return window.localStorage.getItem(key);
	} catch (err) {
		return null;
	}
}

export function removeLocal(key: string): void {
	if (!isBrowser)
		return;
	try {
		window.localStorage.removeItem(key);
	} catch {
		//PUT CONSOLE ERR HERE
	}
}
