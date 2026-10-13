const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

const STORAGE_KEY = 'workshop-projects-v1';

const projects = [];
let editingId = null;
let storageDataInvalid = false;

function resetForm() {
    editingId = null;
    form.reset();
    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
}

function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const listItem = document.createElement('li');
        const projectText = document.createElement('span');

        projectText.textContent =
            `${project.name} — ${project.status} `;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', () => {
            editingId = project.id;
            nameInput.value = project.name;
            statusInput.value = project.status;
            saveButton.textContent = 'Save changes';
            cancelButton.hidden = false;
            message.textContent = 'Editing project.';
            nameInput.focus();
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.dataset.projectId = project.id;

        deleteButton.addEventListener('click', () => {
            const confirmed = window.confirm(
                `Delete the project "${project.name}"?`
            );

            if (!confirmed) {
                message.textContent = 'Deletion cancelled.';
                return;
            }

            const index = projects.findIndex(
                item => item.id === deleteButton.dataset.projectId
            );

            if (index === -1) {
                message.textContent = 'Project not found.';
                return;
            }

            const deletedId = projects[index].id;
            projects.splice(index, 1);

            if (editingId === deletedId) {
                resetForm();
                message.textContent =
                    'Project deleted. Edit mode cancelled.';
            } else {
                message.textContent = 'Project deleted successfully.';
            }

            renderProjects();
            saveProjects();
        });

        listItem.appendChild(projectText);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        projectList.appendChild(listItem);
    });

    emptyState.hidden = projects.length > 0;
}

function saveProjects() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );
        return true;
    } catch (error) {
        message.textContent =
            'Changes could not be saved to browser storage. ' +
            'Your latest changes may be lost after refresh.';
        return false;
    }
}

function loadProjects() {
    let savedText;

    try {
        savedText = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        message.textContent =
            'Could not read browser storage. ' +
            'Check your browser storage permissions.';
        return;
    }

    if (savedText === null) {
        return;
    }

    try {
        const savedProjects = JSON.parse(savedText);

        const validArray =
            Array.isArray(savedProjects) &&
            savedProjects.every(project =>
                project !== null &&
                typeof project === 'object' &&
                typeof project.id === 'string' &&
                typeof project.name === 'string' &&
                typeof project.status === 'string' &&
                project.name.trim() !== '' &&
                ['Planned', 'In Progress', 'Completed']
                    .includes(project.status)
            );

        const ids = validArray
            ? savedProjects.map(project => project.id)
            : [];

        const uniqueIds = new Set(ids).size === ids.length;

        if (!validArray || !uniqueIds) {
            storageDataInvalid = true;
            message.textContent =
                'Saved project data is invalid. ' +
                'It has not been overwritten. Check the ' +
                'workshop-projects-v1 entry in browser storage.';
            return;
        }

        projects.push(...savedProjects);
    } catch (error) {
        storageDataInvalid = true;
        message.textContent =
            'Saved project data could not be read. ' +
            'It has not been overwritten. Check the ' +
            'workshop-projects-v1 entry in browser storage.';
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === '') {
        message.textContent = 'Please enter a project name.';
        nameInput.focus();
        return;
    }

    if (storageDataInvalid) {
        message.textContent =
            'Cannot save changes because the existing saved data ' +
            'is invalid. Ask your instructor for help before ' +
            'changing browser storage.';
        return;
    }

    if (editingId !== null) {
        const project = projects.find(
            item => item.id === editingId
        );

        if (!project) {
            message.textContent = 'Project not found.';
            resetForm();
            return;
        }

        project.name = name;
        project.status = status;
        message.textContent = 'Project updated successfully.';
    } else {
        const project = {
            id: crypto.randomUUID(),
            name: name,
            status: status
        };

        projects.push(project);
        message.textContent = 'Project added successfully.';
    }

    resetForm();
    renderProjects();
    saveProjects();
    nameInput.focus();
});

cancelButton.addEventListener('click', () => {
    resetForm();
    message.textContent = 'Edit cancelled.';
    nameInput.focus();
});

loadProjects();
renderProjects();