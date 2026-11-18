# Quy trình vận hành RetailFlow v3

Tài liệu mô tả chức năng đã triển khai trong ứng dụng cục bộ. Nhân viên trao đổi với NCC và đối chiếu tiền từ chứng từ thực tế; ứng dụng chưa có cổng NCC hoặc kết nối ngân hàng.

## 1. Danh mục và nhà cung cấp

- 186 mặt hàng tiêu dùng có ảnh bao bì thật lưu local, 10 nhóm hàng. Giá, tồn, lô và hạn dùng khởi tạo là dữ liệu mẫu; mã RF là mã nội bộ.
- Bổ sung 19 nhà phân phối mẫu theo thương hiệu/nhóm hàng, tổng 22 hồ sơ gồm 3 hồ sơ cũ được giữ để bảo toàn lịch sử. Các tên đại lý và thông tin liên hệ là mẫu, cần cập nhật khi sử dụng thật.
- Mỗi sản phẩm gắn một NCC. Chi tiết NCC có danh mục riêng, tìm kiếm, giá nhập/giá bán, số tồn, nút lập yêu cầu và lịch sử nhập. Phiếu nhập chỉ chọn sản phẩm của đúng NCC.
- Danh mục được sửa về đúng thương hiệu: Vinamilk chỉ hàng Vinamilk, Acecook chỉ dòng hàng tương ứng. Không giữ liên kết sai chỉ vì có voucher cũ. Voucher chỉ định hàng được lọc về đúng NCC; nếu không còn hàng phù hợp thì tạm dừng để admin sửa. Hai hồ sơ đại lý trùng được gộp sang hồ sơ chính; chứng từ đã hoàn tất giữ thông tin lịch sử. Chặn hàng sai phạm vi khi sửa sản phẩm hoặc lập phiếu nhập.

## 2. Lô, hạn sử dụng và chọn hàng

- Theo dõi tồn vật lý và tồn bán được theo lô. Bán FEFO, ưu tiên lô còn hạn có HSD sớm nhất.
- Lô hết hạn, chưa xác minh HSD hoặc hàng cách ly không được bán. Hàng hết hạn vẫn phải kiểm đếm vật lý và xử lý cách ly/hủy có căn cứ; không đưa vào khuyến mãi bán hàng.
- Hàng cận date mặc định còn tối đa 30 ngày. Admin chọn lô tại Voucher & khuyến mãi → Hàng cận date để lập chương trình, chỉ giảm đúng phần xuất từ lô đó.
- Nhấp ảnh/thẻ hoặc Chọn số lượng để nhập số trước khi thêm; có nút chọn nhanh và sửa trực tiếp số lượng trong giỏ.

## 3. Giảm giá tối thiểu 1.000đ

| Hình thức             | Phạm vi và cách tính                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| Voucher cửa hàng      | Áp dụng chung toàn bộ hàng trong giỏ                                   |
| Voucher đối tác       | Chỉ hàng thuộc NCC/đối tác được chọn; hàng của NCC khác giữ nguyên     |
| Chương trình sản phẩm | Chỉ sản phẩm thuộc chương trình                                        |
| Chương trình cận date | Chỉ số lượng xuất từ đúng lô còn hạn đã chọn                           |
| Mua đủ số lượng       | Tính theo nhóm đủ số lượng của **từng mã sản phẩm** và đúng phạm vi lô |

Giảm số tiền cố định phải từ 1.000đ. Trần giảm bằng 0 (không đặt trần) hoặc từ 1.000đ. Giảm theo % được cấu hình 1–100%, nhưng **số tiền giảm thực tế của cả ưu đãi phải từ 1.000đ** mới được áp dụng. Nếu tính ra 600đ, không tự làm tròn thành 1.000đ: chế độ tự động bỏ qua, chọn thủ công báo chưa đạt điều kiện.

Ví dụ mua 2 giảm 5.000đ: mua 1 chưa đủ; mua 2 hoặc 3 giảm 5.000đ; mua 4 hoặc 5 giảm 10.000đ, trước giới hạn trần. Một sản phẩm A và một sản phẩm B không gộp thành nhóm 2. Số giảm không vượt giá trị các nhóm được giảm và không giảm vào sản phẩm không đủ nhóm.

### Tự động tại POS

