if (!localStorage.getItem("token") || localStorage.getItem("role") !== "ngo") {
    window.location.href = "login.html"
}

const token = localStorage.getItem("token")

function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

function openChat(roomId) {
    window.location.href = `chat.html?room=${roomId}`
}

function showSection(id) {
    document.getElementById("dashboard").classList.add("section-hidden")
    document.getElementById("immediate").classList.add("section-hidden")
    document.getElementById("scheduled").classList.add("section-hidden")
    document.getElementById("beneficiary").classList.add("section-hidden")

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

async function loadAnalytics() {

    const response = await fetch("/api/donations/analytics/platform", {
        headers: { "Authorization": "Bearer " + token }
    })

    const data = await response.json()

    document.getElementById("activeImmediate").innerText = data.activeImmediate
    document.getElementById("activeScheduled").innerText = data.activeScheduled
    document.getElementById("totalRequests").innerText =
        data.totalImmediate + data.totalScheduled
}

async function loadImmediate() {

    if (!userLongitude || !userLatitude) {
        alert("Capture location first")
        return
    }

    const response = await fetch(
        `/api/donations/immediate/nearby?longitude=${userLongitude}&latitude=${userLatitude}`,
        { headers: { "Authorization": "Bearer " + token } }
    )

    const donations = await response.json()
    const container = document.getElementById("immediateContainer")
    container.innerHTML = ""

    donations.forEach(d => {

        const div = document.createElement("div")
        div.className = "dashboard-card"

        div.innerHTML = `
            <p><strong>${d.foodDescription}</strong></p>
            <p>Distance: ${d.distance} km</p>
            <p>Quantity: ${d.quantity}</p>
            <p>Status: ${d.status}</p>

            ${d.status === "open" ? `
                <button onclick="claimImmediate('${d._id}')">Claim</button>
            ` : ""}

            ${d.status === "processing" ? `
                <button onclick="completeDonation('${d._id}')">Complete Pickup</button>
            ` : ""}

            <button onclick="openChat('${d._id}')">Chat</button>
        `

        container.appendChild(div)
    })
}

async function claimImmediate(id) {

    const response = await fetch(`/api/donations/immediate/claim/${id}`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + token }
    })

    const data = await response.json()
    alert(data.message)
    loadImmediate()
}

async function completeDonation(id) {

    const response = await fetch(`/api/donations/immediate/complete/${id}`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + token }
    })

    const data = await response.json()
    alert(data.message)
    loadImmediate()
}

async function loadScheduled() {

    if (!userLongitude || !userLatitude) {
        alert("Capture location first")
        return
    }

    const response = await fetch(
        `/api/donations/scheduled/nearby?longitude=${userLongitude}&latitude=${userLatitude}`,
        { headers: { "Authorization": "Bearer " + token } }
    )

    const donations = await response.json()
    const container = document.getElementById("scheduledContainer")
    container.innerHTML = ""

    donations.forEach(d => {

        const div = document.createElement("div")
        div.className = "dashboard-card"

        div.innerHTML = `
            <p><strong>${d.foodDescription}</strong></p>
            <p>Quantity: ${d.quantity}</p>
            <p>Status: ${d.status}</p>
            <button onclick="claimScheduled('${d._id}')">Claim</button>
            <button onclick="openChat('${d._id}')">Chat</button>
        `

        container.appendChild(div)
    })
}

async function claimScheduled(id) {

    const response = await fetch(`/api/donations/scheduled/claim/${id}`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + token }
    })

    const data = await response.json()
    alert(data.message)
    loadScheduled()
}

async function loadBeneficiary() {

    if (!userLongitude || !userLatitude) {
        alert("Capture location first")
        return
    }

    const response = await fetch(
        `/api/donations/beneficiary/nearby?longitude=${userLongitude}&latitude=${userLatitude}`,
        { headers: { "Authorization": "Bearer " + token } }
    )

    const requests = await response.json()
    const container = document.getElementById("beneficiaryContainer")
    container.innerHTML = ""

    requests.forEach(r => {

        const div = document.createElement("div")
        div.className = "dashboard-card"

        div.innerHTML = `
            <p><strong>${r.description}</strong></p>
            <p>Quantity Needed: ${r.quantityNeeded}</p>
            <button onclick="fulfill('${r._id}')">Fulfill</button>
            <button onclick="openChat('${r._id}')">Chat</button>
        `

        container.appendChild(div)
    })
}

async function fulfill(id) {

    const response = await fetch(`/api/donations/beneficiary/fulfill/${id}`, {
        method: "PATCH",
        headers: { "Authorization": "Bearer " + token }
    })

    const data = await response.json()
    alert(data.message)
    loadBeneficiary()
}