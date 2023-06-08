const BASE_URL = "http://localhost:3000";

describe("/ - Todos Feed", () => {
    it("when load, renders the page", () => {
        cy.visit(BASE_URL);
    });
    it("when create a new todo, it must appears in the screen", () => {
        cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "70905d7e-c969-45b1-99f0-1aa155477204",
                        date: "2023-04-15T19:46:51.109Z",
                        content: "Test todo",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(BASE_URL);
        const inputAddTodo = "input[name='add-todo']";
        const buttonAddTodo = "[aria-label='Adicionar novo item']";

        cy.get(inputAddTodo).type("Test todo");
        cy.get(buttonAddTodo).click();
        cy.get("table > tbody").contains("Test todo");
    });
});
