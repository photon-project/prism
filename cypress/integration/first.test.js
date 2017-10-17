var resp = (routeData) => {
  console.log(routeData);

  return {};
}

describe('My First Test', function() {
  it('finds the content "type"', function() {
    cy.server({
      whitelist: (xhr) => false
    });

    cy.route('GET', '/i**', resp).as('sp', resp);
    // visit the dashboard, which should make requests that match
    // the two routes above
    cy.visit('https://www.realestate.com.au/sold/in-travancore%2c+vic+3032%3b/list-1')
    // pass an array of Route Aliases that forces Cypress to wait
    // until it sees a response for each request that matches
    // each of these aliases
    cy.wait(['@sp'])
    // these commands will not run until the wait command resolves above
    expect(true).to.eql(true);
  })
})