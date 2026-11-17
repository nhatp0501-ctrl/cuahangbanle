(function (scope) {
  'use strict';
  const { KEY, ROLES, METHODS, ACCESS, clone, now, id, assert, integer } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  const { validateBackup } =
    typeof module !== 'undefined' && module.exports ? require('./backup.js') : scope.Retail;
  const methods = {
    saveSettings(values) {
      this.admin();
      assert(values.name?.trim() && values.address?.trim(), 'Nhập tên và địa chỉ cửa hàng.');
      integer(values.taxRate, 'Thuế suất', 0, 100);
      this.commit('Lưu cấu hình cửa hàng', values.name, () =>
        Object.assign(this.data.settings, values),
      );
    },
    createBranch(v) {
      this.admin();
      assert(
        v.name?.trim() && v.address?.trim() && v.area?.trim(),
        'Điền đầy đủ tên, địa chỉ và vùng phục vụ.',
      );
      const suppliers = this.data.suppliers.filter(
        (s) =>
          s.active &&
          s.areas.toLocaleLowerCase('vi').includes(v.area.trim().toLocaleLowerCase('vi')),
      );
      assert(
        suppliers.length,
        'Chưa có nhà cung cấp phục vụ vùng này. Cập nhật vùng phục vụ của đối tác trước khi đề xuất.',
      );
      return this.commit('Đề xuất chi nhánh', v.name, () => {
        const b = {
          ...v,
          id: id('CN'),
          supplierIds: suppliers.map((s) => s.id),
          status: 'proposed',
          time: now(),
        };
        this.data.branches.push(b);
        return b;
      });
    },
    importBackup(value) {
      this.admin();
      validateBackup(value);
      const copy =
        typeof module !== 'undefined' && module.exports
          ? require('./migrations.js').migrateData(value)
          : scope.Retail.migrateData(value);
      validateBackup(copy);
      return this.commit('Khôi phục dữ liệu', 'Nhập tệp sao lưu', () => {
        const username = this.user.username;
        copy.revision = this.data.revision;
        this.data = copy;
        this.userId =
          this.data.staff.find((s) => s.username === username && s.active && s.role === 'ADMIN')
            ?.id || null;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules || (scope.Retail.storeModules = {})).settings = methods;
})(globalThis);
