import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";
import { todoRepository } from "@server/repository/todo";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;
    const page = Number(query.page);
    const limit = Number(query.limit);

    if (query.page && isNaN(page)) {
        res.status(400).json({
            error: {
                message: "`page` must be a number",
            },
        });
        return;
    }
    if (query.limit && isNaN(limit)) {
        res.status(400).json({
            error: {
                message: "`limit` must be a number",
            },
        });
        return;
    }

    const output = todoRepository.get({
        page,
        limit,
    });

    res.status(200).json({
        total: output.total,
        pages: output.pages,
        todos: output.todos,
    });
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});
async function create(req: NextApiRequest, res: NextApiResponse) {
    // Fail Fast Validations
    const body = TodoCreateBodySchema.safeParse(req.body);
    // Type Narrowing
    if (!body.success) {
        res.status(400).json({
            error: {
                message: "You need to provide a content to create a TODO",
                description: body.error.issues,
            },
        });
        return;
    }
    // Here we have the data!
    const createdTodo = await todoRepository.createByContent(body.data.content);

    res.status(201).json({
        todo: createdTodo,
    });
}

async function toggleDone(request: NextApiRequest, response: NextApiResponse) {
    const todoId = request.query.id;

    if (!todoId || typeof todoId !== "string") {
        response.status(400).json({
            error: {
                message: "You must to provide a string ID",
            },
        });
        return;
    }

    try {
        const updatedTodo = await todoRepository.toggleDone(todoId);
        response.status(200).json({
            todo: updatedTodo,
        });
    } catch (err) {
        if (err instanceof Error) {
            response.status(404).json({
                error: {
                    message: err.message,
                },
            });
        }
    }
}

async function deleteById(request: NextApiRequest, response: NextApiResponse) {
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    const parsedQuery = QuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
        response.status(400).json({
            error: {
                message: "You must to provide a valid id",
            },
        });
        return;
    }

    try {
        const id = parsedQuery.data.id;
        await todoRepository.deleteById(id);
        response.status(204).end();
        return;
    } catch (error) {
        if (error instanceof HttpNotFoundError) {
            return response.status(error.status).json({
                error: { message: error.message },
            });
        }

        response.status(500).json({
            error: {
                message: "Internal Server Error",
            },
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};
