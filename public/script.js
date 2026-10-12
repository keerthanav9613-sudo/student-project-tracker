const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

const projects = [];

function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const listItem = document.createElement('li');
        listItem.textContent = `${project.name} — ${project.status}`;
        projectList.appendChild(listItem);
    });

    emptyState.hidden = projects.length > 0;
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

    const project = {
        id: crypto.randomUUID(),
        name: name,
        status: status
    };

    projects.push(project);
    renderProjects();

    message.textContent = 'Project added successfully.';
    nameInput.value = '';
    nameInput.focus();
});