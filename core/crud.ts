import fs from "fs"; // ES6
// const fs = require("fs"); -- CommonJS
const DB_FILE_PATH = "./core/db";
import { v4 as uuid } from "uuid";

type UUID = string;

interface Todo {
    id: UUID;
    date: string;
    content: string;
    done: boolean;
}

export function create(content: string): Todo {
    const todo: Todo = {
        id: uuid(),
        date: new Date().toISOString(),
        content: content,
        done: false,
    };

    const todos: Array<Todo> = [...read(), todo];

    fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(
            {
                todos,
            },
            null,
            2
        )
    );

    return todo;
}

export function read(): Array<Todo> {
    const dbAsString = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const db = JSON.parse(dbAsString || "{}"); // Fail fast validations
    if (!db.todos) {
        return [];
    }
    return db.todos;
}

export function update(id: UUID, partialTodo: Partial<Todo>): Todo {
    let updatedTodo;
    const todos = read();
    todos.forEach((currentTodo) => {
        const isToUpdate = currentTodo.id === id;
        if (isToUpdate) {
            updatedTodo = Object.assign(currentTodo, partialTodo);
        }
    });

    fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(
            {
                todos,
            },
            null,
            2
        )
    );

    if (!updatedTodo) {
        throw new Error("Please provide another ID!");
    }

    return updatedTodo;
}

function CLEAR_DB() {
    fs.writeFileSync(DB_FILE_PATH, "");
}

function updateContentById(id: UUID, content: string): Todo {
    return update(id, { content });
}

export function deleteById(id: UUID) {
    const todos = read();
    const todosWithoutOne = todos.filter((todo) => {
        if (id === todo.id) {
            return false;
        }
        return true;
    });

    fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(
            {
                todos: todosWithoutOne,
            },
            null,
            2
        )
    );
}

// [Simulation]
// CLEAR_DB();
// create("Primeira TODO");
// const todo2 = create("Segunda TODO");
// const todo3 = create("Terceira TODO");
// updateContentById(todo3.id, "TODO atualizada!");
// deleteById(todo2.id);
