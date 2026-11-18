# RetailFlow — Cửa hàng bán lẻ

Bản v3: bán hàng tiêu dùng theo lô/HSD, khuyến mãi tự động, nhiều nhà cung cấp, kho lập yêu cầu để admin duyệt, xử lý thực nhận thiếu/dư và kiểm kê có đối chiếu hóa đơn, đếm lại, trừ hao hụt cuối tháng.

## Chạy thử

Nhấp đúp `start.cmd` hoặc mở terminal tại thư mục dự án:

```sh
node server.js
```

Mở **http://127.0.0.1:4173**. Cần Node.js, không cần cài thư viện để chạy ứng dụng. Nếu đang chạy bản cũ, dừng bằng Ctrl+C, chạy lại và nhấn Ctrl+F5 trên trang.

| Tài khoản | Mật khẩu | Quyền chính                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| admin     | 123456   | Quản trị, ưu đãi, duyệt yêu cầu/thực nhận/kiểm kê và báo cáo |
| nhanvien  | 123456   | Bán hàng, khách hàng và hóa đơn                              |
| kho       | 123456   | Xem hàng/lô, lập yêu cầu nhập, báo thực nhận và kiểm đếm     |

Đăng xuất rồi đăng nhập vai trò tiếp theo để thử quy trình nhiều bước. Dùng cùng trình duyệt và địa chỉ/cổng để cùng dữ liệu.

## Chức năng hiện tại

- **186 sản phẩm, 186 ảnh bao bì thật**, 10 nhóm hàng. Ảnh local, nguồn tại `assets/products/sources.json`; giá/tồn/HSD khởi tạo là mẫu. Mã RF là mã nội bộ.
- **Chọn số lượng** trước khi thêm và sửa tại giỏ, tìm/quét mã, lọc danh mục, phân trang 24 sản phẩm. Tìm khách theo số điện thoại với gợi ý thu hẹp khi nhập.
- **Giảm giá từ 1.000đ**: voucher cửa hàng áp chung; voucher đối tác chỉ hàng của đối tác. Cố định, phần trăm hoặc chương trình mua đủ số lượng, ví dụ mua 2 giảm 5.000đ, mua 4 giảm 10.000đ theo nhóm cùng SKU. Không cộng dồn voucher/chương trình.
- **Khuyến mãi tự động**: hiện gợi ý ngay dưới sản phẩm; mặc định chọn một chương trình đủ điều kiện có mức giảm tốt nhất, tính lại khi thay số lượng. Có thể chọn thủ công, dùng voucher hoặc tắt giảm giá.
- **Lô/HSD và FEFO**: không bán hàng hết hạn, chưa xác minh HSD hoặc cách ly. Chỉ phần xuất từ lô được chọn mới nhận khuyến mãi cận date.
- **Thanh toán đủ một lần** bằng tiền mặt, chuyển khoản hoặc thẻ. Không ghi nợ/chia tiền. Mã giao dịch ngẫu nhiên `HDxxxxx` tự sinh, không phải nhập. Lưu hóa đơn HTML/in/PDF, chống thanh toán lặp cùng giỏ, tối đa 5 đơn tạm.
- **Bỏ chức năng trả hàng** khỏi menu, quyền, màn hình, nút và xử lý nghiệp vụ. Chứng từ cũ chỉ giữ phục vụ số liệu lịch sử, không có thao tác trả hàng mới.
- **22 hồ sơ NCC**, gồm 19 nhà phân phối mẫu mới theo nhóm thương hiệu. Chi tiết mỗi NCC có danh mục riêng, tìm kiếm, giá/tồn, lập yêu cầu và lịch sử. Không chọn hàng NCC khác vào phiếu nhập.
- **Kho đề nghị → admin duyệt → kho báo thực nhận → admin chốt**. Có gợi ý hàng sắp hết. Theo dõi đặt, giao thực tế, không đạt, nhập đạt, thiếu/dư và từng lần giao bù.
- **Giao dư** được ghi đủ, báo ngay. Admin bắt buộc chọn nhận bổ sung hoặc giao lại phần dư cho NCC; chỉ số duyệt mới tăng tồn, giá trị thực nhập theo lượng nhập thực tế.
- **Kiểm kê** khóa xuất/nhập trong phạm vi, cảnh báo lệch, lưu số đếm, tra hóa đơn đúng sản phẩm, ghi kết quả đối chiếu và chốt số đếm lại trước khi gửi admin. Admin duyệt mới chỉnh tồn.
- **Đối soát cuối tháng**: khoản thiếu đã duyệt × giá bán chụp lúc mở kiểm kê được trừ khỏi thu quản trị sau hao hụt; có bảng chi tiết và CSV. Hóa đơn gốc giữ nguyên, hàng dư không tự tạo doanh thu hoặc bù thiếu.
- Nút tác vụ có màu và trạng thái chọn/khóa rõ ràng, bàn phím có viền focus. Có nhân sự, báo cáo, cấu hình, sao lưu/khôi phục và đề xuất chi nhánh.

