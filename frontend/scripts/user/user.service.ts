//Authored by Bethany Milford 29/08/2025

interface User {
    id: string;
    name: string;
    username: string;
    //avatar:
}

export async function fetchUserInfo(userId: string,): Promise<User | null>
{
    try {
        const response = await fetch(`/api/users/${userId}`);
        if(response.ok)
        {
            const userData: User = await response.json();
            return userData;
        }
        else
        {
            console.error('Failed to fetch user info', response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error('Network error', error);
        return null;
    }
}