
interface buttonResponse {
    text: string
}

async function getServerResponse() {
    try {
        var response = await fetch(document.URL + "api/buttonpressed")
        if (!response.ok) {
            throw new Error(`shit broke: ${response.status}`)
        }

        return (await response.json())
    } catch (error) {
        console.error(error.message)
    }
}

const clickHandler = async (event) => {
    var textbox = document.getElementById("helloworld_tb")
    if (textbox != null)
        textbox.textContent = "Hello world!"
}
