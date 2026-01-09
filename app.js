/* =========================
   DOM ELEMENT SELECTION
   ========================= */

const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const filterButtons = document.querySelectorAll(".filter-btn");
const itemsLeftText = document.querySelector(".footer-info p");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

/* =========================
   INITIAL LOAD
   ========================= */

document.addEventListener("DOMContentLoaded", loadTodos);

/* =========================
   ADD TODO
   ========================= */

addTodoBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        addTodo();
    }
});

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === "") return;

    const li = document.createElement("li");
    li.className = "todo-item";

    li.innerHTML = `
        <input type="checkbox" class="todo-checkbox">
        <span class="todo-text">${todoText}</span>
        <button class="delete-btn">×</button>
    `;

    todoList.appendChild(li);
    todoInput.value = "";

    updateItemsLeft();
    saveTodos();
}

/* =========================
   DELETE & COMPLETE TODOS
   (EVENT DELEGATION)
   ========================= */

todoList.addEventListener("click", function (e) {

    // DELETE TODO
    if (e.target.classList.contains("delete-btn")) {
        e.target.parentElement.remove();
    }

    // TOGGLE COMPLETE
    if (e.target.classList.contains("todo-checkbox")) {
        e.target.parentElement.classList.toggle("completed");
    }

    updateItemsLeft();
    saveTodos();
});

/* =========================
   UPDATE ITEMS LEFT
   ========================= */

function updateItemsLeft() {
    const todos = document.querySelectorAll(".todo-item");
    let count = 0;

    todos.forEach(todo => {
        if (!todo.classList.contains("completed")) {
            count++;
        }
    });

    itemsLeftText.textContent = `${count} item${count !== 1 ? "s" : ""} left`;
}

/* =========================
   FILTER TODOS
   ========================= */

filterButtons.forEach(button => {
    button.addEventListener("click", function () {

        filterButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

        const filter = this.dataset.filter;
        const todos = document.querySelectorAll(".todo-item");

        todos.forEach(todo => {
            if (filter === "all") {
                todo.style.display = "flex";
            } else if (filter === "active") {
                todo.style.display = todo.classList.contains("completed")
                    ? "none"
                    : "flex";
            } else if (filter === "completed") {
                todo.style.display = todo.classList.contains("completed")
                    ? "flex"
                    : "none";
            }
        });
    });
});

/* =========================
   CLEAR COMPLETED TODOS
   ========================= */

clearCompletedBtn.addEventListener("click", function () {
    const completedTodos = document.querySelectorAll(".todo-item.completed");
    completedTodos.forEach(todo => todo.remove());

    updateItemsLeft();
    saveTodos();
});

/* =========================
   LOCAL STORAGE
   ========================= */

function saveTodos() {
    const todos = [];

    document.querySelectorAll(".todo-item").forEach(todo => {
        todos.push({
            text: todo.querySelector(".todo-text").textContent,
            completed: todo.classList.contains("completed")
        });
    });

    localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

    savedTodos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item";

        if (todo.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn">×</button>
        `;

        todoList.appendChild(li);
    });

    updateItemsLeft();
}

/* =========================
   DOWNLOAD PDF
   ========================= */

downloadPdfBtn.addEventListener("click", downloadPDF);

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("My Todo List", 20, 20);

    doc.setFontSize(12);

    const todos = document.querySelectorAll(".todo-item");
    let yPosition = 35;

    if (todos.length === 0) {
        doc.text("No tasks available.", 20, yPosition);
    } else {
        todos.forEach(todo => {
            const text = todo.querySelector(".todo-text").textContent;
            const isCompleted = todo.classList.contains("completed");

            const prefix = isCompleted ? "✓" : "□";
            doc.text(`${prefix} ${text}`, 20, yPosition);

            yPosition += 10;

            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
            }
        });
    }

    doc.save("todo-list.pdf");
}
