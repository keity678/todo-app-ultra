document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const currentDateDisplay = document.getElementById('current-date');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('ja-JP', options);

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
    };

    const updateStats = () => {
        const activeCount = todos.filter(t => !t.completed).length;
        itemsLeft.textContent = `${activeCount} items left`;
    };

    const render = () => {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        filteredTodos.forEach((todo, index) => {
            const li = document.createElement('li');
            if (todo.completed) li.classList.add('completed');
            
            li.innerHTML = `
                <div class="checkbox" onclick="toggleTodo(${todo.id})"></div>
                <span>${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            `;
            todoList.appendChild(li);
        });
    };

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    window.addTodo = (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };
            todos.push(newTodo);
            todoInput.value = '';
            saveTodos();
            render();
        }
    };

    window.toggleTodo = (id) => {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        render();
    };

    window.deleteTodo = (id) => {
        const li = event.target.closest('li');
        li.style.transform = 'translateX(20px)';
        li.style.opacity = '0';
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            render();
        }, 300);
    };

    todoForm.addEventListener('submit', addTodo);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            render();
        });
    });

    // Initial render
    render();
    updateStats();
});
