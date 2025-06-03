document.addEventListener('DOMContentLoaded', function() {
 
    const taskInput = document.getElementById('taskInput');
    const workTimeInput = document.getElementById('workTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const startDayBtn = document.getElementById('startDayBtn');
    const setupPhase = document.getElementById('setupPhase');
    const timerPhase = document.getElementById('timerPhase');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerStatus = document.getElementById('timerStatus');
    const currentTaskDisplay = document.getElementById('currentTask');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const completedTasksList = document.getElementById('completedTasksList');
    
    const BREAK_TIME = 5 * 60; 
    let tasks = [];
    let completedTasks = [];
    let timer;
    let timeLeft = 0;
    let isRunning = false;
    let isWorkTime = true;
    let currentTaskIndex = -1;
    
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    function addTask() {
        const taskText = taskInput.value.trim();
        const workTime = parseInt(workTimeInput.value) * 60;
        
        if (taskText && workTime > 0) {
            const task = {
                id: Date.now(),
                text: taskText,
                workTime: workTime,
                completed: false
            };
            
            tasks.push(task);
            renderTaskList();
            taskInput.value = '';
            taskInput.focus();
        }
    }
    
    function renderTaskList() {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p>Пока нет задач. Добавьте первую!</p>';
            startDayBtn.disabled = true;
            return;
        } else {
            startDayBtn.disabled = false;
        }
        
        tasks.forEach((task) => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <div>
                    <span>${task.text}</span> - 
                    <span>${formatTime(task.workTime / 60)} работы</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" data-id="${task.id}">✕</button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
   
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                deleteTask(taskId);
            });
        });
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderTaskList();
    }
    
    startDayBtn.addEventListener('click', function() {
        if (tasks.length === 0) return;
        
        setupPhase.style.display = 'none';
        timerPhase.style.display = 'block';
        
        currentTaskIndex = 0;
        isWorkTime = true;
        timeLeft = tasks[currentTaskIndex].workTime;
        updateTimerDisplay();
        updateCurrentTaskDisplay();
    });
    
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    
    function startTimer() {
        if (currentTaskIndex === -1) return;
        
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTimer, 1000);
            
            startTimerBtn.disabled = true;
            pauseTimerBtn.disabled = false;
            
            document.querySelector('.timer-container').classList.add(isWorkTime ? 'work-mode' : 'break-mode');
        }
    }
    
    function pauseTimer() {
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
            
            startTimerBtn.disabled = false;
            pauseTimerBtn.disabled = true;
        }
    }
    
    function updateTimer() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            
            if (isWorkTime) {
     
                tasks[currentTaskIndex].completed = true;
                completedTasks.push(tasks[currentTaskIndex]);
                renderCompletedTasks();
               
                isWorkTime = false;
                timeLeft = BREAK_TIME;
                timerStatus.textContent = 'Перерыв!';
                document.querySelector('.timer-container').classList.remove('work-mode');
                document.querySelector('.timer-container').classList.add('break-mode');
         
                startTimer();
            } else {
            
                const nextTaskIndex = tasks.findIndex(task => !task.completed);
                
                if (nextTaskIndex !== -1) {
                    currentTaskIndex = nextTaskIndex;
                    isWorkTime = true;
                    timeLeft = tasks[currentTaskIndex].workTime;
                    timerStatus.textContent = 'Готов к работе';
                    document.querySelector('.timer-container').classList.remove('break-mode');
                    
                    updateTimerDisplay();
                    updateCurrentTaskDisplay();
                    
                    startTimerBtn.disabled = false;
                    pauseTimerBtn.disabled = true;
                } else {
              
                    timerStatus.textContent = 'Все задачи выполнены!';
                    currentTaskDisplay.textContent = '';
                    startTimerBtn.disabled = true;
                    pauseTimerBtn.disabled = true;
                    
                    document.querySelector('.timer-container').classList.remove('break-mode');
                }
            }
        }
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function updateCurrentTaskDisplay() {
        if (currentTaskIndex !== -1) {
            currentTaskDisplay.textContent = `Текущая задача: ${tasks[currentTaskIndex].text}`;
            timerStatus.textContent = isWorkTime ? 'Готов к работе' : 'Перерыв!';
        }
    }
    
    function renderCompletedTasks() {
        completedTasksList.innerHTML = '';
        
        completedTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item completed';
            taskItem.innerHTML = `
                <div>
                    <span class="checkmark">✓</span>
                    <span>${task.text}</span>
                </div>
            `;
            completedTasksList.appendChild(taskItem);
        });
    }
    
    function formatTime(minutes) {
        return `${Math.floor(minutes)} мин`;
    }
    

document.getElementById('finishDayBtn').addEventListener('click', finishDay);

function finishDay() {
    clearInterval(timer);
    isRunning = false;
  
    document.querySelector('.timer-container').style.display = 'none';
    document.getElementById('summary').style.display = 'block';
   
    const completedTasks = tasks.filter(task => task.completed);
    const uncompletedTasks = tasks.filter(task => !task.completed);
    
    const completedHtml = completedTasks.map(task => 
        `<div class="summary-item completed-summary-item">${task.text} (${task.workTime/60} мин)</div>`
    ).join('');
    
    const uncompletedHtml = uncompletedTasks.map(task => 
        `<div class="summary-item uncompleted-summary-item">${task.text} (${task.workTime/60} мин)</div>`
    ).join('');
    
    document.getElementById('completedSummary').innerHTML = 
        `<h4>Выполнено (${completedTasks.length}):</h4>${completedHtml}`;
    document.getElementById('uncompletedSummary').innerHTML = 
        `<h4>Не выполнено (${uncompletedTasks.length}):</h4>${uncompletedHtml}`;
    
 
    timerStatus.textContent = `День завершён! Выполнено ${completedTasks.length} из ${tasks.length} задач`;
}

document.getElementById('restartDayBtn').addEventListener('click', function() {
    
    tasks.forEach(task => task.completed = false);
    completedTasks = [];
   
    document.querySelector('.timer-container').style.display = 'block';
    document.getElementById('summary').style.display = 'none';
    
    currentTaskIndex = 0;
    isWorkTime = true;
    timeLeft = tasks[currentTaskIndex].workTime;
    updateTimerDisplay();
    updateCurrentTaskDisplay();
    renderTaskList();
    renderCompletedTasks();
    
    timerStatus.textContent = 'Готов к работе';
    startTimerBtn.disabled = false;
});
    
    renderTaskList();
});
