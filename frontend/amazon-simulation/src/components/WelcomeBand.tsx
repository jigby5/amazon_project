/** Welcome strip with Bootstrap Accordion for extra help text (#notcoveredinthevideos). */
function WelcomeBand() {
  return (
    <div className="alert alert-light border mb-0 py-2 px-3" role="region" aria-label="Welcome">
      <p className="mb-3 small">
        Welcome — browse by category, add books to your cart, and check out when you are ready.
      </p>

      <div className="accordion accordion-flush" id="welcomeAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#welcomeCollapseOne"
              aria-expanded="false"
              aria-controls="welcomeCollapseOne"
            >
              How shopping works
            </button>
          </h2>
          <div
            id="welcomeCollapseOne"
            className="accordion-collapse collapse"
            data-bs-parent="#welcomeAccordion"
          >
            <div className="accordion-body small text-start">
              Set a quantity on a book card and click <strong>Add to cart</strong>. Your cart persists
              while this browser tab is open. Use the cart icon to review lines and totals.
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#welcomeCollapseTwo"
              aria-expanded="false"
              aria-controls="welcomeCollapseTwo"
            >
              Filtering tips
            </button>
          </h2>
          <div
            id="welcomeCollapseTwo"
            className="accordion-collapse collapse"
            data-bs-parent="#welcomeAccordion"
          >
            <div className="accordion-body small text-start">
              Check one or more <strong>Categories</strong> to load only those books from the API.
              Pagination and sort apply to the list you see after filters load.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBand;
