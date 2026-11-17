# RetailFlow — Quản lý cửa hàng bán lẻ

Bản v2 tập trung vào nghiệp vụ hàng tiêu dùng: bán theo lô/HSD, voucher đúng phạm vi, kho lập yêu cầu cho admin duyệt, đối chiếu giao thiếu và kiểm kê có kiểm soát.

## Chạy thử

Nhấp đúp `start.cmd`, hoặc chạy:

```sh
node server.js
```

Mở **http://127.0.0.1:4173**. Cần Node.js; không cần cài thư viện để chạy ứng dụng. Nếu đang chạy bản cũ, dừng server bằng Ctrl+C rồi chạy lại và tải trang bằng Ctrl+F5 để server phục vụ cả ảnh JPEG.

| Tài khoản | Mật khẩu | Vai trò                                                       |
| --------- | -------- | ------------------------------------------------------------- |
| admin     | 123456   | Quản trị, kiểm duyệt yêu cầu, thực nhận, kiểm kê và hoàn tiền |
| nhanvien  | 123456   | Bán hàng, khách hàng, xem hóa đơn và gửi yêu cầu trả hàng     |
| kho       | 123456   | Xem hàng/lô, lập yêu cầu nhập, ghi thực nhận và kiểm đếm      |

Để thử luồng nhiều vai trò trên cùng máy, đăng xuất rồi đăng nhập tài khoản tiếp theo. Dùng cùng trình duyệt, địa chỉ và cổng để cùng nguồn dữ liệu.

## Thay đổi nghiệp vụ chính

- **186 SKU, 186 ảnh bao bì thật**, 10 nhóm hàng; ảnh lưu local. Tên/dung tích theo ảnh, có nguồn trong `assets/products/sources.json`. Giá, tồn và hạn dùng khởi tạo là dữ liệu mẫu. Mã nội bộ RF không phải EAN nhà sản xuất.
- **Chọn số lượng trước khi thêm hàng** bằng hộp thoại, mức nhanh hoặc nhập số; sửa trực tiếp số lượng tại giỏ. Có tìm/quét mã, danh mục và phân trang 24 mặt hàng.
- **Voucher cửa hàng** áp dụng chung; **voucher đối tác** chỉ giảm các sản phẩm của đối tác đã chọn. Hóa đơn chọn một voucher hoặc một chương trình KM, không giảm tùy ý hoặc cộng dồn.
- **Khuyến mãi theo sản phẩm/lô cận date**: xem lô còn hạn, chọn lô đưa vào chương trình và đặt thời gian/mức giảm. Chỉ phần thuộc phạm vi được giảm.
- **Thanh toán đủ một lần bằng một phương thức**: tiền mặt, chuyển khoản hoặc thẻ. Không ghi nợ, trả một phần hay chia phương thức; có chống ghi nhận lặp cùng giỏ.
- **HSD theo từng lô**: bán FEFO; hàng hết hạn, chưa rõ HSD hoặc cách ly không bán được. Xem riêng tồn vật lý và số bán được.
- **Đơn hàng chỉ hiển thị giao dịch đã thanh toán.** Thông tin trả một phần/toàn bộ và tiền hoàn chỉ nằm ở Trả hàng. Nhân viên gửi yêu cầu, admin mới phê duyệt.
- **Nhập hàng theo đề nghị và duyệt**: kho gửi yêu cầu → admin duyệt đặt → kho ghi từng lần thực giao/không đạt/lô/HSD → admin đối chiếu số đạt để nhập kho.
- **Giao thiếu được theo dõi tích lũy**: số đặt, số đạt đã nhập, số không đạt, phần thiếu và biên bản từng lần. NCC giao bù thì ghi thêm lần nhận; admin có thể chốt thiếu có lý do, không tạo tồn giả.
- **Kiểm kê thực tế**: chọn phạm vi, khóa xuất/nhập, đếm độc lập theo lô, lưu số đếm để đối chiếu, giải trình rồi gửi admin. Admin duyệt điều chỉnh, yêu cầu đếm lại hoặc từ chối/hủy; kho không tự ghi đè tồn.
- Nút bấm có nhãn tác vụ, trạng thái chọn/khóa rõ ràng, xác nhận khi ảnh hưởng số liệu và chống gửi biểu mẫu lặp. Thông báo được giới hạn để không che giao diện.

Các chức năng cũ vẫn có: tìm khách theo số điện thoại, lưu tối đa 5 đơn tạm, hóa đơn HTML/in/PDF, lịch sử và CSV, danh mục, nhân sự, báo cáo doanh thu, cấu hình, sao lưu/khôi phục và đề xuất chi nhánh.

