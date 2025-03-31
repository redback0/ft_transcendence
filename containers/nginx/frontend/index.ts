
async function api<T>(): Promise<T> {
    const response = await fetch("/api/buttonpressed")

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json() as T
}

const clickHandler = async (event: Event) => {
    var textbox = document.getElementById("helloworld_tb")
    if (textbox != null) {
        textbox.textContent = "Hello world!";
        const serverText = await api<{text: string}>();
        textbox.textContent += serverText.text;
    }
}