1. Thẻ hàng có gợi ý ngay bên dưới: mua bao nhiêu, giảm bao nhiêu, phạm vi lô, điều kiện đơn tối thiểu/trần giảm và số còn thiếu để đủ nhóm đầu.
2. Chế độ **Tự động KM** áp dụng **nhiều chương trình cho các sản phẩm khác nhau**. Cùng một mã hàng chỉ nhận một chương trình, ưu tiên mức giảm tốt hơn. Tính lại số lượng/phạm vi lô, thời gian, đơn tối thiểu và trần giảm theo nhóm hàng thực áp dụng; không cộng nguyên các báo giá bị chồng lấn.
3. Giỏ và hóa đơn hiển thị riêng tên từng chương trình, hàng áp dụng và khoản giảm; tổng giảm là tổng các chương trình đã áp dụng. Ví dụ A mua 2 giảm 5.000đ, B giảm 3.000đ → cùng hóa đơn giảm 8.000đ. Tab **Chọn nhiều KM** cho đánh dấu nhiều chương trình. Voucher thay thế nhóm chương trình, vẫn đúng phạm vi cửa hàng/đối tác.
4. Đã bỏ nút Không giảm. Nếu chưa có chương trình đủ điều kiện, số giảm là 0 và ứng dụng tự xét lại khi thêm/bớt hàng. Bấm Tự động KM hoặc Về KM tự động để quay lại chế độ tự tính.

## 4. Thanh toán và hóa đơn

Khách trả đủ toàn bộ hóa đơn trong một lần bằng một phương thức: tiền mặt, chuyển khoản hoặc thẻ. Không trả thiếu, ghi nợ, trả góp hoặc chia phương thức.

Tiền mặt nhập tiền khách đưa và tính tiền thừa. Chuyển khoản/thẻ cần đánh dấu xác nhận đã nhận đủ tiền. **Không nhập mã tham chiếu:** lúc thanh toán thành công, hệ thống tự sinh mã ngẫu nhiên dạng `HDxxxxx` (5 chữ số, kiểm tra tránh trùng các giao dịch đã lưu). Đây là mã nội bộ, không giả làm mã xác nhận ngân hàng.

Tạo hóa đơn, trừ lô, ghi lượt voucher và xóa giỏ được lưu nguyên khối; cùng checkoutKey không tạo hóa đơn lần hai. Hóa đơn giữ tên, giá, ưu đãi, thuế và lô tại thời điểm bán. Có lưu HTML/in/PDF từ trình duyệt. Đơn tạm tối đa 5, chưa giữ chỗ tồn; mở lại phải kiểm tra điều kiện hiện tại.

## 5. Bỏ chức năng trả hàng

Đã xóa menu, màn hình, nút, biểu mẫu, quyền và các phương thức tạo/phê duyệt trả hàng. Thu ngân chỉ bán hàng, quản lý khách và tra cứu hóa đơn.

Không xóa chứng từ đã tồn tại trong bộ nhớ/sao lưu cũ. Các khoản đã duyệt trước đây chỉ được giữ như điều chỉnh lịch sử trong tổng hợp số liệu, để việc nâng cấp không làm thay đổi số tiền quá khứ. Không có thao tác tạo mới trả hàng.

## 6. Yêu cầu nhập và nhận hàng thiếu/dư

### Kho lập yêu cầu, admin kiểm duyệt

Kho chọn NCC, các sản phẩm thuộc NCC đó, lượng cần nhập, giá dự kiến, lý do; lưu nháp hoặc gửi admin. Có gợi ý hàng sắp hết, lượng đang đặt và lượng nên bổ sung. Lập yêu cầu chưa cộng tồn.

Admin kiểm tra nhu cầu rồi duyệt/từ chối có ý kiến. Sau khi duyệt, cửa hàng liên hệ NCC. Kho không tự duyệt yêu cầu của mình.

### Thực nhận theo từng lần giao

Kho khai đầy đủ các dòng: số thực giao (cho phép giao dư), số không đạt, mã lô, HSD và giải trình thiếu/dư/không đạt; kèm mã phiếu giao của NCC. Hàng đạt phải còn hạn. Mã phiếu giao NCC là chứng từ bên ngoài, khác mã giao dịch bán hàng tự sinh.

