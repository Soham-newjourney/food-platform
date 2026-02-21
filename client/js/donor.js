if (!localStorage.getItem("token") || localStorage.getItem("role") !== "donor") {
    window.location.href = "login.html"
}

const token = localStorage.getItem("token")

let userLongitude = null
let userLatitude = null

function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

function showSection(id) {

    document.getElementById("dashboard").classList.add("section-hidden")
    document.getElementById("immediate").classList.add("section-hidden")
    document.getElementById("scheduled").classList.add("section-hidden")

    document.getElementById(id).classList.remove("section-hidden")
}

function openChat(roomId) {

    if (!roomId) {
        alert("Invalid chat room")
        return
    }

    window.location.href = `chat.html?room=${roomId}`
}

function getLocation() {

    navigator.geolocation.getCurrentPosition(
        (position) => {

            userLatitude = position.coords.latitude
            userLongitude = position.coords.longitude

            document.getElementById("message").innerText =
                "Location captured successfully"

        },
        () => {
            document.getElementById("message").innerText =
                "Location permission denied"
        }
    )
}

async function createDonation() {

    if (
        userLatitude === null ||
        userLongitude === null ||
        isNaN(userLatitude) ||
        isNaN(userLongitude)
    ) {
        document.getElementById("message").innerText =
            "Please capture valid location first"
        return
    }

    const response = await fetch("/api/donations/immediate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            foodDescription: document.getElementById("foodDescription").value,
            quantity: document.getElementById("quantity").value,
            location: {
                type: "Point",
                coordinates: [
                    Number(userLongitude),
                    Number(userLatitude)
                ]
            }
        })
    })

    const data = await response.json()
    document.getElementById("message").innerText = data.message

    if (response.status === 201) {
        loadMyDonations()
        showSection("dashboard")
    }
}

async function createScheduled() {

    if (
        userLatitude === null ||
        userLongitude === null ||
        isNaN(userLatitude) ||
        isNaN(userLongitude)
    ) {
        alert("Please capture valid location first")
        return
    }

    const response = await fetch("/api/donations/scheduled", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            foodDescription: document.getElementById("sFoodDescription").value,
            quantity: document.getElementById("sQuantity").value,
            pickupDate: document.getElementById("pickupDate").value,
            location: {
                type: "Point",
                coordinates: [
                    Number(userLongitude),
                    Number(userLatitude)
                ]
            }
        })
    })

    const data = await response.json()
    alert(data.message)

    if (response.status === 201) {
        loadMyDonations()
        showSection("dashboard")
    }
}

async function loadMyDonations() {

    const response = await fetch("/api/donations/immediate/my", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })

    if (!response.ok) {
        return
    }

    const donations = await response.json()

    const container = document.getElementById("dashboard")
    container.innerHTML = "<h2>My Donations</h2>"

    if (!donations.length) {
        container.innerHTML += "<p>No donations yet.</p>"
        return
    }

    donations.forEach(d => {

        const div = document.createElement("div")
        div.className = "dashboard-card"

        let statusColor = "#2563eb"

        if (d.status === "processing") {
            statusColor = "#f59e0b"
        }

        if (d.status === "completed") {
            statusColor = "#16a34a"
        }

        div.innerHTML = `
            <p><strong>${d.foodDescription}</strong></p>
            <p>Quantity: ${d.quantity}</p>
            <p>Status: <span style="color:${statusColor}">${d.status}</span></p>
            <p>OTP: ${d.otpVerified ? "Verified" : d.otpCode}</p>
            <button onclick="openChat('${d._id}')">Chat</button>
        `

        container.appendChild(div)

    })
}

loadMyDonations()