
// simple function to get json from backend
async function api<T>(from: string): Promise<T> {
    const response = await fetch(from)

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json() as T
}

const clickHandler = async (event: Event) => {
    var textbox = document.getElementById("helloworld_tb")
    if (textbox != null) {
        textbox.textContent = "Hello world!";
        // just a stupid example to show api's use
        const serverText = await api<{text: string}>("/api/buttonpressed");
        textbox.textContent += serverText.text;
    }
}