Biên bản ở trạng thái chờ admin, **chưa cộng tồn**. Hiện riêng số đặt, đã nhận trước, thực giao, không đạt, đạt đề nghị, thiếu và dư. Admin duyệt mới tạo lô và cộng số được duyệt. Trả biên bản về sửa không đổi tồn.

### Thiếu hàng

Đặt 10, giao 8, không đạt 2 → đề nghị đạt 6 và thiếu 4. Admin duyệt nhập 6; đơn tiếp tục theo dõi. Lần sau nhận bù 4 đạt thì tổng nhập 10 và hoàn tất. Admin có thể chốt không giao thêm phần thiếu với lý do; không tạo tồn cho phần chưa nhận.

### Giao dư

Đặt 10, giao 13, không đạt 1 → đạt đề nghị 12, dư đạt 2. Hệ thống lưu đủ số giao và báo dư. Kho không tự quyết phần dư. Khi duyệt, admin bắt buộc chọn:

- **Nhận bổ sung:** nhập 12, số nhận vượt số đặt 2; giá trị thực nhập = 12 × đơn giá. Giữ số đặt gốc 10 để truy vết.
- **Giao lại NCC phần dư:** nhập 10, ghi 2 đạt giao lại NCC; số không đạt 1 vẫn theo dõi riêng.

Quyết định áp dụng mọi dòng dư trong biên bản và cần ghi kết luận đối chiếu với NCC. Hệ thống lưu số duyệt nhập, phần giao lại, giá trị thực nhập và giá trị dư; không âm lượng còn thiếu. Không được duyệt lại cùng biên bản.

## 7. Kiểm kê, hóa đơn và đếm lại

### Mở phiên và phát hiện chênh lệch

Chọn phạm vi có thể đếm xong trong ca, tối đa 30 mã trên giao diện. Hoàn thiện chứng từ dở trước khi mở. Hệ thống chụp tồn lô, phần cách ly, giá vốn và giá bán; khóa xuất/nhập các mặt hàng này đến khi kết thúc.

Kho đếm theo đúng lô và đơn vị, nhập tổng vật lý và phần hỏng/cách ly nằm trong tổng đó. Sổ ẩn ở bước đầu để đếm độc lập. Khi nhập lệch, xuất hiện cảnh báo ngay tại dòng. Lưu lần đếm đầu sẽ tạo yêu cầu xử lý chênh lệch và hiện các nút đối chiếu/đếm lại; chưa thay đổi tồn.

Ví dụ sổ 120, đếm 121: cảnh báo dư 1. Sổ 120, đếm 119: cảnh báo thiếu 1. Hàng hỏng/cách ly lệch sổ cũng cần giải trình.

### Kiểm tra hóa đơn và chốt số cuối

1. Bấm **Kiểm tra hóa đơn sản phẩm** ở dòng lệch. Danh sách chỉ hóa đơn đã thanh toán có sản phẩm này, trước mốc khóa kiểm kê: mã, thời gian, khách/thu ngân, số mua và thành tiền. Có lọc mã/ngày.
2. Đối chiếu hàng đã giao, phiếu nhập, đơn vị thùng/lốc/chai và các lô/vị trí khác. Tồn sổ đã trừ các hóa đơn đó; **không trừ số bán lần nữa**.
3. Danh sách chỉ chứa hóa đơn có đúng mã sản phẩm, kể cả hóa đơn nhiều mặt hàng; số lượng/thành tiền hiển thị chỉ là phần của mã đang kiểm kê. Hóa đơn không có mã đó bị loại. Bấm **Xác nhận đã đối chiếu** trực tiếp; ghi chú không bắt buộc. Nếu để trống, hệ thống lưu xác nhận kèm mã sản phẩm và số hóa đơn đã lọc, thời điểm, người kiểm tra, rồi quay về phiếu và mở nút chốt đếm lại.
4. Bấm **Nhập & chốt số đếm lại**. Đếm độc lập lại, nhập số thực tế cuối, phần hỏng/cách ly và kết luận. Lưu lịch sử số cũ/mới, người đếm và thời điểm.
5. Gửi admin. Có chênh lệch mà chưa xác nhận đối chiếu và đếm lại sẽ bị chặn. Nếu sửa số lượng sau khi đã chốt, phải xác nhận đếm lại lại.
6. Admin kiểm tra và duyệt điều chỉnh, yêu cầu đếm lại hoặc từ chối/hủy. Chỉ duyệt mới điều chỉnh từng lô, ghi biến động, xác định tổn thất và mở khóa. Không được duyệt hai lần.

