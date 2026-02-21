if (!localStorage.getItem("token") || localStorage.getItem("role") !== "beneficiary") {
    window.location.href = "login.html"
}



function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

function openChat(roomId) {
    window.location.href = `chat.html?room=${roomId}`
}

function showSection(id) {
    document.getElementById("dashboard").classList.add("section-hidden")
    document.getElementById("create").classList.add("section-hidden")
    document.getElementById("active").classList.add("section-hidden")

    document.getElementById(id).classList.remove("section-hidden")
}

let userLongitude = null
let userLatitude = null

function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        userLatitude = position.coords.latitude
        userLongitude = position.coords.longitude
    })
}

async function createRequest() {

    const token = localStorage.getItem("token")

    const response = await fetch("/api/donations/beneficiary/request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            description: document.getElementById("description").value,
            quantityNeeded: document.getElementById("quantityNeeded").value,
            location: {
                type: "Point",
                coordinates: [userLongitude, userLatitude]
            }
        })
    })

    const data = await response.json()
    document.getElementById("message").innerText = data.message

    loadMyRequests()
}

async function loadMyRequests() {

    const token = localStorage.getItem("token")

    const response = await fetch("/api/donations/beneficiary/my", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })

    const requests = await response.json()

    document.getElementById("activeCount").innerText = requests.length

    const container = document.getElementById("requestsContainer")
    container.innerHTML = ""

    requests.forEach(r => {
        const div = document.createElement("div")
        div.className = "dashboard-card"
        div.innerHTML = `
            <p><strong>${r.description}</strong></p>
            <p>Quantity: ${r.quantityNeeded}</p>
            <p>Status: ${r.status}</p>
            <button onclick="openChat('${r._id}')">Chat</button>
        `
        container.appendChild(div)
    })
}

loadMyRequests()