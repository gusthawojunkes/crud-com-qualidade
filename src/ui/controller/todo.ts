import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoControllerGetParams {
    page: number;
}

async function get(params: TodoControllerGetParams) {
    return todoRepository.get({
        page: params.page,
        limit: 2,
    });
}

function filterTodosByContent<Todo>(
    search: string,
    todos: Array<Todo & { content: string }>
): Todo[] {
    return todos.filter((todo) => {
        const searchNormalized = search.toLocaleLowerCase();
        const contentNormalized = todo.content.toLocaleLowerCase();
        return contentNormalized.includes(searchNormalized);
    });
}

interface TodoControllerCreateParams {
    content?: string;
    onSuccess: (todo: Todo) => void;
    onError: (message?: string) => void;
}

function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
    const parsedParams = schema.string().nonempty().safeParse(content);
    if (!parsedParams.success) {
        onError();
        return;
    }

    todoRepository
        .createByContent(parsedParams.data)
        .then((newTodo) => {
            onSuccess(newTodo);
        })
        .catch(() => {
            onError("Você precisa ter um conteúdo para criar uma TODO");
        });
}

interface TodoControllerToggleDoneParams {
    id: string;
    updateTodoOnScreen: () => void;
    onError: () => void;
}

function toggleDone({
    id,
    updateTodoOnScreen,
    onError,
}: TodoControllerToggleDoneParams) {
    todoRepository
        .toggleDone(id)
        .then(() => {
            updateTodoOnScreen();
        })
        .catch(() => {
            onError();
        });
}

async function deleteById(id: string): Promise<void> {
    todoRepository.deleteById(id);
}

export const todoController = {
    get,
    create,
    toggleDone,
    filterTodosByContent,
    deleteById,
};
