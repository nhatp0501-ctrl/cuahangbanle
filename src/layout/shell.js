function shell() {
  const u = store.user;
  $('#root').innerHTML = `<aside class="sidebar">${logo()}<nav>${pages
    .filter((p) => store.can(p[0]))
    .map(
      ([key, label, ico, group]) =>
        `${group ? `<div class="nav-group">${group}</div>` : ''}<button class="nav-item ${page === key ? 'active' : ''}" data-action="navigate" data-page="${key}">${icon(ico)}<span>${label}</span>${key === 'branches' ? '<span class="badge">Mở rộng</span>' : ''}</button>`,
    )
    .join(
      '',
    )}</nav><div class="sidebar-bottom"><div class="sidebar-note">${icon('shield')}<div><strong>Không gian làm việc của bạn</strong><p>Đơn hàng, hàng hóa và dữ liệu được lưu trên thiết bị này.</p></div></div><div class="sidebar-user"><div class="avatar">${e(
    u.name
      .split(' ')
      .map((s) => s[0])
      .slice(-2)
      .join(''),
  )}</div><div><strong>${e(u.name)}</strong><small>${ROLES[u.role]}</small></div>${ib('logout', 'logout', 'Đăng xuất')}</div></div></aside><div class="main"><header class="topbar">${ib('mobile-menu', 'menu', 'Mở menu', 'class="mobile-menu"')}<div class="global-search">${icon('search')}<input id="global-search" placeholder="Tìm kiếm màn hình, sản phẩm, hóa đơn…" aria-label="Tìm kiếm toàn hệ thống" autocomplete="off"><span class="key">/</span><div id="global-results" hidden></div></div><div class="topbar-right"><span class="badge"><i class="dot"></i>LƯU TRÊN THIẾT BỊ</span>${ib('notifications', 'bell', 'Thông báo cửa hàng')}<div class="topbar-user"><div class="avatar">${e(u.username.slice(0, 2).toUpperCase())}</div><div><strong>${e(u.name)}</strong><small>Chi nhánh chính</small></div></div></div></header><main class="content" id="content"></main></div>`;
  render();
}

function navigate(target) {
  if (!store.can(target)) throw new Error('Bạn không có quyền truy cập màn hình này.');
  page = target;
  filters = {};
  pagination = {};
  document.body.classList.remove('menu-open');
  $('.sidebar')?.classList.remove('open');
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.page === page));
  render();
  window.scrollTo(0, 0);
}

function render() {
  if (!store.user) {
    loginScreen();
    return;
  }
  const focused = document.activeElement?.id,
    selection = document.activeElement?.selectionStart;
  const views = {
    dashboard: dashboardView,
    pos: posView,
    products: productsView,
    orders: ordersView,
    inventory: inventoryView,
    purchases: purchasesView,
    suppliers: () => entitiesView('suppliers'),
    customers: () => entitiesView('customers'),
    staff: () => entitiesView('staff'),
    returns: returnsView,
    reports: reportsView,
    branches: branchesView,
    settings: settingsView,
    promotions: promotionsView,
  };
  $('#content').innerHTML =
    views[page]() +
    `<footer class="footer">RetailFlow · Quản lý cửa hàng bán lẻ &nbsp;·&nbsp; ${e(store.data.settings.name)}</footer>`;
  if (focused) {
    const el = document.getElementById(focused);
    if (el) {
      el.focus();
      if (selection != null && el.setSelectionRange)
        try {
          el.setSelectionRange(selection, selection);
        } catch {}
    }
  }
}

function globalSearch(query) {
  let container = $('#global-results');
  if (!query.trim()) {
    container?.remove();
    return;
  }
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-results';
    $('.global-search').append(container);
  }
  container.hidden = false;
  container.className = 'search-results';
  const targets = pages
    .filter((p) => store.can(p[0]) && match(p[1], query))
    .map(
      ([key, label, ico]) =>
        `<button data-action="navigate" data-page="${key}">${icon(ico)}${e(label)}</button>`,
    );
  if (store.can('orders'))
    store.data.orders
      .filter((o) => match(`${o.id} ${o.customer}`, query))
      .slice(0, 4)
      .forEach((o) =>
        targets.push(
          `<button data-action="order-detail" data-id="${e(o.id)}">${icon('receipt')}<span>${e(o.id)}<small class="sub"> · ${e(o.customer)} · ${money(o.total)}</small></span></button>`,
        ),
      );
  if (store.can('pos'))
    store.data.products
      .filter((p) => p.active && match(`${p.name} ${p.barcode}`, query))
      .slice(0, 4)
      .forEach((p) =>
        targets.push(
          `<button data-action="search-product" data-id="${e(p.id)}">${e(p.icon)} ${e(p.name)} · ${money(p.price)}</button>`,
        ),
      );
  container.innerHTML =
    targets.slice(0, 10).join('') ||
    '<div class="sub" style="padding:12px">Không tìm thấy kết quả phù hợp.</div>';
}
