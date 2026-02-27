// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Banlist Page, adding, deleting and uploading", () => {
  //log in
  beforeEach(() => {
    cy.viewport("macbook-11");

    const username = Cypress.env("validRootUser").username;
    const password = Cypress.env("validRootUser").password;
    cy.login(username, password);
    cy.visit("/banlist");
    cy.intercept("DELETE", "/api/banlist/chemicals/delete").as("delChemicals");
    cy.intercept("DELETE", "/api/banlist/reactions/delete").as("delReactions");
    cy.intercept("GET", "/api/banlist/chemicals").as("getChemicals");
    //cy.wait("@getChemicals");
    cy.intercept("GET", "/api/banlist/reactions").as("getReactions");
    //cy.wait("@getReactions");
  });

  it.only("Clear the banlists", () => {
    cy.get('[data-cy="banlist-reset"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').should("be.visible");
    cy.contains('Chemicals').should("be.visible");
    cy.contains('Chemicals').click();
    cy.get('body').then($body => {
      // If empty-state text is visible, we're done
      if ($body.text().includes('No Ban Items')) {
      return;
      }
    });

    cy.contains('Reactions').should("be.visible");
    cy.contains('Reactions').click();
    cy.get('body').then($body => {
      // If empty-state text is visible, we're done
      if ($body.text().includes('No Ban Items')) {
      return;
      }
    });

    cy.get('[data-cy="banlist-reset"]').click();
    cy.wait(4000);
    //cy.wait("@getChemicals", { timeout: 8000 } );
    //cy.wait("@getReactions", { timeout: 8000 } );
    
    // Check there are no banned chemicals
    cy.contains('Chemicals').should("be.visible");
    cy.contains('Chemicals').click();
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
    // Check there are no banned reactions
    cy.contains('Reactions').should("be.visible");
    cy.contains('Reactions').click();
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
  });

  it("Add chemical to banlist", () => {
    // Test if a superser account is being used by checking for the button
    cy.get('[data-cy="banlist-reset"]').should("be.visible");
    cy.get('[data-cy="banlist-reset"]').click();
    cy.wait(2000);

    cy.contains('Chemicals').should("be.visible");
    cy.get('[data-cy="banlist-add-single-entry"]').should("be.visible");
    cy.get('[data-cy="banlist-add-single-entry"]').click();
    //cy.wait("@getChemicals");
    cy.wait(2000);
    cy.get('[data-cy="banlist-new-entry-select"]').should('be.visible');
    cy.get('[data-cy="banlist-new-entry-select"]').click();
    cy.get(".v-list-item-title").contains("chemicals").click();
   
    cy.get('[data-cy="banlist-new-smiles-input" ]').clear();
    cy.get('[data-cy="banlist-new-smiles-input" ]').type("CCCCC");
    cy.get('[data-cy="banlist-new-description"]').clear();
    cy.get('[data-cy="banlist-new-description"]').type("Cypress-banlist-test CCCCC");
    cy.get('[data-cy="banlist-new-submit"]').click();

    cy.get('[data-cy="banlist-table"]').should('be.visible');
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 3);
    cy.get('[data-cy="banlist-table"]')
        .find("tr")
        .find("td")
        //.contains("Cypress-banlist-test")
        .contains("CCCCC")
        .should("exist");
  });

  it("delete chemical from banlist", () => {
    // Test if a superser account is being used by checking for the button
    //cy.get('[data-cy="banlist-reset"]').should("be.visible");
    //cy.get('[data-cy="banlist-reset"]').click();

    cy.contains('Chemicals').should("be.visible");
    cy.get('[data-cy="banlist-add-single-entry"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 3);
    cy.get('[data-cy="banlist-single-delete"]').should("be.visible");
    cy.get('[data-cy="banlist-single-delete"]').click();
    //cy.wait("@delChemicals");
    cy.wait(2000);

    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
  });

  it("Add a reaction to the banlist", () => {
    // Test if a superser account is being used by checking for the button
    cy.get('[data-cy="banlist-reset"]').should("be.visible");
    //cy.get('[data-cy="banlist-reset"]').click();

    cy.contains('Reactions').should("be.visible");
    cy.contains('Reactions').click();
    cy.get('[data-cy="banlist-add-single-entry"]').should("be.visible");
    cy.get('[data-cy="banlist-add-single-entry"]').click();
    //cy.wait("@getChemicals");
    cy.wait(2000);
    cy.get('[data-cy="banlist-new-entry-select"]').should('be.visible');
    cy.get('[data-cy="banlist-new-entry-select"]').click();
    cy.get(".v-list-item-title").contains("reactions").click();
   
    cy.get('[data-cy="banlist-new-smiles-input" ]').clear();
    cy.get('[data-cy="banlist-new-smiles-input" ]').type("Fc1ccc(C2(Cn3cncn3)CO2)c(F)c1.c1nc[nH]n1");
    cy.get('[data-cy="banlist-new-description"]').clear();
    cy.get('[data-cy="banlist-new-description"]').type("Cypress-banlist-test Fluconazole");
    cy.get('[data-cy="banlist-new-submit"]').click();

    cy.get('[data-cy="banlist-table"]').should('be.visible');
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 3);
    cy.get('[data-cy="banlist-table"]')
        .find("tr")
        .find("td")
        .contains("Fluconazole")
        .should("exist");
  });

  it("delete reaction from banlist", () => {
    // Test if a superser account is being used by checking for the button
    cy.get('[data-cy="banlist-reset"]').should("be.visible");

    cy.contains('Reactions').should("be.visible");
    cy.contains('Reactions').click();
    cy.get('[data-cy="banlist-add-single-entry"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 3);
    cy.get('[data-cy="banlist-single-delete"]').should("be.visible");
    cy.get('[data-cy="banlist-single-delete"]').click();
    //cy.wait("@delChemicals");
    cy.wait(2000);

    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
  });

  it("Add chemicals to the banlist via file upload", () => {
    cy.get('[data-cy="banlist-reset"]').should("be.visible");
    cy.get('[data-cy="banlist-reset"]').click();
    cy.fixture("banlist_sample_chemicals.json").as("banlist-chemical-upload-fixture");
    cy.contains('Chemicals').should("be.visible");
    cy.contains('Chemicals').click();
    cy.get('[data-cy="banlist-add-multiple-entries"]').should("be.visible");
    cy.get('[data-cy="banlist-add-multiple-entries"]').click();
    
    // Select the file to upload using the fixture
    cy.get("input[type=file]").selectFile("@banlist-chemical-upload-fixture", {
      force: true,
    });

    cy.get('[data-cy="banlist-file-upload"]').click(); // Upload inot the banlist.

    // Check entries have been added to the table, should be 4 from the file + 1 from previous test = 5
    cy.get('[data-cy="banlist-table"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 5);
  });

  it("Delete all chemicals and reactions from banlist", () => {
    cy.get('[data-cy="banlist-reset"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').should("be.visible");
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 5);
    cy.get('[data-cy="banlist-table"]')
        .find("tr")
        .find("td")
        .contains("Patent US12345678")
        .should("exist");

    cy.get('[data-cy="banlist-reset"]').click();
    cy.wait(2000);
    //cy.wait("@getChemicals", { timeout: 8000 } );
    //cy.wait("@getReactions", { timeout: 8000 } );
    
    // Check there are no banned chemicals
    cy.contains('Chemicals').should("be.visible");
    cy.contains('Chemicals').click();
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
    // Check there are no banned reactions
    cy.contains('Reactions').should("be.visible");
    cy.contains('Reactions').click();
    cy.get('[data-cy="banlist-table"]').find("tr").should("have.length", 0);
    cy.contains("No Ban Items");
  });
});
