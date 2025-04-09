
// simple function to get json from backend
export async function api<T>(from: string): Promise<T> {
    const response = await fetch(from)

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json() as T
}
