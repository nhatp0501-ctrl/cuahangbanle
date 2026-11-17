# Quy trình vận hành RetailFlow v2

Tài liệu mô tả quy trình đã triển khai trong bản chạy cục bộ. Các bước trao đổi với nhà cung cấp, kiểm tra bao bì và giao nhận tiền được nhân viên xác nhận từ chứng từ thực tế; ứng dụng không tự thay nhà cung cấp hoặc ngân hàng xác nhận.

## 1. Hàng tiêu dùng và hạn sử dụng

- Danh mục có 186 SKU với ảnh bao bì thật lưu local. Tên/dung tích theo nguồn ảnh; giá, tồn và lô khởi tạo là dữ liệu minh họa. Mã nội bộ `RF…` không phải mã EAN do nhà sản xuất công bố.
- Mỗi mặt hàng có nhiều lô: mã lô, HSD, tồn vật lý, số hỏng/cách ly và nguồn nhập. Tồn mặt hàng bằng tổng tồn các lô.
- Số bán được loại trừ hàng hết hạn, hàng cách ly và lô thực phẩm chưa xác minh HSD. Không được lấy toàn bộ tồn vật lý làm số có thể bán.
- POS xuất lô hết hạn sớm trước (FEFO). Lô bằng HSD hôm nay vẫn còn hạn theo quy ước ngày; sang ngày tiếp theo bị chặn. Với giấy/đồ dùng không quản lý HSD, hệ thống không bắt nhập HSD.
- Hàng cận date là lô còn hạn trong 30 ngày tới. Admin vào **Voucher & khuyến mãi → Hàng cận date**, chọn đúng lô để đưa vào chương trình.
- Đối với dữ liệu phiên bản cũ chưa từng có HSD, hệ thống giữ nguyên số lượng và đánh dấu lô cần xác minh; không tự đoán HSD thật. Admin cập nhật từ nhãn/biên bản tại **Kho → Lô & hạn sử dụng**. Mỗi lần sửa có lịch sử trước/sau, lý do và người thực hiện.

## 2. Bán hàng và thanh toán đủ một lần

1. Thu ngân tìm/quét mã hoặc chọn thẻ hàng. Chọn số lượng trong hộp thoại; có các mức nhanh và ô nhập trực tiếp.
2. Chọn khách bằng số điện thoại hoặc để khách lẻ. Kiểm tra giỏ, số lượng và ghi chú.
3. Chọn **một** hình thức ưu đãi: voucher hoặc chương trình khuyến mãi. Không nhập số giảm tùy ý, không cộng dồn hai loại.
4. Kiểm tra tạm tính, phần giảm, thuế và tổng phải thanh toán.
5. Chọn **một** phương thức: tiền mặt / chuyển khoản / thẻ. Khách phải thanh toán đủ toàn bộ hóa đơn một lần, không trả một phần, không chia phương thức và không ghi nợ.
6. Tiền mặt: nhập tiền khách đưa, kiểm tra tiền thừa. Chuyển khoản/thẻ: đối chiếu đã nhận đủ và nhập mã giao dịch trên chứng từ.
7. Xác nhận: tạo hóa đơn đã thanh toán, trừ lô FEFO, ghi nhận lượt voucher và xóa giỏ trong một giao dịch lưu trữ. Mã xác nhận chống ghi nhận hai lần cùng giỏ.
8. Lưu/in hóa đơn. Hóa đơn giữ ảnh chụp tên/giá, phần giảm và lô đã xuất tại thời điểm giao dịch.

Đơn tạm chưa thanh toán và không giữ chỗ số lượng. Khi mở lại phải kiểm tra giá, tồn, HSD và hiệu lực ưu đãi tại thời điểm thanh toán.

## 3. Hai loại voucher và chương trình khuyến mãi

| Loại                    | Phạm vi giảm                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Voucher cửa hàng        | Toàn bộ hàng trong giỏ.                                                                                                                   |
| Voucher đối tác         | Chỉ các sản phẩm liên kết với nhà cung cấp/đối tác được thiết lập trong voucher. Hàng của đối tác khác không được giảm.                   |
| Chương trình khuyến mãi | Danh sách sản phẩm; có thể giới hạn đúng các lô cận date đã chọn. Lô khác của cùng sản phẩm không được giảm nếu không thuộc chương trình. |

Admin quản lý mã, mức giảm cố định/phần trăm, giá trị tối thiểu, trần tiền giảm, khoảng ngày, số lượt và trạng thái. Ngưỡng tối thiểu phải được đáp ứng bởi phần hàng thuộc phạm vi áp dụng; không dùng hàng đối tác khác để đạt điều kiện voucher đối tác. Hệ thống kiểm tra lại trước khi thu tiền, không chỉ tại lúc chọn mã.

