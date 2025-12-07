describe("Dashboard de clima", () => {
  const adminEmail = "admin@gdash.com";
  const adminPassword = "123456";

  beforeEach(() => {
    cy.login({ password: adminPassword, email: adminEmail });

    cy.intercept("GET", "**/weather/logs**").as("getWeatherLogs");
    cy.intercept("GET", "**/weather/insight**").as("getWeatherInsight");

    cy.visit("/dashboard");

    cy.wait("@getWeatherLogs");
  });

  it("deve exibir o cabeçalho da dashboard", () => {
    cy.get('[data-cy="dashboard-page"]').should("be.visible");
    cy.get('[data-cy="dashboard-header"]').should("be.visible");

    cy.contains("Dashboard de Clima").should("be.visible");
    cy.contains("Monitoramento em tempo real").should("be.visible");
  });

  it("deve exibir os cards de KPIs de clima com valores", () => {
    cy.get('[data-cy="weather-kpi-cards"]').should("be.visible");

    cy.get('[data-cy="kpi-temperatura"]').within(() => {
      cy.get('[data-cy="kpi-temperatura-valor"]').should("contain", "°C");
    });

    cy.get('[data-cy="kpi-umidade"]').within(() => {
      cy.get('[data-cy="kpi-umidade-valor"]').should("contain", "%");
    });

    cy.get('[data-cy="kpi-vento"]').within(() => {
      cy.get('[data-cy="kpi-vento-valor"]').should("contain", "km/h");
    });

    cy.get('[data-cy="kpi-prob-chuva"]').within(() => {
      cy.get('[data-cy="kpi-prob-chuva-valor"]').should("contain", "%");
    });
  });

  it("deve exibir o insight de IA de clima", () => {
    cy.wait("@getWeatherInsight", { timeout: 20000 }).then(() => {
      cy.contains("Insight inteligente do clima").should("be.visible");

      cy.contains("Análise gerada automaticamente pela IA", {
        timeout: 20000,
      }).should("exist");

      cy.contains("Insight gerado com base nos registros mais recentes", {
        timeout: 20000,
      }).should("exist");
    });
  });

  it("deve renderizar o gráfico de variação de temperatura", () => {
    cy.get('[data-cy="temperature-chart-card"]').within(() => {
      cy.get("svg", { timeout: 15000 }).should("exist");
    });
  });

  it("deve renderizar o gráfico de umidade e chuva", () => {
    cy.get('[data-cy="humidity-rain-chart-card"]').within(() => {
      cy.get("svg", { timeout: 15000 }).should("exist");
    });
  });

  it("deve listar os registros recentes na tabela", () => {
    cy.get('[data-cy="weather-table-card"]').scrollIntoView().should("be.visible");

    cy.get('[data-cy="weather-table"]').within(() => {
      cy.contains("Horário").should("be.visible");
      cy.contains("Temperatura").should("be.visible");
      cy.contains("Umidade").should("be.visible");
      cy.contains("Vento").should("be.visible");
      cy.contains("Condição").should("be.visible");

      cy.get("tbody tr").then((rows) => {
        if (rows.length === 1) {
          cy.contains("Nenhum registro encontrado").should("exist");
        } else {
          cy.get("tbody tr").its("length").should("be.gte", 1);
        }
      });
    });
  });

  it("deve paginar os registros recentes ao mudar de página", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="weather-table-pagination"]').length === 0) {
        return;
      }

      cy.get('[data-cy="weather-table-card"]').scrollIntoView().should("be.visible");

      cy.get('[data-cy="weather-table"]')
        .find("tbody tr")
        .first()
        .find("td")
        .first()
        .invoke("text")
        .then((firstPageFirstTime) => {
          const trimmedTime = firstPageFirstTime.trim();

          cy.intercept("GET", "**/weather/logs**").as("getWeatherLogsPage");

          cy.get('[data-cy="weather-table-pagination"]')
            .scrollIntoView()
            .contains("2")
            .click();

          cy.wait("@getWeatherLogsPage", { timeout: 15000 });

          cy.get('[data-cy="weather-table"]')
            .find("tbody tr", { timeout: 15000 })
            .first()
            .find("td")
            .first()
            .invoke("text")
            .should((secondPageFirstTime) => {
              // eslint-disable-next-line no-undef
              expect(secondPageFirstTime.trim()).not.to.eq(trimmedTime);
            });
        });
    });
  });

  it("deve exportar dados em CSV", () => {
    cy.intercept("GET", "**/weather/export.csv").as("exportCsv");

    cy.get('[data-cy="button-export-csv"]').click();

    cy.wait("@exportCsv", { timeout: 20000 })
      .its("response.statusCode")
      .should("eq", 200);
  });

  it("deve exportar dados em XLSX", () => {
    cy.intercept("GET", "**/weather/export.xlsx").as("exportXlsx");

    cy.get('[data-cy="button-export-xlsx"]').click();

    cy.wait("@exportXlsx", { timeout: 20000 })
      .its("response.statusCode")
      .should("eq", 200);
  });
});
