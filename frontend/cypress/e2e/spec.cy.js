describe('happy path 1', () => {
  // it.only('0. silence other test', () => {
  // });

  it('1. register/login/logout function', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('button').contains(/Login/i).click();
    cy.url().should('include', '/login');
    cy.get('a').contains(/No account yet/i).click();
    cy.url().should('include', '/register');

    cy.get('#formRegisterName').type('Admin');
    cy.get('#formRegisterEmail').type('admin@admin.com');
    cy.get('#formRegisterPassword').type('123456');
    cy.get('#formRegisterConfirmPassword').type('123456');

    cy.get('button').contains(/Register/i).click();

    cy.get('body')
      .then($body => {
        if ($body.find('div:contains("Email address already registered")').length > 0) {
          cy.get('button').contains(/Close/i).click();
          cy.get('button').contains(/Login/i).click();
          cy.get('#formLoginEmail').type('admin@admin.com');
          cy.get('#formLoginPassword').type('123456');
          cy.get('button.me-auto').contains(/Login/i).click();
        }
        cy.url().should('include', '/listings');
      });
  });

  it('2. creating list correctly', () => {
    cy.visit('/');
    cy.get('a').contains('My Hosts').click();
    cy.url().should('contain', '/hosted_listings');
    cy.get('a').contains(/Create/i).click();
    cy.url().should('include', 'create_host');
    cy.get('button').contains('Create').click();
    cy.get('div').contains('Property title is required');
    cy.get('div').contains('Address street is required');
    cy.get('#create-form-title').type('Admin Property 1');
    cy.get('div').contains('Property title is required').should('not.be.visible');
    cy.get('#create-form-propertyType').select('apartment');
    cy.get('#create-form-address').type('321 Admin Lane');
    cy.get('div').contains('Address street is required').should('not.be.visible');
    cy.get('#create-form-postcode').type('2000');
    cy.get('#create-form-state').should('contain', 'NSW');
    cy.get('#create-form-postcode').clear();
    cy.get('#create-form-postcode').type('3000');
    cy.get('#create-form-state').should('contain', 'VIC');
    cy.get('#create-form-city').type('Sydney');
    cy.get('#create-form-thumbnail').selectFile('src/assets/house-test.jpg');
    cy.get('#create-form-price').type('305');
    cy.get('#create-form-n-bathrooms').type('2');
    cy.get('#create-form-n-beds').type('1,2,2');
    cy.get('#amenity-0').check();
    cy.get('#amenity-2').check();
    cy.get('#amenity-3').check();
    cy.get('#amenity-0').uncheck();
    cy.get('button').contains('Create').click();
    cy.url().should('include', '/hosted_listings');
  });

  it('3. update a listing', () => {
    cy.visit('/hosted_listings');
    cy.get('div').contains('Admin Property 1').should('be.visible');
    cy.get('button[aria-label="Edit information"]').first().click();
    cy.url().should('include', '/hosted_listings/');
    cy.get('#create-form-title').should('have.value', 'Admin Property 1');
    cy.get('#create-form-title').clear();
    cy.get('#create-form-title').type('Admin Property 2');
    cy.get('#create-form-thumbnail').selectFile('src/assets/house-edit.jpg');
    cy.get('button').contains(/Save/i).click();
  });

  const publish = () => {
    cy.visit('/hosted_listings');
    cy.get('button[aria-label="Publish settings"]').first().click();
    cy.get('button[aria-label="publish-this-listing"]').should('be.disabled');
    cy.get('button[aria-label="add-new-available-time-period"]').should('be.disabled');
    cy.get('input[type="date"]').eq(0).type('2023-11-01');
    cy.get('input[type="date"]').eq(1).type('2023-12-01');
    cy.get('button[aria-label="add-new-available-time-period"]').click();
    cy.get('button[aria-label="add-new-available-time-period"]').should('be.disabled');
    cy.get('input[type="date"]').eq(0).type('2023-12-15');
    cy.get('button[aria-label="add-new-available-time-period"]').click();
    cy.get('input[value="2023-12-15"').should('exist');
    cy.get('button[aria-label="remove-this-available-period"]').eq(1).click();
    cy.get('input[value="2023-12-15"').should('not.exist');
    cy.get('button[aria-label="publish-this-listing"]').should('not.be.disabled');
    cy.get('button[aria-label="publish-this-listing"]').click();
    cy.visit('/listings');
    cy.get('div').contains(/Admin property 2/i);
  };

  it('4. publish this list', () => {
    publish();
  });

  it('5. unpublish test', () => {
    cy.visit('/hosted_listings');
    cy.contains('tr', /admin property/i).within(() => {
      cy.get('button[aria-label="Publish settings"]').click();
    });
    cy.get('div').contains(/unpublish?/i);
    cy.get('.btn-danger').contains(/unpublish/i).click();
    cy.visit('/listings');
    cy.get('div').contains(/Admin property 2/i).should('not.exist');
  });

  it('6. make booking', () => {
    publish();
    cy.visit('/hosted_listings');
    cy.get('button').contains(/logout/i).click();
    cy.get('button').contains(/Confirm/i).click();
    cy.get('button').contains(/Login/i).click();
    cy.url().should('include', '/login');
    cy.get('a').contains(/No account yet/i).click();
    cy.url().should('include', '/register');

    cy.get('#formRegisterName').type('Customer');
    cy.get('#formRegisterEmail').type('customer@customer.com');
    cy.get('#formRegisterPassword').type('123456');
    cy.get('#formRegisterConfirmPassword').type('123456');

    cy.get('button').contains(/Register/i).click();
    cy.get('a').contains('All Listings').click();
    cy.contains('.card', /admin property/i).within(() => {
      cy.get('a').contains(/details/i).click();
    });
    cy.url().should('include', '/listings/');
    cy.get('button').contains(/book now!/i).click();
    cy.get('input').eq(0).type('2023-11-05');
    cy.get('input').eq(1).type('2023-11-07');
    cy.get('div').contains(/2 nights/i);
    cy.get('button').contains(/proceed/i).click();
    cy.get('.badge').contains('pending').should('exist');
  });

  it('7. logout', () => {
    cy.visit('/');
    cy.get('button').contains(/logout/i).click();
    cy.get('button').contains(/Confirm/i).click();
  });

  it('8. log in back', () => {
    cy.visit('/');
    cy.get('button').contains(/login/i).click();
    cy.get('#formLoginEmail').type('admin@admin.com');
    cy.get('#formLoginPassword').type('123456');
    cy.get('button.me-auto').contains(/Login/i).click();
    cy.get('a').contains(/My hosts/i).click();
    cy.contains('tr', /admin property/i).within(() => {
      cy.get('button[aria-label="View booking requests"]').click();
    });
    cy.get('.badge').contains('pending').should('exist');
    cy.get('.btn').contains(/accept/i).click();
    cy.get('.badge').contains('pending').should('not.exist');
    cy.get('.badge').contains('accepted').should('exist');
  });
});
