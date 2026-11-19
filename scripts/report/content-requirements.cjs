'use strict';
module.exports = function ({ page, p, h, t, b, n, flow }) {
  page(
    'CHƯƠNG 3',
    '3.1. Tác nhân và ma trận quyền',
    'Phân chia trách nhiệm theo công việc thực tế.',
    [
      t(
        ['Chức năng', 'Admin', 'Thu ngân', 'Kho'],
        [
          ['Tổng quan, báo cáo, cấu hình', 'Có', 'Không', 'Không'],
          ['POS, lưu/in hóa đơn, đơn tạm', 'Có', 'Có', 'Không'],
          ['Khách hàng, lịch sử mua', 'Có', 'Có', 'Không'],
          ['Xem sản phẩm, lô và kiểm kê', 'Có', 'Không', 'Có'],
          ['Tạo/sửa danh mục sản phẩm', 'Có', 'Không', 'Không'],
          ['NCC, yêu cầu nhập, báo thực nhận', 'Có', 'Không', 'Có'],
          ['Duyệt yêu cầu/thực nhận/kiểm kê', 'Có', 'Không', 'Không'],
          ['Voucher, chương trình, nhân viên', 'Có', 'Không', 'Không'],
          ['Đề xuất chi nhánh, sao lưu/khôi phục', 'Có', 'Không', 'Không'],
        ],
      ),
      h('Quyền theo trạng thái và chủ sở hữu'),
      p(
        'Quyền truy cập trang chưa đủ để xác định quyền thực hiện một biến cố. Nhân viên kho chỉ cập nhật phiên kiểm kê của mình hoặc phiếu nháp phù hợp; chỉ admin được đưa kết quả đến trạng thái làm thay đổi tồn. Nút thao tác được dựng theo trạng thái hiện tại; lớp nghiệp vụ kiểm tra lại khi xác nhận để tránh việc chỉ ẩn nút trên giao diện.',
      ),
      p(
        'NCC và khách hàng là đối tượng nghiệp vụ bên ngoài, không có tài khoản đăng nhập trong bản hiện hành. Thông tin giao hàng và xác nhận thanh toán được nhân viên nhập từ chứng từ thực tế. Không mô tả một cổng NCC hay liên kết ngân hàng tự động khi các tích hợp này chưa tồn tại.',
      ),
      n(
        'Phân biệt trách nhiệm',
        'Kho ghi nhận sự kiện và đề xuất; admin kiểm duyệt quyết định; hệ thống cập nhật số liệu theo quyết định hợp lệ. Việc bấm nút không thay thế bước kiểm tra chứng từ ngoài thực tế.',
      ),
    ],
  );
  page(
    'CHƯƠNG 3',
    '3.2. Yêu cầu chức năng và tiêu chí chấp nhận',
    'Mã FR dùng để truy vết đến màn hình và kiểm thử.',
    [
      t(
        ['Mã', 'Yêu cầu', 'Điều kiện chấp nhận'],
        [
          ['FR01', 'Đăng nhập và phân vai', 'Thấy đúng menu; thao tác nghiệp vụ vẫn kiểm quyền.'],
          ['FR02', 'Tìm và chọn hàng', 'Tìm tên/mã; chọn số nguyên dương trong mức bán được.'],
          [
            'FR03',
            'Tìm khách theo điện thoại',
            'Gợi ý thu hẹp theo tiền tố; không khớp thì không giữ gợi ý sai.',
          ],
          [
            'FR04',
            'Nhiều khuyến mãi',
            'Các mã khác nhau nhận nhiều chương trình; tổng và chi tiết khớp.',
          ],
          ['FR05', 'Hai nguồn voucher', 'Đối tác chỉ giảm đúng hàng thuộc NCC đó.'],
          [
            'FR06',
            'Thanh toán đủ một lần',
            'Một phương thức; từ chối thiếu tiền; chống lặp cùng giỏ.',
          ],
          ['FR07', 'Lưu và tra hóa đơn', 'Giữ dữ liệu tại lúc bán; in/HTML/CSV đúng nội dung.'],
          ['FR08', 'Quản lý lô và HSD', 'Chặn hết hạn, chưa xác minh, cách ly; xuất FEFO.'],
          [
            'FR09',
            'Nhập có kiểm duyệt',
            'Kho gửi; admin duyệt; chỉ thực nhận được duyệt mới tăng tồn.',
          ],
          [
            'FR10',
            'Theo dõi giao thiếu/dư',
            'Lưu số đặt gốc, số giao, không đạt, duyệt nhập và quyết định dư.',
          ],
          ['FR11', 'Kiểm kê có xử lý', 'Đối chiếu đúng mã hàng, chốt đếm lại, admin quyết định.'],
          ['FR12', 'Đối soát cuối tháng', 'Chỉ thiếu đã duyệt mới tạo khoản trừ quản trị.'],
          ['FR13', 'Danh mục đúng NCC', 'Không gán hàng không thuộc thương hiệu/phạm vi NCC.'],
          [
            'FR14',
            'Quản trị và lưu trữ',
            'Nhân sự, cấu hình, chi nhánh đề xuất, sao lưu có kiểm tra.',
          ],
        ],
      ),
      n(
        'Yêu cầu đã thay đổi',
        'Phân hệ trả hàng đã bị loại theo phạm vi cuối cùng. Không tiếp tục đưa nó vào đặc tả chức năng hiện hành hoặc ma trận quyền; dữ liệu lịch sử được bảo toàn để tránh thay đổi số tiền quá khứ.',
      ),
    ],
  );
  page(
    'CHƯƠNG 3',
    '3.3. Quy tắc bán hàng và ưu đãi',
    'BR01–BR08 bảo vệ số lượng và giá trị hóa đơn.',
    [
      t(
        ['Mã', 'Quy tắc', 'Hệ quả trên giao diện'],
        [
          [
            'BR01',
            'Chỉ xuất lượng còn bán được từ lô hợp lệ.',
            'Khóa chọn hàng khi hết khả dụng hoặc đang kiểm kê.',
          ],
          [
            'BR02',
            'Số lượng là số nguyên; giỏ chỉ có một dòng cho mỗi SKU.',
            'Tăng/giảm hoặc sửa số lượng trên cùng dòng.',
          ],
          [
            'BR03',
            'Mức giảm thực tế của một ưu đãi từ 1.000đ; không tự nâng phần giảm nhỏ hơn.',
            'Bỏ qua khi tự tính hoặc thông báo điều kiện khi chọn riêng.',
          ],
          [
            'BR04',
            'Mua đủ số lượng tính theo nhóm cùng mã và đúng lô áp dụng.',
            'Mua 2 giảm 5.000đ: 2/3 giảm 5.000đ; 4/5 giảm 10.000đ trước trần.',
          ],
          [
            'BR05',
            'Nhiều chương trình được áp dụng cho những SKU khác nhau.',
            'Hiện riêng tên, hàng và số tiền từng chương trình.',
          ],
          [
            'BR06',
            'Không giảm chồng hai chương trình trên cùng SKU.',
            'So sánh phương án; kiểm lại trần và mức tối thiểu theo hàng được gán.',
          ],
          [
            'BR07',
            'Voucher cửa hàng áp chung; voucher đối tác chỉ hàng NCC tương ứng.',
            'Không phân bổ tiền giảm sang hàng ngoài phạm vi.',
          ],
          [
            'BR08',
            'Khách thanh toán đủ một lần bằng một phương thức.',
            'Chuyển khoản/thẻ phải xác nhận đủ tiền; tiền mặt phải đủ tổng.',
          ],
        ],
      ),
      h('Phân bổ và làm tròn'),
      p(
        'Số tiền lưu dưới dạng số nguyên đồng. Phần giảm và thuế được phân bổ theo trọng số phù hợp, dùng phương pháp phần dư để tổng từng dòng khớp tổng hóa đơn và không đẩy phần sai số vào một dòng quá giá trị của nó. Điều kiện ưu đãi được kiểm tra lại khi báo giá và thanh toán, không chỉ lúc bấm chọn mã.',
      ),
      n(
        'Lưu ý về thuật toán kết hợp',
        'Hiện thực so sánh các báo giá hợp lệ, gán chương trình theo SKU và thử phương án giữ một chương trình chung rồi giảm tiếp hàng còn lại. Đây là chiến lược lựa chọn có ràng buộc; báo cáo không khẳng định đã chứng minh tối ưu toàn cục cho mọi tổ hợp khuyến mãi tùy ý.',
      ),
    ],
  );
  page(
    'CHƯƠNG 3',
    '3.4. Quy tắc nhập, kiểm kê và báo cáo',
    'BR09–BR16 ngăn thay đổi tồn ngoài quy trình.',
    [
      t(
        ['Mã', 'Quy tắc', 'Tình huống điển hình'],
        [
          [
            'BR09',
            'Mỗi yêu cầu chỉ có sản phẩm đúng NCC đang hợp tác.',
            'Không đưa Oreo vào phiếu của Vinamilk hoặc Acecook.',
          ],
          [
            'BR10',
            'Lập/gửi/duyệt đặt hàng chưa làm tăng tồn.',
            'Chờ hàng từ NCC dù yêu cầu đã được admin duyệt.',
          ],
          [
            'BR11',
            'Số giao thực tế, không đạt và số duyệt nhập là các đại lượng riêng.',
            'Đặt 10, giao 8, không đạt 2 → đề nghị nhập 6.',
          ],
          [
            'BR12',
            'Giao dư phải có quyết định admin.',
            'Nhận bổ sung hoặc giao lại phần dư; không tự giới hạn hoặc bỏ số giao thật.',
          ],
          [
            'BR13',
            'Khóa xuất/nhập các mã trong phiên kiểm kê đang mở.',
            'Đếm trên một mốc tồn không bị bán/nhập xen kẽ.',
          ],
          [
            'BR14',
            'Chênh lệch phải đối chiếu hóa đơn và chốt đếm lại trước khi gửi duyệt.',
            'Sổ 120, đếm 121 → xử lý dư 1; chưa tăng tồn ngay.',
          ],
          [
            'BR15',
            'Chỉ admin duyệt mới điều chỉnh lô; một phiếu không duyệt hai lần.',
            'Từ chối/hủy mở khóa mà không tự sửa số tồn.',
          ],
          [
            'BR16',
            'Thiếu đã duyệt được trừ trong kỳ quản trị theo tháng duyệt.',
            'Số thiếu × giá bán chụp lúc mở kiểm kê; không sửa hóa đơn đã bán.',
          ],
        ],
      ),
      h('Hàng hết hạn và hàng dư'),
      p(
        'Hàng hết hạn không được đưa vào khuyến mãi để bán. Hàng dư không tự tạo doanh thu và không tự bù lượng thiếu ở lô khác. Nếu phát hiện chứng từ nhập còn thiếu, cần hoàn thiện chứng từ hợp lệ và tránh vừa tăng tồn qua nhập hàng vừa tăng lại cùng lượng qua kiểm kê.',
      ),
      n(
        'Mô hình số liệu quản trị',
        'Khoản trừ kiểm kê phản ánh yêu cầu đối soát nội bộ của đề tài, không phải kết luận về cách hạch toán doanh thu theo chuẩn mực kế toán. Giá vốn thiếu được lưu riêng. Hàng hỏng còn nằm trong kho là phần cách ly; không tự đồng nhất với thiếu vật lý.',
      ),
    ],
  );
  page(
    'CHƯƠNG 3',
    '3.5. Dữ liệu nghiệp vụ và liên kết',
    'Lược đồ logic mô tả dữ liệu thực lưu, không phải cơ sở dữ liệu máy chủ.',
    [
      t(
        ['Nhóm đối tượng', 'Thuộc tính trọng tâm', 'Liên kết'],
        [
          [
            'Sản phẩm',
            'id, tên, ảnh, giá bán/vốn, barcode, ngưỡng tồn, NCC, quản lý HSD.',
            'Một NCC – nhiều sản phẩm; một sản phẩm – nhiều lô.',
          ],
          [
            'Lô hàng',
            'Mã lô, sản phẩm, HSD, số vật lý, số cách ly, nguồn nhập.',
            'Phân bổ vào dòng bán và dòng kiểm kê.',
          ],
          [
            'Ưu đãi',
            'Loại, giá trị, thời gian, ngưỡng, trần, phạm vi hàng/lô.',
            'Voucher đối tác liên kết NCC; chương trình liên kết các SKU.',
          ],
          [
            'Hóa đơn',
            'Mã, thời gian, khách, nhân viên, phương thức, dòng hàng, ưu đãi và tổng.',
            'Dòng bán giữ phân bổ lô và thông tin tại thời điểm thanh toán.',
          ],
          [
            'Yêu cầu nhập',
            'NCC, các dòng đặt, số đã nhận, trạng thái, người lập/duyệt.',
            'Một yêu cầu – nhiều biên bản thực nhận.',
          ],
          [
            'Biên bản nhận',
            'Số giao, không đạt, đạt đề nghị, duyệt nhập, quyết định dư.',
            'Khi duyệt tạo các lô/biến động tương ứng.',
          ],
          [
            'Kiểm kê',
            'Mốc tồn, lần đếm, đối chiếu hóa đơn, lần đếm lại, kết luận.',
            'Theo lô; chỉ thiếu đã duyệt liên kết khoản trừ tháng.',
          ],
        ],
      ),
      p(
        'Các mã kỹ thuật và ảnh chụp dữ liệu chứng từ có mục đích khác nhau. SKU liên kết chính xác hàng đang kiểm kê; tên trên hóa đơn giữ cách gọi tại lúc bán. Mã tham chiếu HDxxxxx là mã nội bộ tự sinh, khác mã chứng từ giao NCC nhập từ bên ngoài và khác mã xác nhận ngân hàng.',
      ),
      n(
        'Bất biến dữ liệu',
        'Tồn sản phẩm bằng tổng tồn các lô. Số cách ly không vượt số vật lý. Tổng tiền các dòng sau giảm và thuế bằng tổng hóa đơn. Biên bản chưa duyệt không làm thay đổi tồn. Các bất biến này được dùng làm tiêu chí kiểm tra sao lưu và kiểm thử.',
      ),
    ],
  );
};
