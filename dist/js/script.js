let USER_NAME;
(function() {
    const URL = 'https://jsfeajax.herokuapp.com/';

    window.DataService = {
        sendRequest: sendRequest,
    }
    
    async function sendRequest (body, path = '/todo', method = 'POST',) {
        let response = await fetch(URL+ USER_NAME +path, {
            method: method,
            headers: {'Content-Type': 'application/json;charset=utf-8'}, 
            body: JSON.stringify(body)
        })
        let data = await response.json();
        return data;
        };
})();
const $nameLabel = document.getElementById('userFormInputLabel');
const $nameInput = document.getElementById('userFormInput');

document.addEventListener('focus', inputOnFocus, true);
document.addEventListener('blur', inputOnBlur, true);

function inputOnFocus(e) {
    if (e.target == $nameInput) {
        $nameLabel.classList.add('user-form__input-label_active');
    }
}

function inputOnBlur(e) {
    if (e.target == $nameInput) {
        if (e.target.value) {
            $nameLabel.classList.remove('user-form__input-label_active');
            $nameLabel.style.opacity = '0'
        } else {
            $nameLabel.classList.remove('user-form__input-label_active');
            $nameLabel.style.opacity = '1'
        }
    }
}

function emptyList(list) {
    if (!list.innerHTML) {
        list.innerHTML = '<p class="empty-list">You have no tasks</p>'
    }
}
const $taskArea = document.getElementById('taskFormInput');
const $taskButton = document.getElementById('taskFormButton');
const $errorMessage = document.getElementById('taskFormError');

class Task { 
	constructor(task) {
		this.text = task.text;
		this.id = task.id;
		this.status = task.status;
		this.list = List;
		this.buildTemplate();
		this.handleTaskEvent(); 
	};
	buildTemplate() {
		this.currentTemplate = document.createElement('div');
		this.checkbox = document.createElement('div');
		this.taskText = document.createElement('li');
		this.taskText.classList.add('task');
		this.checkbox.classList.add('task-checkbox');
		this.currentTemplate.classList.add('task-wrapper');
		if(this.status === 'complete') {
			this.currentTemplate.classList.add('task-wrapper_completed')
			this.checkbox.classList.add('task-checkbox_completed');
			this.taskText.classList.add('task_completed'); 
		}
		this.currentTemplate.append(this.checkbox, this.taskText); 
	};
	renderTask() {
		this.currentTemplate.id = `${this.id}`;
		this.taskText.innerHTML = this.text;
		return this.currentTemplate;
	};

	async updateTaskStatus() {
		this.status = 'complete';
		this.checkbox.classList.add('task-checkbox_completed');
		this.taskText.classList.add('task_completed'); 
		this.currentTemplate.classList.add('task-wrapper_completed')
		DataService.sendRequest({text: this.text, id: this.id, status: this.status});
		this.currentTemplate.remove();
		if (this.list.completeTemplate.firstChild.classList.contains('empty-list')) {
			this.list.completeTemplate.firstChild.remove();
		}
		this.list.completeTemplate.append(this.currentTemplate);
		emptyList(this.list.currentTemplate);
	};

	deleteTask() {
		DataService.sendRequest({text: this.text, id: this.id, status: this.status}, '/todo/delete');
		this.currentTemplate.remove();
		emptyList(this.list.completeTemplate)

	};

	handleTaskEvent() {
		this.currentTemplate.addEventListener('click', (e) => this.handleTaskClick(e));
	};

	handleTaskClick() {
			if (this.status === 'new') {
				this.updateTaskStatus();
				this.renderTask();
			} else {
				this.deleteTask();
				this.renderTask();
			}
	};
};

class TaskList { 
	constructor() {
		this.currentTemplate = document.getElementById('list_current');
		this.completeTemplate = document.getElementById('list_completed');
		this.listData;
		this.initList();
	};

	async addTask(e) {
		e.preventDefault();
		if (e.target === $taskButton) {
			if (!$taskArea.value.length) {
				$errorMessage.innerHTML = 'Enter a task and try again!';
			} else {
				$errorMessage.innerHTML = '';
				this.listData = await DataService.sendRequest({text: $taskArea.value});
				const AddedTask = this.listData[this.listData.length-1];
				if (AddedTask.status === 'new') {
					if (this.currentTemplate.firstChild.classList.contains('empty-list')) {
						this.currentTemplate.firstChild.remove();
					}
					this.currentTemplate.append(new Task(AddedTask).renderTask());
				} else {
					if (this.completeTemplate.firstChild.classList.contains('empty-list')) {
						this.completeTemplate.firstChild.remove();
					}
					this.completeTemplate.append(new Task(AddedTask).renderTask());
				}
				$taskArea.value = '';
			}
		}
	};

	async initList() {
		this.currentTemplate.innerHTML = '';
		this.completeTemplate.innerHTML = '';
		this.listData = await DataService.sendRequest(undefined, undefined, 'GET');
		for (const elem of this.listData) {
			if (elem.status === 'new') {
				this.currentTemplate.append(new Task(elem).renderTask());
			} else {
				this.completeTemplate.append(new Task(elem).renderTask());
			}
		}
		emptyList(this.currentTemplate)
		emptyList(this.completeTemplate)
	};
};

function ListEvent(e) {
    List.addTask(e)
}
const $nameButton = document.getElementById('userFormButton');
const $userNameHeader = document.getElementById('userNameHeader');
const $modal = document.getElementById('modal');
let List;

document.addEventListener('click', submitUser);
document.getElementById('headerProfile').addEventListener('click', changeUser)

function submitUser (e) {
    e.preventDefault();
    if (e.target == $nameButton && $nameInput.value) {
        e.preventDefault();
        USER_NAME = $nameInput.value;
        $userNameHeader.textContent = USER_NAME;
        $modal.classList.add('hidden');
        document.removeEventListener('click', ListEvent);
        List = new TaskList;
        document.addEventListener('click', ListEvent);
    }
}

function changeUser(e) {
    if ($userNameHeader.innerHTML) {
        $modal.classList.remove('hidden');
        $nameInput.value = USER_NAME;
    }
}
