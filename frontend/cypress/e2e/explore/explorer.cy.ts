describe("Página de exploração de pokemons", () => {
  const adminEmail = "admin@gdash.com";
  const adminPassword = "123456";

  beforeEach(() => {
    cy.login({ password: adminPassword, email: adminEmail });

    cy.intercept("GET", "**/pokemon*").as("getPokemons");

    cy.visit("/explore");

    cy.wait("@getPokemons");
  });

  it("deve exibir a lista inicial de pokemons", () => {
    cy.get('[data-cy="explorer-page"]').should("be.visible");
    cy.get('[data-cy="explorer-header"]').should("be.visible");
    cy.get('[data-cy="pokemon-list-section"]').should("be.visible");

    cy.get('[data-cy="pokemon-list-item"]').its("length").should("be.gte", 1);
  });

  it("deve exibir detalhes ao selecionar um pokemon", () => {
    cy.get('[data-cy="pokemon-detail-empty"]').should("be.visible");

    cy.get('[data-cy="pokemon-list-item"]').first().click();

    cy.get('[data-cy="pokemon-detail-name"]', { timeout: 15000 }).should("be.visible");

    cy.get('[data-cy="pokemon-detail-empty"]').should("not.exist");
  });

  it("deve destacar o card do pokemon selecionado", () => {
    cy.get('[data-cy="pokemon-list-item"]')
      .first()
      .invoke("text")
      .then((name) => {
        const trimmedName = name.trim();

        cy.get('[data-cy="pokemon-list-item"]').first().click();

        cy.contains('[data-cy="pokemon-list-item"]', trimmedName)
          .should("have.class", "border-primary")
          .and("have.class", "bg-primary/10");
      });
  });

  it("deve paginar a lista de pokemons quando mudar de página", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="pokemon-list-pagination"]').length === 0) {
        return;
      }

      cy.get('[data-cy="pokemon-list-item"]')
        .first()
        .invoke("text")
        .then((firstPageFirstName) => {
          const trimmedName = firstPageFirstName.trim();

          cy.get('[data-cy="pokemon-page-link"]').contains("2").click();

          cy.get('[data-cy="pokemon-list-item"]', { timeout: 15000 })
            .first()
            .invoke("text")
            .should((secondPageFirstName) => {
              // eslint-disable-next-line no-undef
              expect(secondPageFirstName.trim()).not.to.eq(trimmedName);
            });
        });
    });
  });
});
