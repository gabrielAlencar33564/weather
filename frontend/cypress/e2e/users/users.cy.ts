describe("Gestão de usuários", () => {
  const adminEmail = "admin@gdash.com";
  const adminPassword = "123456";

  beforeEach(() => {
    cy.login({ password: adminPassword, email: adminEmail });

    cy.intercept("GET", "**/users*").as("getUsers");

    cy.visit("/users");

    cy.wait("@getUsers");
  });

  it("deve listar usuários com dados da API", () => {
    cy.get('[data-cy="users-page"]').should("be.visible");
    cy.get('[data-cy="users-header"]').should("be.visible");
    cy.get('[data-cy="users-table"]').should("be.visible");

    cy.get('[data-cy="users-table-row"]').its("length").should("be.gte", 1);
  });

  it("deve abrir o formulário ao clicar em novo usuário", () => {
    cy.get('[data-cy="button-new-user"]').click();
    cy.get('[data-cy="users-form"]').should("be.visible");
  });

  it("deve criar um novo usuário com dados válidos", () => {
    const uniqueEmail = `e2e.${Date.now()}@gdash.com`;

    cy.get('[data-cy="button-new-user"]').click();
    cy.get('[data-cy="users-form"]').should("be.visible");

    cy.intercept("POST", "**/users").as("createUser");
    cy.intercept("GET", "**/users*").as("reloadUsers");

    cy.get('[data-cy="input-user-name"]').type("Usuário E2E Cypress");
    cy.get('[data-cy="input-user-email"]').type(uniqueEmail);
    cy.get('[data-cy="input-user-password"]').type("senhaSegura123");

    cy.get('[data-cy="button-submit-user"]').click();

    cy.wait("@createUser").its("response.statusCode").should("be.oneOf", [200, 201]);

    cy.wait("@reloadUsers");

    cy.contains("td", uniqueEmail).should("exist");
  });

  it("deve editar um usuário existente", () => {
    cy.get('[data-cy="users-table-row"]').last().as("userRow");

    cy.get("@userRow").within(() => {
      cy.get('[data-cy="button-edit-user"]').click();
    });

    cy.get('[data-cy="users-form"]').should("be.visible");

    const newName = `Usuário Editado ${Date.now()}`;

    cy.intercept("PATCH", "**/users/**").as("updateUser");

    cy.get('[data-cy="input-user-name"]').clear().type(newName);
    cy.get('[data-cy="button-submit-user"]').click();

    cy.wait("@updateUser").its("response.statusCode").should("eq", 200);

    cy.contains("td", newName).should("exist");
  });

  it("deve excluir um usuário com confirmação no diálogo", () => {
    let deletedUserEmail: string | null = null;

    cy.get('[data-cy="users-table-row"]').last().as("rowToDelete");

    cy.get("@rowToDelete")
      .find("td")
      .eq(1)
      .invoke("text")
      .then((email) => {
        deletedUserEmail = email.trim();
      });

    cy.get("@rowToDelete").within(() => {
      cy.get('[data-cy="button-delete-user"]').click();
    });

    cy.get('[data-cy="users-delete-dialog"]').should("be.visible");
    cy.get('[data-cy="users-delete-dialog-message"]').should("be.visible");

    cy.intercept("DELETE", "**/users/**").as("deleteUser");

    cy.get('[data-cy="button-confirm-delete-user"]').click();

    cy.wait("@deleteUser").its("response.statusCode").should("be.oneOf", [200, 204]);

    cy.then(() => {
      if (deletedUserEmail && deletedUserEmail.length > 0) {
        cy.contains("td", deletedUserEmail).should("not.exist");
      }
    });
  });
});
