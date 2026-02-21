// const socket = io()

// if (!localStorage.getItem("token")) {
//     window.location.href = "login.html"
// }

// const token = localStorage.getItem("token")
// const role = localStorage.getItem("role")

// // Get roomId from URL
// const params = new URLSearchParams(window.location.search)
// const roomId = params.get("room")

// if (!roomId) {
//     alert("No room specified")
// }

// document.getElementById("roomTitle").innerText = "Room: " + roomId

// socket.emit("joinRoom", roomId)

// async function loadHistory() {

//     const response = await fetch(`/api/donations/chat/${roomId}`, {
//         headers: {
//             "Authorization": "Bearer " + token
//         }
//     })

//     const messages = await response.json()

//     messages.forEach(displayMessage)
// }

// function displayMessage(msg) {

//     const container = document.getElementById("chatContainer")

//     const div = document.createElement("div")
//     div.innerHTML = `<strong>${msg.senderRole}</strong>: ${msg.message}`

//     container.appendChild(div)
//     container.scrollTop = container.scrollHeight
// }

// function sendMessage() {

//     const input = document.getElementById("messageInput")
//     const message = input.value.trim()

//     if (!message) return

//     socket.emit("sendMessage", {
//         roomId,
//         senderId: "client",  // simplified for now
//         senderRole: role,
//         message
//     })

//     input.value = ""
// }

// socket.on("receiveMessage", (data) => {
//     displayMessage(data)
// })

// function logout() {
//     localStorage.clear()
//     window.location.href = "login.html"
// }

// function goBack() {
//     window.history.back()
// }

// loadHistory()

const socket = io()

if (!localStorage.getItem("token")) {
    window.location.href = "login.html"
}

const token = localStorage.getItem("token")
const role = localStorage.getItem("role")

function parseJwt(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
}

const decoded = parseJwt(token)
const senderId = decoded.id

const params = new URLSearchParams(window.location.search)
const roomId = params.get("room")

if (!roomId) {
    alert("No room specified")
}

document.getElementById("roomTitle").innerText = "Room: " + roomId

socket.emit("joinRoom", roomId)

async function loadHistory() {

    const response = await fetch(`/api/donations/chat/${roomId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })

    const messages = await response.json()

    messages.forEach(displayMessage)
}

function displayMessage(msg) {

    const container = document.getElementById("chatContainer")

    const div = document.createElement("div")

    if (msg.senderId === senderId) {
        div.style.textAlign = "right"
        div.innerHTML = `<span style="background:#2563eb;color:white;padding:6px 10px;border-radius:10px;display:inline-block;margin:4px 0;">${msg.message}</span>`
    } else {
        div.style.textAlign = "left"
        div.innerHTML = `<span style="background:#e5e7eb;padding:6px 10px;border-radius:10px;display:inline-block;margin:4px 0;">${msg.message}</span>`
    }

    container.appendChild(div)
    container.scrollTop = container.scrollHeight
}

function sendMessage() {

    const input = document.getElementById("messageInput")
    const message = input.value.trim()

    if (!message) return

    socket.emit("sendMessage", {
        roomId,
        senderId,
        senderRole: role,
        message
    })

    input.value = ""
}

socket.on("receiveMessage", (data) => {
    displayMessage(data)
})

function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

function goBack() {
    window.history.back()
}

loadHistory()