document.addEventListener('click', (event) => {
  if (!event.target.closest('.global-search')) $('#global-results')?.remove();
  if (!event.target.closest('.customer-lookup')) hideCustomerSuggestions();
  const el = event.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const a = el.dataset;
  try {
    for (const handle of [
      handleNavigationAction,
      handleSalesAction,
      handleCatalogAction,
      handleInventoryAction,
      handleSettingsAction,
      handleOrdersAction,
    ])
      if (handle(a)) break;
  } catch (error) {
    notify(error.message, true);
  }
});
