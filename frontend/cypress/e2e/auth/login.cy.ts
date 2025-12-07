describe("Página de Login", () => {
  const adminEmail = "admin@gdash.com";
  const adminPassword = "123456";

  beforeEach(() => {
    cy.visit("/login");
  });

  it("deve exibir o formulário de login com campos e botão", () => {
    cy.get('[data-cy="form-login"]').should("be.visible");
    cy.get('[data-cy="input-email"]').should("be.visible");
    cy.get('[data-cy="input-password"]').should("be.visible");
    cy.get('[data-cy="button-enter"]').should("be.visible").and("contain.text", "Entrar");
  });

  it("deve permitir preencher email e senha", () => {
    cy.get('[data-cy="input-email"]')
      .type("usuario.teste@gdash.com")
      .should("have.value", "usuario.teste@gdash.com");

    cy.get('[data-cy="input-password"]')
      .type("minhasenha123")
      .should("have.value", "minhasenha123");
  });

  it("deve exibir mensagem de erro ao tentar entrar sem preencher os campos", () => {
    cy.get('[data-cy="button-enter"]').click();

    cy.get('[data-cy="message-erro-login"]').should("be.visible");
  });

  it("deve exibir mensagem de erro quando as credenciais forem inválidas", () => {
    cy.intercept("POST", "**/auth/login").as("loginRequest");

    cy.get('[data-cy="input-email"]').type("usuario.errado@gdash.com");
    cy.get('[data-cy="input-password"]').type("senhaerrada123");
    cy.get('[data-cy="button-enter"]').click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);

    cy.get('[data-cy="message-erro-login"]').should("be.visible");
  });

  it("deve realizar login com sucesso quando as credenciais forem válidas", () => {
    cy.intercept("POST", "**/auth/login").as("loginRequestSuccess");

    cy.get('[data-cy="input-email"]').type(adminEmail);
    cy.get('[data-cy="input-password"]').type(adminPassword);
    cy.get('[data-cy="button-enter"]').click();

    cy.wait("@loginRequestSuccess").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/dashboard");
  });
});
