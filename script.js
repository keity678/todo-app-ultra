document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const currentDateDisplay = document.getElementById('current-date');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    let dragSrcEl = null;

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

        filteredTodos.forEach((todo) => {
            const li = document.createElement('li');
            li.setAttribute('draggable', true);
            li.dataset.id = todo.id;
            if (todo.completed) li.classList.add('completed');

            li.innerHTML = `
                <div class="checkbox"></div>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            `;

            // Drag and Drop Events
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('dragenter', handleDragEnter);
            li.addEventListener('dragleave', handleDragLeave);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

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

    // Event Delegation
    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const id = parseInt(li.dataset.id);

        if (e.target.classList.contains('checkbox')) {
            toggleTodo(id);
        } else if (e.target.closest('.delete-btn')) {
            deleteTodo(id, li);
        }
    });

    todoList.addEventListener('dblclick', (e) => {
        const span = e.target.closest('.todo-text');
        if (!span) return;
        const li = span.closest('li');
        const id = parseInt(li.dataset.id);
        editTodo(id, span);
    });

    const addTodo = (e) => {
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

    const toggleTodo = (id) => {
        todos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        render();
    };

    const deleteTodo = (id, li) => {
        li.style.transform = 'translateX(20px)';
        li.style.opacity = '0';

        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            render();
        }, 300);
    };

    const editTodo = (id, span) => {
        const originalText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = originalText;

        span.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== originalText) {
                todos = todos.map(todo =>
                    todo.id === id ? { ...todo, text: newText } : todo
                );
                saveTodos();
            }
            render();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') render();
        });
    };

    // Drag and Drop Handlers
    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();

        if (dragSrcEl !== this) {
            const fromId = parseInt(dragSrcEl.dataset.id);
            const toId = parseInt(this.dataset.id);

            const fromIndex = todos.findIndex(t => t.id === fromId);
            const toIndex = todos.findIndex(t => t.id === toId);

            const [movedItem] = todos.splice(fromIndex, 1);
            todos.splice(toIndex, 0, movedItem);

            saveTodos();
            render();
        }
        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        const items = todoList.querySelectorAll('li');
        items.forEach(item => item.classList.remove('over'));
    }

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