Tiền giảm được phân bổ vào đúng dòng được áp dụng. Thuế và tiền thực trả theo dòng được lưu để các lần hoàn trả cộng lại khớp hóa đơn, kể cả làm tròn.

## 4. Trả hàng tách khỏi danh sách đơn bán

1. Nhân viên mở **Đổi trả & hoàn tiền**, nhập mã hóa đơn gốc và tra cứu.
2. Chọn mặt hàng/số lượng còn được trả, nhập lý do và xác định điều kiện nhập lại. Gửi yêu cầu, chưa hoàn tiền, chưa cộng kho.
3. Yêu cầu chờ duyệt giữ chỗ số lượng trả để không tạo trùng nhiều yêu cầu.
4. Admin xem chứng từ, kiểm hàng, thực hiện/kiểm tra hoàn tiền ngoài ứng dụng rồi phê duyệt hoặc từ chối trong hệ thống.
5. Khi duyệt, ghi tiền hoàn thực tế, người xử lý và số lượng đã trả. Hàng được nhập lại đúng lô; hàng hết hạn/chưa rõ lô phải giữ cách ly, không tự trở thành hàng bán được.

**Nhân viên không được tự duyệt.** Phạm vi trả một phần/toàn bộ, lịch sử yêu cầu và tiền hoàn chỉ hiển thị tại phân hệ Trả hàng. Đơn hàng và hóa đơn bán vẫn có trạng thái đã thanh toán đủ, giữ nguyên nội dung giao dịch gốc. Báo cáo doanh thu tổng hợp tiền hoàn từ các phiếu trả đã duyệt.

## 5. Kho đề nghị nhập → admin duyệt → đối chiếu thực nhận

### 5.1. Đặt hàng

1. Kho xem tồn bán được, hàng cận date và các lượng đã đề nghị/chờ giao; chọn hàng cần bổ sung.
2. Lập yêu cầu nhiều dòng theo **một nhà cung cấp**, nhập lượng đề nghị, giá dự kiến và căn cứ. Lưu nháp hoặc gửi admin.
3. Admin duyệt nhu cầu trước khi cửa hàng đặt/trao đổi với NCC. Từ chối cần ghi rõ lý do. Kho không có nút duyệt.
4. Yêu cầu đã duyệt là cơ sở để đối chiếu giao hàng; chưa làm tăng tồn.

### 5.2. Nhận hàng tại khu vực chờ kiểm nhận

1. Kho ghi số phiếu giao hàng của NCC và đếm riêng từng mã hàng.
2. Khai **số thực giao lần này**, số không đạt/trả NCC, mã lô và HSD của phần đạt. Không mặc định thực nhận bằng số đặt.
3. Số đạt đề nghị nhập = thực giao − không đạt. Phần thiếu sau lần nhận = số đặt − số đạt đã nhập trước − số đạt lần này.
4. Có thiếu hoặc hàng không đạt phải giải trình; ví dụ giao thiếu, móp/vỡ, sai bao bì. Số vượt lượng đặt còn lại bị chặn; cần xử lý lại nhu cầu với admin thay vì tự tăng số đặt.
5. Gửi biên bản thực nhận lên admin. Kho chưa được cộng tồn; yêu cầu chuyển sang chờ đối chiếu, tránh tạo hai biên bản chờ cho một đơn.
6. Admin đối chiếu chứng từ, chất lượng và HSD; **duyệt số đạt** mới tạo lô và cộng đúng số đạt. Có thể trả biên bản về để kho khai lại, không phát sinh tồn nếu bị từ chối.

### 5.3. Theo dõi giao thiếu / giao bù

Ví dụ đặt 10: NCC giao 8 nhưng 2 không đạt → số đạt 6, số còn thiếu 4. Admin duyệt nhập 6; đơn giữ trạng thái nhận thiếu. Lần sau NCC giao thêm 4 đạt, kho lập biên bản thứ hai; admin duyệt thì cộng thêm 4, tổng đạt 10 và đóng trạng thái nhận đủ.

| Trạng thái          | Người xử lý tiếp                                 | Tác động tồn                                  |
| ------------------- | ------------------------------------------------ | --------------------------------------------- |
| Nháp                | Kho hoàn thiện, gửi yêu cầu                      | Không                                         |
| Chờ admin duyệt     | Admin duyệt/từ chối                              | Không                                         |
| Đã duyệt yêu cầu    | Cửa hàng đặt NCC; kho nhận/đếm                   | Không                                         |
| Chờ duyệt thực nhận | Admin đối chiếu                                  | Không                                         |
| Nhận thiếu          | Kho theo dõi NCC giao bù                         | Chỉ phần đạt đã duyệt                         |
| Nhận đủ             | Hoàn tất                                         | Tổng phần đạt theo các lần duyệt              |
| Chốt thiếu          | Admin xác nhận NCC không giao thêm, ghi kết luận | Giữ đúng phần đã nhận; không cộng lượng thiếu |

