document.addEventListener("DOMContentLoaded", function() {
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const searchResults = document.getElementById("searchResults");

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
            
            // Clear lists
            taskList.innerHTML = "";
            // Clear search results when reloading main list
            searchResults.innerHTML = "";
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

    // Search tasks by calling the new API and render results
    async function searchTasks(query) {
        try {
            if (!query) {
                searchResults.innerHTML = "";
                return;
            }
            const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error('Search error', err);
                searchResults.innerHTML = `<li class="no-results">Search failed</li>`;
                return;
            }
            const tasks = await response.json();
            searchResults.innerHTML = "";
            if (tasks.length === 0) {
                searchResults.innerHTML = `<li class="no-results">No results</li>`;
                return;
            }
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = 'task-item';
                li.innerHTML = `
                    <span>${task.title}</span>
                    <button onclick="toggleTask(${task.id}, ${task.completed})">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                `;
                searchResults.appendChild(li);
            });
        } catch (error) {
            console.error('Error searching tasks:', error);
            searchResults.innerHTML = `<li class="no-results">Search error</li>`;
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

    // Wire up search button and clear
    searchBtn.addEventListener('click', function() {
        const q = searchInput.value.trim();
        searchTasks(q);
    });

    // Allow Enter key in search input to trigger search
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBtn.click();
        }
    });

    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchResults.innerHTML = '';
    });
});