### Gợi ý xử lý đếm dư

| Nguyên nhân có thể                         | Hướng xử lý thực tế                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Đếm trùng hoặc sai đơn vị                  | Đếm lại độc lập; kiểm tra thùng/lốc/chai và nhãn lô                                                                                            |
| Hàng để nhầm kệ/lô                         | Soát vị trí và lô liên quan, không bù thiếu/dư giữa lô tùy ý                                                                                   |
| NCC giao dư chưa ghi nhận                  | Xác minh phiếu giao; kết thúc/hủy phiên để hoàn thiện chứng từ nhập đúng quy trình rồi kiểm lại, tránh cộng cả nhập lẫn kiểm kê cho cùng lượng |
| Hàng chưa giao khách dù hóa đơn đã ghi bán | Kiểm tra chứng từ bàn giao và hàng chờ nhận; xác định quyền sở hữu trước khi tăng tồn                                                          |
| Chưa rõ nguồn gốc/HSD                      | Ghi số vật lý, cách ly phần chưa đủ căn cứ; không cho bán phần cách ly                                                                         |
| Dư thực đã xác minh được nguồn gốc         | Admin ghi căn cứ, duyệt tăng tồn đúng lô; **không ghi hàng dư thành doanh thu bán hàng**                                                       |

## 8. Khoản thiếu trong báo cáo cuối tháng

Vào **Báo cáo doanh thu → Đối soát doanh thu cuối tháng & hao hụt**, chọn tháng và có thể xuất CSV.

Khoản trừ quản trị = **số thiếu vật lý đã duyệt × giá bán chụp tại lúc mở kiểm kê**. Giá vốn thiếu được lưu riêng trên phiếu để có cơ sở đối soát; không lấy giá bán mới nếu sản phẩm đổi giá sau đó.

Chỉ tính phiếu **đã được admin duyệt**, theo tháng duyệt ở múi giờ Việt Nam; nháp, chờ duyệt, từ chối, hủy không được trừ. Không trừ lặp khi mở lại báo cáo. Hàng dư không tự bù khoản thiếu và không tăng doanh thu.

Ví dụ thu hóa đơn tháng 10.000.000đ, thiếu 2 sản phẩm giá bán 30.000đ, đã duyệt → khoản trừ 60.000đ, thu sau hao hụt 9.940.000đ (chưa có điều chỉnh lịch sử). Bảng chi tiết chỉ ra phiếu, hàng/lô, ngày duyệt, số thiếu, đơn giá và khoản trừ.

Hóa đơn đã thanh toán và doanh thu bán hàng gốc vẫn giữ nguyên. “Thu sau hao hụt” là chỉ tiêu đối soát nội bộ, chưa phải lợi nhuận kế toán; không tự trừ lương nhân viên. Phần hàng hỏng còn hiện hữu trong kho được cách ly; chỉ phần đã thiếu vật lý được tính theo cơ chế này.

## 9. Dữ liệu và chạy thử

Chạy `node server.js`, mở http://127.0.0.1:4173. Tài khoản `admin`, `nhanvien`, `kho`, cùng mật khẩu `123456`. Đăng xuất/đăng nhập để thử phân vai trên cùng trình duyệt và địa chỉ.

Schema hiện tại 3, giữ khóa `retailflow.v1`. Nâng từ schema 1 tạo bản gốc `.before-v2`; từ schema 2 tạo `.before-v3`. Phiếu kiểm kê cũ đang chờ duyệt và còn lệch được đưa về đếm/đối chiếu theo quy trình mới. Không xóa hóa đơn hoặc tồn cũ. Ưu đãi số tiền dưới 1.000đ bị tạm dừng để admin sửa.

Lô cũ không có HSD phải được admin xác minh từ nhãn trước khi bán. Sao lưu JSON trong Cấu hình; dữ liệu chỉ lưu tại trình duyệt, chưa có database dùng chung. Thông tin NCC và thanh toán được nhân viên xác nhận thủ công.

PDF/Word trong `bao-cao/` là báo cáo thiết kế trước v2; chưa được tạo lại cho bản v3. Tài liệu này mô tả bản đang chạy.