Mỗi lần giao có biên bản riêng và có thể xem lại. Không sửa biên bản đã duyệt để giả lập nhận đủ. Admin không được duyệt cùng biên bản hai lần.

## 6. Kiểm kê thực tế và hướng xử lý

### 6.1. Chuẩn bị phạm vi

Chọn khu vực/mặt hàng có thể đếm xong trong ca (giao diện giới hạn 30 mã/phiên). Hoàn thiện chứng từ xuất/nhập đang dở trước khi mở phiên. Khi bắt đầu, hệ thống chụp tồn theo lô và **tạm khóa xuất/nhập các mặt hàng thuộc phạm vi**; hàng ngoài phạm vi vẫn giao dịch.

### 6.2. Đếm và đối chiếu

1. Kho đếm độc lập theo nhãn lô. Sổ tồn được ẩn ở bước đầu để hạn chế chép số sổ.
2. Ghi tổng số vật lý và phần hỏng/cách ly nằm trong tổng đó. Hàng hết hạn vẫn là hàng vật lý, nhưng bị chặn bán theo HSD.
3. Lưu tiến độ. Khi đếm đủ, hệ thống cho xem sổ và chênh lệch.
4. Kiểm tra lại dòng lệch và ghi giải trình cụ thể trước khi gửi admin. Không tự sửa sổ cho khớp số đếm.

### 6.3. Quyết định thực tế của admin

| Tình huống                             | Hướng xử lý                                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Số đếm thiếu/thừa, chưa rõ nguyên nhân | Yêu cầu đếm lại; đối chiếu đúng lô, phiếu giao, bán hàng và chứng từ. Không duyệt chỉ vì đã có một số đếm.                                         |
| Phát hiện chứng từ nhập/xuất còn thiếu | Hủy/từ chối phiên để mở khóa, hoàn thiện chứng từ hợp lệ rồi mở lại kiểm kê. Không vừa cộng theo nhập hàng vừa bù thừa qua kiểm kê cho cùng lượng. |
| Vỡ/hỏng đã xác minh                    | Ghi biên bản và kết luận. Phần còn trong kho được cách ly; phần đã xử lý ra khỏi kho được phản ánh bằng số vật lý thực tế và lý do.                |
| Chênh lệch vật lý xác minh được        | Admin phê duyệt điều chỉnh theo số đếm, ghi cách xử lý thiếu/thừa; hệ thống lưu giá vốn, giá trị thiếu dự kiến, người duyệt và chứng từ.           |
| Hết hạn                                | Cách ly, không bán; xử lý theo biên bản thực tế. Nếu đã đưa ra khỏi kho/hủy, lần đếm và kết luận điều chỉnh phải khớp số còn thực sự trong kho.    |
| Không đủ căn cứ                        | Từ chối, không thay tồn; giữ lại phiếu và nhận xét.                                                                                                |

Chỉ admin được duyệt điều chỉnh. Khi duyệt, hệ thống kiểm tra mốc tồn còn khớp, cập nhật lô và hàng cách ly một lần, ghi biến động và mở khóa. Yêu cầu đếm lại xóa số đếm cũ để thực hiện lại độc lập; hủy/từ chối mở khóa mà không điều chỉnh tồn. Việc hạch toán tổn thất, xử lý trách nhiệm hoặc bồi thường là nghiệp vụ ngoài phạm vi kế toán của bản giao diện này; không tự trừ lương nhân viên.

## 7. Lưu trữ và giới hạn tích hợp

Bản hiện tại vẫn dùng localStorage và tài khoản thử. Quy trình phân vai chạy trong ứng dụng, chưa có tài khoản NCC, API ngân hàng, database dùng chung hoặc chữ ký chứng từ. “Admin duyệt” là thao tác thật trong luồng ứng dụng, nhưng chưa phải cơ chế bảo mật máy chủ. Cùng thiết bị có thể đăng xuất/đăng nhập để thử lần lượt các vai trò.

Khi nâng cấp dữ liệu cũ, ứng dụng giữ bản sao trước v2 tại `retailflow.v1.before-v2`. Hóa đơn cũ và số lượng tồn không bị xóa; lô cũ thiếu HSD cần xác minh. Nên tải bản sao lưu JSON từ Cấu hình trước khi vận hành hoặc đổi trình duyệt.

Báo cáo PDF/Word trong `bao-cao/` được lập cho bản giao diện trước thay đổi nghiệp vụ này; tài liệu hiện tại mô tả v2, chưa thay thế bằng một bản PDF mới.
