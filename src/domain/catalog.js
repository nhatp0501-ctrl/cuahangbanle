(function (scope) {
  'use strict';
  const { KEY, ROLES, METHODS, ACCESS, clone, now, id, assert, integer } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  const { validateBackup } =
    typeof module !== 'undefined' && module.exports ? require('./backup.js') : scope.Retail;
  const methods = {
    upsert(type, values) {
      const permission = {
        products: 'products',
        suppliers: 'suppliers',
        customers: 'customers',
        staff: 'staff',
      }[type];
      assert(permission, 'Danh mục không hợp lệ.');
      this.require(permission);
      if (type === 'products') this.admin();
      const collection = this.data[type],
        existing = values.id ? collection.find((x) => x.id === values.id) : null;
      assert(!values.id || existing, 'Bản ghi không tồn tại.');
      assert(values.name?.trim(), 'Vui lòng nhập tên.');
      let v = clone(values);
      v.name = v.name.trim();
      if (type === 'products') {
        v.icon ??= '';
        v.image ||= 'assets/product-placeholder.svg';
        v.price = integer(v.price, 'Giá bán');
        v.cost = integer(v.cost, 'Giá vốn');
        v.minStock = integer(v.minStock, 'Ngưỡng cảnh báo');
        v.tracksExpiry = v.tracksExpiry !== false;
        if (!existing && Number(v.stock) > 0 && v.tracksExpiry) {
          const valid =
            typeof module !== 'undefined' && module.exports
              ? require('./config.js').validDate
              : scope.Retail.validDate;
          assert(valid(v.expiryDate), 'Nhập HSD lô tồn đầu kỳ.');
        }
        if (v.image)
          assert(
            /^assets\/(?:products\/[a-zA-Z0-9._-]+|product-placeholder\.svg)$/.test(v.image),
            'Chọn ảnh trong thư mục sản phẩm.',
          );
        assert(v.category?.trim() && v.barcode?.trim(), 'Nhập danh mục và mã vạch.');
        assert(
          !collection.some((p) => p.id !== v.id && p.barcode === v.barcode.trim()),
          'Mã vạch đã tồn tại.',
        );
        const supp = this.data.suppliers.find((s) => s.id === v.supplierId);
        assert(
          supp && (supp.active || existing?.supplierId === supp.id),
          'Nhà cung cấp không hoạt động.',
        );
        v.barcode = v.barcode.trim();
        if (!existing) v.stock = integer(v.stock, 'Tồn đầu kỳ');
        else delete v.stock;
      }
      if (type === 'customers') {
        assert(/^\+?[\d\s().-]{8,18}$/.test(v.phone), 'Số điện thoại không hợp lệ.');
        assert(
          !collection.some(
            (c) => c.id !== v.id && c.phone.replace(/\D/g, '') === v.phone.replace(/\D/g, ''),
          ),
          'Số điện thoại khách hàng đã tồn tại.',
        );
      }
      if (type === 'staff') {
        assert(ROLES[v.role], 'Vai trò không hợp lệ.');
        assert(
          /^[a-zA-Z0-9_.-]{3,40}$/.test(v.username),
          'Tên đăng nhập gồm 3–40 ký tự, không dấu và không có khoảng trắng.',
        );
        assert(
          !collection.some((u) => u.id !== v.id && u.username === v.username),
          'Tên đăng nhập đã tồn tại.',
        );
        if (!existing || v.password)
          assert(v.password?.length >= 6, 'Mật khẩu cần tối thiểu 6 ký tự.');
        else delete v.password;
        assert(
          v.id !== this.userId || (v.active && v.role === 'ADMIN'),
          'Không thể khóa hoặc hạ quyền tài khoản đang sử dụng.',
        );
        assert(
          !(existing?.role === 'ADMIN' && (!v.active || v.role !== 'ADMIN')) ||
            collection.some((s) => s.id !== v.id && s.role === 'ADMIN' && s.active),
          'Cần giữ ít nhất một quản trị viên hoạt động.',
        );
      }
      return this.commit(existing ? 'Cập nhật thông tin' : 'Thêm mới', v.name, () => {
        if (existing) {
          Object.assign(existing, v);
          return existing;
        }
        const prefix = { products: 'SP', suppliers: 'NCC', customers: 'KH', staff: 'NV' }[type];
        const record = { ...v, id: id(prefix), createdAt: now() };
        collection.push(record);
        if (type === 'products' && v.stock) {
          record.stock = 0;
          this.addLot(record.id, {
            qty: v.stock,
            code: v.lotCode || 'TONDAU-' + record.id,
            expiryDate: v.expiryDate || null,
            sourceId: record.id,
          });
        }
        return record;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules || (scope.Retail.storeModules = {})).catalog = methods;
})(globalThis);
