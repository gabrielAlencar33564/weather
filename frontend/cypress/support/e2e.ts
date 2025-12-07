import "./commands";

interface ILoginFormProps {
  email: string;
  password: string;
}

Cypress.Commands.add("login", ({ password, email }: ILoginFormProps) => {
  cy.intercept("POST", "**/auth/login").as("loginRequest");

  cy.visit("/login");

  cy.get('[data-cy="input-email"]').type(email);
  cy.get('[data-cy="input-password"]').type(password);
  cy.get('[data-cy="button-enter"]').click();

  cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

  cy.url().should("not.include", "/login");
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(props: ILoginFormProps): Chainable<void>;
    }
  }
}