Xem quy trình cụ thể, trường hợp xử lý và ví dụ tại **[docs/QUY-TRINH-NGHIEP-VU.md](docs/QUY-TRINH-NGHIEP-VU.md)**.

## Dữ liệu khi nâng cấp

Dữ liệu chính giữ tại `localStorage` khóa `retailflow.v1`; cấu trúc đã nâng lên schema 2. Bản trước nâng cấp được giữ ở `retailflow.v1.before-v2`. Không xóa hóa đơn hoặc tồn cũ để tạo lại dữ liệu.

Vì phiên bản cũ không có HSD, các lô cũ thiếu thông tin được đánh dấu **chưa xác minh HSD** và không cho bán cho đến khi admin cập nhật từ nhãn thực tế trong Kho → Lô & hạn sử dụng. Danh mục mẫu mới có lô và HSD mẫu để thử ngay. Một số hàng pha chế/Photobooth mẫu cũ chuyển ngừng bán; lịch sử vẫn giữ. Giảm giá số tiền tự do trong giỏ cũ cần chọn lại theo voucher/chương trình trước khi thanh toán.

Vào **Cấu hình → Tải bản sao lưu JSON** để lưu định kỳ. Khôi phục kiểm tra các chứng từ, ưu đãi và cân bằng tồn theo lô trước khi thay dữ liệu. `localhost` và `127.0.0.1` có bộ nhớ riêng. Đăng xuất không xóa dữ liệu.

## Cấu trúc

```text
src/data/product-catalog.js       Danh mục thật và nguồn ảnh
src/domain/                      Quy tắc nghiệp vụ dùng chung với kiểm thử
  migrations.js                  Chuyển dữ liệu cũ, bổ sung danh mục/lô
  lots.js                        FEFO, HSD, số bán được và dấu vết lô
  discounts.js                   Voucher, phạm vi đối tác và KM theo lô
  sales.js                       Giỏ, đơn tạm, thanh toán đủ một lần
  purchases.js                   Yêu cầu, duyệt và biên bản thực nhận
  inventory.js                   Phiên kiểm đếm và duyệt chênh lệch
src/features/                    Giao diện chia theo chức năng
  pos.js, discount-picker.js, promotions.js
  purchases.js, purchase-receipts.js
  inventory.js, lots.js, stock-counts.js
src/events/                      Hành động, ô nhập, biểu mẫu theo nghiệp vụ
assets/products/                 Ảnh local và nguồn
assets/css/retail-v2.css          Thành phần UI bổ sung
docs/                            Quy trình và hướng xử lý thực tế
tests/                           Kiểm thử nghiệp vụ và trình duyệt
scripts/verify-assets.cjs         Kiểm tra ảnh, trùng SKU và nguồn
```

Ứng dụng dùng script `defer` theo thứ tự trong `index.html`; không cần build. `app.js` khởi động, `store.js` là điểm vào Node cho kiểm thử. Prettier chỉ là công cụ phát triển.

## Kiểm tra

```sh
npm test
npm run test:browser
npm run verify:assets
```

- 22 kiểm thử nghiệp vụ: nâng cấp dữ liệu, thanh toán, FEFO, voucher cửa hàng/đối tác, chương trình lô, hoàn tiền, yêu cầu nhập/thực nhận, kiểm kê và lỗi lưu trữ.
- Kiểm thử Edge: chọn số lượng và ảnh thật, giảm giá, ba thanh toán đủ, tách trả hàng, kho/admin duyệt nhiều bước, nhận thiếu/giao bù và kiểm kê. Dùng hồ sơ mẫu riêng, không chạm dữ liệu trình duyệt người dùng.
- Kiểm tra tài nguyên: 186 tên/ảnh độc lập, file JPEG/PNG hợp lệ và có URL nguồn. Ảnh kiểm thử nằm ở `preview/`.

## Phạm vi tích hợp

Đây vẫn là frontend cục bộ với tài khoản mẫu và localStorage, chưa có xác thực/database máy chủ hoặc đồng bộ nhiều thiết bị. Thông tin giao hàng được ghi từ phiếu NCC; chưa có cổng đăng nhập NCC. Chuyển khoản/thẻ/hoàn tiền xác nhận thủ công, chưa gọi ngân hàng. Hóa đơn là phiếu bán nội bộ; chi nhánh ở mức đề xuất. Giá/tồn/HSD mẫu không dùng làm dữ liệu kinh doanh thật.

Báo cáo PDF/Word đã lập trong `bao-cao/` thuộc bản thiết kế trước v2, được giữ cục bộ. Tài liệu nghiệp vụ trong `docs/` mô tả bản hiện tại.
