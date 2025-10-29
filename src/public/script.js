document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");

    // Load tasks when page loads
    loadTasks();

    // Add new task
    taskForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const taskText = taskInput.value.trim();
        if (taskText) {
            await addTask(taskText);
            taskInput.value = "";
            loadTasks(); // Refresh the list
        }
    });

    // Function to add task to backend
    async function addTask(title) {
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: title })
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    // Function to load tasks from backend
    async function loadTasks() {
        try {
            const response = await fetch("/api/tasks");
            const tasks = await response.json();
            
            taskList.innerHTML = "";
            tasks.forEach(task => {
                const li = document.createElement("li");
                li.className = "task-item";
                li.innerHTML = `
                    <span>${task.title}</span>
                    <button onclick="toggleTask(${task.id}, ${task.completed})">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                `;
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    }

    // Make these functions available globally for inline onclick handlers
    window.toggleTask = async function(id, isCompleted) {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ completed: !isCompleted })
            });
            loadTasks(); // Refresh the list
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    window.deleteTask = async function(id) {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: "DELETE"
            });
            loadTasks(); // Refresh the list
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
});
