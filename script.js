// ======== Elements Selectors ========

const toggleTheme = document.querySelector(".sun")
const todoHeaderSection = document.querySelector('.todo-header-section')
const todoMainSection = document.querySelector('.todo-main-section')
const inputElement = document.querySelector('.todo-input')
const listElement = document.querySelector('.todo-list')
const filterGroupMobile = document.querySelectorAll('.filter-group-mobile')
const secondButton = document.querySelector('.filter-group-desktop')
const emptyImage = document.querySelector('.empty-image');
const allTasks = document.querySelector('.allTasks');
const itemsleft = document.querySelectorAll('.items-left-count'); 
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelectorAll('.clear-completed-btn');
const errorContainer = document.querySelector('.error-message');


const MAX_TASK_LENGTH = 50; // Maximum length for a task
let currentFilter = 'all'; // الوضع الافتراضي: عرض كل المهام


// ====== Theme Toggle ======

toggleTheme.addEventListener("click" , () => {
    toggleTheme.classList.toggle('moon');
    todoHeaderSection.classList.toggle('light');
    todoMainSection.classList.toggle('lightMode');
    inputElement.classList.toggle('dark-input');
    listElement.classList.toggle('veryLightMode');
    secondButton.classList.toggle('veryLightMode');
    filterGroupMobile.forEach((button)  => {
       button.classList.toggle('veryLightMode');
    });

    const isDark = toggleTheme.classList.contains('moon');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const loadTheme = () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    toggleTheme.classList.add('moon');
    todoHeaderSection.classList.add('light');
    todoMainSection.classList.add('lightMode');
    inputElement.classList.add('dark-input');
    listElement.classList.add('veryLightMode');
    secondButton.classList.add('veryLightMode');
    filterGroupMobile.forEach((button) => {
      button.classList.add('veryLightMode');
    });
  }
};

// ====== Task Data Management ======

const fetchData = () => {
  const data = localStorage.getItem('tasks');
  return data ? JSON.parse(data) : [];

}

let taskList = fetchData();

const saveData = () => {
  localStorage.setItem('tasks', JSON.stringify(taskList));
};

// ======== UI Updates ========

const updateItemsLeft = () => {
  const remaining = taskList.filter(task => !task.completed).length;
  itemsleft.forEach(item => {
   item.textContent = `${remaining} ${remaining === 1 ? 'item' : 'items'} left`;
  })
}

const clearCompleted = () => {
  taskList = taskList.filter(task => !task.completed);
  saveData();
  renderTasks();
}


clearCompletedBtn.forEach(button => {
  button.addEventListener('click', () => {
    clearCompleted();
  })
})

// ======== Rendering Tasks ========

const renderTasks = () => {
  listElement.innerHTML = '';

  const filteredTasks = taskList.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    
     return true; // عرض كل المهام
  
  });

  updateItemsLeft();

  filteredTasks.forEach(taskObj => {
    const task = createTaskElement(taskObj);
    setupTaskEvents(task, taskObj);
    listElement.appendChild(task);
  })
  
  updateEmptyList();
}



const updateEmptyList = () => {

  if (listElement.children.length === 0 ) {
    listElement.classList.remove('todo-list');
    emptyImage.style.display = 'block';
  } else {
    listElement.classList.add('todo-list');
    emptyImage.style.display = 'none';
  }
};

// ======== Task Element Creation ========

const createTaskElement = ({text, completed}) => {

const li = document.createElement('li');

       li.innerHTML = `
       <div class="icons ${completed ? 'hide-line' : ''} ">
            <div class="icon-checked ${completed ? 'icon-check' : ''}">
                <img class="chek" src="./images/icon-check.svg" alt="icon-check" style="display: ${completed ? 'block' : 'none'} " >
            </div>
            <div class="taskInput ${completed ? 'checked' : ''}">${text}</div>
            <div class="icon-cross">
                <img src="./images/icon-cross.svg" alt="icon-cross">
            </div>
        </div>` ;
        return li;
      
        
      }

      // ======== Error Message ========

 const showError = (message) => {
        errorContainer.textContent = message;
        errorContainer.style.opacity = '1';
        setTimeout(() => {
            errorContainer.style.opacity = '0';
        }, 2000);
        
}     


// ======== Task Event Listeners Setup ========

const setupTaskEvents = (li , taskObj) => {
       const taskInput = li.querySelector('.taskInput')
       const deletIcon = li.querySelector('.icon-cross')
       const iconChecked = li.querySelector('.icon-checked')
       const iconCheck = li.querySelector('.chek')
       const iconsAfter = li.querySelector('.icons')

         // Delete task

       deletIcon.addEventListener("click", () => {
        const index = taskList.indexOf(taskObj);

        if (index !== -1) {
          taskList.splice(index, 1);
        }
           li.remove();
           saveData();
           updateEmptyList();
        
       });
       
       // Toggle complete task

       iconChecked.addEventListener("click", () => {
       iconChecked.classList.toggle('icon-check');
       taskInput.classList.toggle('checked');
       iconsAfter.classList.toggle('hide-line');
       
       iconCheck.style.display = iconChecked.classList.contains('icon-check')
          ? 'block' : 'none';

        taskObj.completed = iconChecked.classList.contains('icon-check');
        saveData();
      });
      };

// ======== Adding New Task ========

const handleAddTask = () => {
  const value = inputElement.value.trim();
  if (value === '') return;

  if (value.length > MAX_TASK_LENGTH) {
    showError(`Task is too long, please limit to ${MAX_TASK_LENGTH} characters.`);
    return;
  }
  if (taskList.some(task => task.text === value)) {
    showError('This task already exists.');
    return;
  }
  const taskObj = {
    text: value,
    completed: false
  }

  taskList.unshift(taskObj);
  saveData();
  renderTasks();
  inputElement.value = '';
}

// ======== Filter Buttons Logic ========

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    renderTasks();
  });
 
});

// ======== Keyboard Input Listener ========

inputElement.addEventListener("keydown", (e) => {
      if (e.key === 'Enter') {
       handleAddTask();
      } 
});

// ======== Initial Load ========

window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  renderTasks();

  // Initialize drag and drop using Sortable.js

  Sortable.create(listElement, {
    animation: 100,
    onEnd: function (evt) {
      const newOrder = [...listElement.children].map(li =>
        li.querySelector('.taskInput').textContent
      );
      // إعادة ترتيب taskList بناءً على الترتيب الجديد في الواجهة
      taskList = newOrder.map(text => taskList.find(task => task.text === text));
      saveData();
    }
  });
});