Hướng dẫn quy trình và các trường hợp thiếu/dư: **[docs/QUY-TRINH-NGHIEP-VU.md](docs/QUY-TRINH-NGHIEP-VU.md)**.

## Dữ liệu khi nâng cấp

Khóa localStorage vẫn là `retailflow.v1`, cấu trúc schema 3. Giữ bản gốc trước nâng cấp tại `.before-v2` hoặc `.before-v3` tương ứng phiên bản nguồn. Không xóa hóa đơn/tồn cũ. Ưu đãi số tiền dưới 1.000đ tạm dừng để admin sửa. Giữ liên kết NCC cho voucher đối tác đã có; chứng từ nhập cũ giữ NCC gốc.

Lô cũ không có HSD bị chặn bán đến khi admin xác minh tại Kho → Lô & hạn sử dụng. Phiếu kiểm kê đang chờ và còn lệch cần hoàn tất đối chiếu/đếm lại theo quy trình mới. Tải sao lưu JSON trong Cấu hình; khôi phục kiểm tra cân bằng tồn theo lô. `localhost` và `127.0.0.1` có bộ nhớ riêng; đăng xuất không xóa dữ liệu.

## Cấu trúc file

```text
src/data/                         Danh mục sản phẩm và nhà cung cấp
src/domain/                       Quy tắc nghiệp vụ dùng chung với kiểm thử
  migrations.js                   Chuyển dữ liệu, bổ sung danh mục/lô
  operational-migrations.js        Nâng cấp NCC, ưu đãi và quy trình v3
  lots.js                         FEFO, HSD, số bán được
  discounts.js                    Voucher, phạm vi, mua đủ số lượng, chọn KM tự động
  sales.js                        Giỏ, đơn tạm, thanh toán, mã HD tự sinh
  purchases.js                    Yêu cầu, duyệt, thiếu/dư và thực nhận
  inventory.js                    Kiểm đếm và duyệt điều chỉnh
  reconciliation.js               Đối chiếu hóa đơn, chốt đếm lại, tổng hợp tháng
src/features/                     Giao diện chia theo chủ đề
  promotion-hints.js              Gợi ý ưu đãi dưới sản phẩm
  supplier-catalog.js             Danh mục riêng của NCC
  audit-reconciliation.js         Đối chiếu hóa đơn và chốt số đếm lại
  month-end-report.js             Bảng/CSV đối soát tháng
src/events/                       Sự kiện và biểu mẫu theo nghiệp vụ
assets/css/                       CSS chia theo chức năng
assets/products/                  Ảnh local và nguồn
docs/                             Quy trình chi tiết
tests/                            Kiểm thử nghiệp vụ và Edge
```

Ứng dụng vanilla HTML/JS/CSS, script defer theo thứ tự trong `index.html`, không cần build. `app.js` khởi động; `store.js` là điểm vào Node để kiểm thử.

## Kiểm tra

```sh
npm test
npm run test:browser
npm run verify:assets
```

32 kiểm thử nghiệp vụ, kiểm thử Edge xuyên suốt ba vai trò và kiểm tra tài nguyên ảnh. Bao gồm mức giảm tối thiểu, nhóm cùng SKU/đúng lô, voucher đối tác, thanh toán/mã tự sinh, nhận thiếu/giao dư, đối chiếu/đếm lại, khoản trừ tháng, nâng cấp và lưu nhiều dòng nhập nguyên khối khi có lỗi. Kiểm thử trình duyệt dùng hồ sơ riêng, ảnh kết quả tại `preview/`.

## Phạm vi tích hợp

Đây là frontend cục bộ với tài khoản mẫu và localStorage; chưa có xác thực/database máy chủ hoặc đồng bộ nhiều thiết bị. NCC và thông tin liên hệ mới là dữ liệu mẫu; việc đặt/giao hàng đối chiếu thủ công, chưa có cổng NCC. Thanh toán xác nhận thủ công, chưa gọi ngân hàng; mã HD là mã nội bộ. Hóa đơn là phiếu bán nội bộ. Thu sau hao hụt là chỉ tiêu quản trị, chưa phải lợi nhuận kế toán.

PDF/Word trong `bao-cao/` thuộc bản thiết kế trước v2 và được giữ cục bộ; tài liệu trong `docs/` mô tả bản hiện tại.
