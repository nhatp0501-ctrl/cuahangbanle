(function (scope) {
  'use strict';
  const api =
    typeof module !== 'undefined' && module.exports
      ? {
          ...require('./config.js'),
          ...require('./calculations.js'),
          ...require('./seed.js'),
          ...require('./backup.js'),
          ...require('./migrations.js'),
        }
      : scope.Retail;
  const { KEY, clone, now, id, assert, seed, validateBackup, migrateData } = api;
  class Store {
    constructor(storage) {
      this.storage = storage;
      this.userId = null;
      this.loadError = '';
      let raw = null;
      try {
        raw = storage.getItem(KEY);
        const before = raw ? JSON.parse(raw) : seed();
        if (raw) validateBackup(before);
        this.data = validateBackup(migrateData(before, { fresh: !raw }));
        if (
          raw &&
          before.schema < 3 &&
          !storage.getItem(KEY + '.before-v' + (before.schema === 1 ? 2 : 3))
        )
          storage.setItem(KEY + '.before-v' + (before.schema === 1 ? 2 : 3), raw);
        if (!raw || JSON.stringify(before) !== JSON.stringify(this.data))
          storage.setItem(KEY, JSON.stringify(this.data));
      } catch (e) {
        this.loadError = `Không đọc hoặc lưu được dữ liệu: ${e.message}`;
        this.data = migrateData(seed(), { fresh: true });
        this.readOnly = true;
      }
    }
    get user() {
      return this.data.staff.find((s) => s.id === this.userId && s.active);
    }
    commit(action, detail, fn) {
      assert(
        !this.readOnly,
        'Dữ liệu đang ở chế độ chỉ đọc vì bộ nhớ gặp lỗi. Hãy sao lưu và kiểm tra bộ nhớ trình duyệt.',
      );
      // Các bước tạo lô bên trong duyệt phiếu phải cùng một lần lưu nguyên khối.
      if (this.inTransaction) return fn();
      const raw = this.storage.getItem(KEY);
      assert(
        !raw || JSON.parse(raw).revision === this.data.revision,
        'Dữ liệu đã thay đổi ở tab khác. Vui lòng tải lại trang trước khi tiếp tục.',
      );
      const before = clone(this.data);
      try {
        this.inTransaction = true;
        const result = fn();
        this.data.logs.unshift({
          id: id('LOG'),
          time: now(),
          actor: this.user?.name || 'Hệ thống',
          action,
          detail,
        });
        this.data.logs = this.data.logs.slice(0, 1500);
        this.data.revision++;
        this.storage.setItem(KEY, JSON.stringify(this.data));
        return result;
      } catch (e) {
        this.data = before;
        throw e;
      } finally {
        this.inTransaction = false;
      }
    }
  }
  const groups = [
    'auth',
    'lots',
    'discounts',
    'promotionCombinations',
    'sales',
    'inventory',
    'reconciliation',
    'catalog',
    'supplierMatching',
    'purchases',
    'settings',
  ];
  for (const name of groups)
    Object.assign(
      Store.prototype,
      typeof module !== 'undefined' && module.exports
        ? require(
            './' +
              ({
                promotionCombinations: 'promotion-combinations',
                supplierMatching: 'supplier-matching',
              }[name] || name) +
              '.js',
          )
        : scope.Retail.storeModules[name],
    );
  if (typeof module !== 'undefined' && module.exports) module.exports = { ...api, Store };
  else scope.Retail.Store = Store;
})(globalThis);
