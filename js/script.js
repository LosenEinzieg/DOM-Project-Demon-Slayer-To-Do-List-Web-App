class DemonSlayerTodoApp {
constructor() {
    this.tasks = JSON.parse(localStorage.getItem("demonSlayerTasks")) || []
    this.currentFilter = "all"
    this.init()
}

init() {
    this.bindEvents()
    this.renderTasks()
    this.updateStats()
}

bindEvents() {
    const form = document.getElementById("todoForm")
    const taskInput = document.getElementById("taskInput")
    const dateInput = document.getElementById("dateInput")

    if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.addTask()
    })
    }

    if (taskInput) {
        taskInput.addEventListener("input", () => {
        this.clearError("taskError")
    })
    }

    if (dateInput) {
    dateInput.addEventListener("change", () => {
        this.clearError("dateError")
    })
    }
}

addTask() {
    const taskInput = document.getElementById("taskInput")
    const dateInput = document.getElementById("dateInput")
    const taskText = taskInput.value.trim()
    const taskDate = dateInput.value

    this.clearError("taskError")
    this.clearError("dateError")

    // Validation
    let isValid = true

    if (!taskText) {
        this.showError("taskError", "Mission description is required!")
        isValid = false
    } else if (taskText.length < 3) {
        this.showError("taskError", "Mission description must be at least 3 characters!")
        isValid = false
    }

    if (!taskDate) {
        this.showError("dateError", "Due date is required!")
        isValid = false
    } else {
        const selectedDate = new Date(taskDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
        this.showError("dateError", "Due date cannot be in the past!")
        isValid = false
    }
    }

    if (!isValid) return

    // Add task
    const newTask = {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        completed: false,
        createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(newTask)

    this.saveTasks()
    this.renderTasks()
    this.updateStats()

    taskInput.value = ""
    dateInput.value = ""
    this.clearError("taskError")
    this.clearError("dateError")

    // Show success feedback
    this.showSuccessMessage("Mission added successfully! ⚔️")
}

deleteTask(id) {
    if (confirm("Are you sure you want to delete this mission?")) {
        this.tasks = this.tasks.filter((task) => task.id !== id)
        this.saveTasks()
        this.renderTasks()
        this.updateStats()
        this.showSuccessMessage("Mission deleted! 🗡️")
    }
}

toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id)
    if (task) {
        task.completed = !task.completed
        this.saveTasks()
        this.renderTasks()
        this.updateStats()

        const message = task.completed ? "Mission completed! Well done, Demon Slayer! 🎌" : "Mission reactivated! ⚔️"
        this.showSuccessMessage(message)
    }
}

filterTasks(filter) {
    this.currentFilter = filter

    // Update active filter button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active", "ring-2", "ring-flame-orange")
    })
    document
    .querySelector(`[onclick="window.todoApp.filterTasks('${filter}')"]`)
    .classList.add("active", "ring-2", "ring-flame-orange")

    this.renderTasks()
}

getFilteredTasks() {
    switch (this.currentFilter) {
    case "active":
        return this.tasks.filter((task) => !task.completed)
    case "completed":
        return this.tasks.filter((task) => task.completed)
    default:
        return this.tasks
    }
}

renderTasks() {
    const todoList = document.getElementById("todoList")
    const emptyState = document.getElementById("emptyState")
    const filteredTasks = this.getFilteredTasks()

    if (filteredTasks.length === 0) {
        if (emptyState) {
            emptyState.style.display = "block"
        }
    todoList.innerHTML = ""
    if (emptyState) {
        todoList.appendChild(emptyState)
    }
    return
    }

    if (emptyState) {
        emptyState.style.display = "none"
    }

    todoList.innerHTML = filteredTasks
    .map((task) => {
        const dueDate = new Date(task.date)
        const today = new Date()
        const isOverdue = dueDate < today && !task.completed

        return `
                <div class="task-slide-in bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600 ${task.completed ? "opacity-75" : ""} ${isOverdue ? "border-demon-red" : ""}">
                    <div class="flex items-start sm:items-center justify-between gap-3">
                        <div class="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                            <input 
                                type="checkbox" 
                                ${task.completed ? "checked" : ""} 
                                onchange="window.todoApp.toggleTask(${task.id})"
                                class="w-4 h-4 sm:w-5 sm:h-5 text-flame-orange bg-gray-600 border-gray-500 rounded focus:ring-flame-orange focus:ring-2 mt-1 sm:mt-0 flex-shrink-0"
                            >
                            <div class="flex-1 min-w-0">
                                <div class="text-white ${task.completed ? "line-through text-gray-400" : ""} font-medium text-sm sm:text-base break-words">
                                    ${this.escapeHtml(task.text)}
                                </div>
                                <div class="text-xs sm:text-sm ${isOverdue ? "text-red-500" : "text-gray-400"} mt-1">
                                    📅 Due: ${this.formatDate(task.date)} ${isOverdue ? "(Overdue!)" : ""}
                                </div>
                            </div>
                        </div>
                        <button 
                            onclick="window.todoApp.deleteTask(${task.id})"
                            class="text-demon-red hover:text-red-400 p-1 sm:p-2 rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
                            title="Delete Mission"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            `
    })
        .join("")
}

updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((task) => task.completed).length
    const active = total - completed

    document.getElementById("totalTasks").textContent = total
    document.getElementById("activeTasks").textContent = active
    document.getElementById("completedTasks").textContent = completed
}

formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    errorElement.textContent = message
    errorElement.classList.remove("hidden")
}

clearError(elementId) {
    const errorElement = document.getElementById(elementId)
    errorElement.classList.add("hidden")
}

showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement("div")
    successDiv.className =
    "fixed top-4 right-4 bg-bamboo-green text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300"
    successDiv.textContent = message

    document.body.appendChild(successDiv)

    // Animate in
    setTimeout(() => {
        successDiv.classList.remove("translate-x-full")
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
    successDiv.classList.add("translate-x-full")
    setTimeout(() => {
        document.body.removeChild(successDiv)
    }, 300)
    }, 3000)
}

saveTasks() {
    localStorage.setItem("demonSlayerTasks", JSON.stringify(this.tasks))
}

escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.todoApp = new DemonSlayerTodoApp()
})
