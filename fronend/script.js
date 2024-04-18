document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');

    // Function to fetch tasks from the server
    const fetchTasks = async () => {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const tasks = await response.json();
            updateTaskList(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Function to update task list UI
    const updateTaskList = (tasks) => {
        taskList.innerHTML = tasks.map(task => `<li>${task.title}</li>`).join('');
    };

    // Event listener for file upload form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
        const formData = new FormData();
        formData.append('excel', file); // Change 'file' to 'excel'
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            // Refresh task list after successful upload
            fetchTasks();
        } catch (error) {
            console.error('Upload error:', error);
        }
    });

    // Fetch tasks on page load
    fetchTasks();
});
