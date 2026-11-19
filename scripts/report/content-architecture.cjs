'use strict';
module.exports = function ({ page, p, h, t, b, n, flow }) {
  page(
    'CHƯƠNG 4',
    '4.1. Kiến trúc giao diện và tổ chức mã',
    'Tách hiển thị, sự kiện và quy tắc nghiệp vụ theo chủ đề.',
    [
      flow(['Người dùng', 'Trang / hộp thoại', 'Sự kiện', 'Store & nghiệp vụ', 'localStorage']),
      t(
        ['Lớp / thư mục', 'Trách nhiệm', 'Ví dụ'],
        [
          [
            'src/features',
            'Dựng nội dung và trạng thái màn hình.',
            'pos, payments, purchase-receipts, audit-reconciliation.',
          ],
          [
            'src/events',
            'Chuyển click, nhập và submit thành lời gọi nghiệp vụ.',
            'retail-forms, actions/inventory, actions/sales.',
          ],
          [
            'src/domain',
            'Kiểm tra điều kiện, tính tiền, thay trạng thái và lưu.',
            'sales, discounts, promotion-combinations, inventory.',
          ],
          [
            'src/shared và core',
            'Bảng, hộp thoại, định dạng, thông báo và ngữ cảnh.',
            'money, field, showModal, safeQuote.',
          ],
          [
            'src/data và assets',
            'Danh mục, phạm vi NCC, ảnh và quy tắc trình bày.',
            'product-catalog, supplier-catalog, CSS theo chức năng.',
          ],
          [
            'server.js và tests',
            'Phục vụ tệp tĩnh, kiểm chứng nghiệp vụ và trình duyệt.',
            'Không phải API nghiệp vụ hay máy chủ xác thực.',
          ],
        ],
      ),
      p(
        'Trang nạp các script defer theo thứ tự trong index.html. Store tập hợp các module nghiệp vụ; các chức năng tính toán dùng chung được gọi từ giao diện và từ kiểm thử Node.js. Cách tổ chức này giảm nguy cơ một biểu mẫu tự tính khác với lúc thanh toán hoặc duyệt phiếu.',
      ),
      h('Đánh đổi kiến trúc'),
      p(
        'Cách triển khai ít phụ thuộc và dễ chạy thử, phù hợp phạm vi đồ án. Tuy nhiên, ngữ cảnh trình duyệt dùng chung và cập nhật DOM bằng dựng lại nội dung làm việc quản lý focus, trạng thái tạm và liên kết module khó hơn khi quy mô tăng. Kiến trúc tương lai cần ranh giới module và API rõ hơn, không chỉ tăng số file.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.2. Kiến trúc thông tin và điều hướng',
    'Một khung thao tác chung, menu thay đổi theo vai trò.',
    [
      t(
        ['Nhóm điều hướng', 'Trang', 'Mục tiêu'],
        [
          [
            'Tổng quan',
            'Tổng quan; POS; sản phẩm; đơn hàng.',
            'Bắt đầu ca, bán hàng và tra cứu nhanh.',
          ],
          [
            'Nghiệp vụ',
            'Kho & kiểm kê; nhập hàng; NCC; khách hàng; nhân viên.',
            'Theo dõi hàng, đối tác và người vận hành.',
          ],
          [
            'Quản trị',
            'Báo cáo; voucher & khuyến mãi; chi nhánh; cấu hình.',
            'Thiết lập, kiểm duyệt và đánh giá số liệu.',
          ],
        ],
      ),
      p(
        'Thanh bên trái cung cấp vị trí ổn định của các phân hệ. Thanh đầu trang có tìm kiếm toàn hệ thống, thông báo và thông tin vai trò. Tiêu đề trang, mô tả ngắn và nút chính thống nhất vị trí để người dùng nhận diện mục đích trước khi nhập dữ liệu. Các menu không thuộc quyền không được đưa vào danh sách của người đăng nhập.',
      ),
      h('Điều hướng giữa trang và hộp thoại'),
      p(
        'Nghiệp vụ chính đặt trên trang; nhập và kiểm duyệt chi tiết dùng dialog để giữ ngữ cảnh bảng đang xem. Hộp thoại đối chiếu có “Quay lại phiếu”; sau xác nhận phải quay đúng phiên kiểm kê và mở bước tiếp theo. Các thao tác đóng không mặc nhiên hoàn thành một nghiệp vụ hoặc cập nhật tồn.',
      ),
      h('Tra cứu và mật độ thông tin'),
      p(
        'Tìm kiếm tên/mã và phân trang được dùng cho danh sách dài. POS giới hạn 24 mặt hàng trên một trang sản phẩm; các bảng quản trị phân trang theo nhóm nhỏ. Danh sách gợi ý điện thoại được lọc theo dữ liệu đang nhập, thay cho việc yêu cầu thu ngân kéo một danh sách khách dài.',
      ),
      n(
        'Điểm cần tiếp tục hoàn thiện',
        'Điều hướng hiện không phải một bộ định tuyến có URL riêng cho mỗi trạng thái. Cần bổ sung deep link và phục hồi bộ lọc có chủ đích nếu phát triển thành hệ thống nhiều người dùng.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.3. Quy chuẩn trình bày và tương tác',
    'Màu, nhãn và điều kiện bấm phải cùng truyền tải ý nghĩa.',
    [
      {
        type: 'palette',
        items: [
          ['#17243D', 'Nền điều hướng'],
          ['#5143CF', 'Tác vụ chính / đang chọn'],
          ['#087C70', 'Xác nhận nghiệp vụ'],
          ['#B02440', 'Hủy / từ chối'],
          ['#FFF6DF', 'Ưu đãi / cần chú ý'],
        ],
      },
      t(
        ['Thành phần', 'Quy định thiết kế và hiện trạng'],
        [
          ['Nút chính', 'Có nhãn động từ, màu tím; tránh nhiều nút cùng tranh vị trí ưu tiên.'],
          [
            'Nút xác nhận/từ chối',
            'Màu xanh hoặc đỏ kết hợp chữ; quyết định cần ý kiến được ghi rõ.',
          ],
          [
            'Nút phụ và trạng thái khóa',
            'Nền xanh nhạt có viền; disabled giảm độ nổi và không xử lý click.',
          ],
          [
            'Ô nhập',
            'Có nhãn; dùng min, max, step, required đúng kiểu; lỗi nghiệp vụ được kiểm lại sau submit.',
          ],
          [
            'Thông báo',
            'Thông báo ngắn cho kết quả; lỗi biểu mẫu ở khu vực có thể nhìn và cuộn tới.',
          ],
          [
            'Hình ảnh',
            'Ảnh bao bì địa phương hóa trải nghiệm nhận biết; tên, dung tích và mã vẫn là dữ liệu quyết định.',
          ],
          [
            'Định dạng',
            'Tiền theo vi-VN và ký hiệu ₫; ngày theo múi giờ Việt Nam; tách số vật lý với số bán được.',
          ],
        ],
      ),
      h('Phím tắt và thiết bị'),
      p(
        'Ctrl/Cmd+K đưa focus vào tìm kiếm; F2 chuyển POS, F4 lưu đơn tạm và F8 mở thanh toán trong điều kiện phù hợp. Máy quét USB có thể nhập như bàn phím vào ô mã; đây không phải chức năng quét camera. Các phím tắt không thay thế điều kiện phân quyền hoặc kiểm tra trạng thái.',
      ),
      n(
        'Đặc điểm font và kết nối',
        'Giao diện khai báo Be Vietnam Pro, dự phòng Arial/sans-serif. Font chính có nguồn tải ngoài; ảnh sản phẩm đã lưu local. Vì vậy không khẳng định toàn bộ tài nguyên hiển thị đều độc lập mạng khi chưa đóng gói font.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.4. Luồng bán hàng và trạng thái đơn',
    'Hóa đơn chỉ được hình thành sau một lần thanh toán đủ.',
    [
      flow([
        'Chọn hàng / SL',
        'Tìm khách',
        'Tính ưu đãi',
        'Xác nhận đủ tiền',
        'Lưu hóa đơn & xuất lô',
      ]),
      t(
        ['Trạng thái', 'Thao tác tiếp', 'Tác động'],
        [
          [
            'Giỏ đang bán',
            'Sửa hàng, số lượng, khách; xem ưu đãi.',
            'Chưa trừ tồn; báo giá có thể đổi theo điều kiện hiện tại.',
          ],
          [
            'Đơn lưu tạm',
            'Mở lại khi giỏ hiện tại trống; tối đa 5 đơn.',
            'Không giữ chỗ hàng; phải xét lại giá, tồn và hiệu lực.',
          ],
          [
            'Đang thanh toán',
            'Chọn một phương thức; xác nhận hoặc quay lại.',
            'Chưa tạo hóa đơn nếu chưa đủ điều kiện.',
          ],
          [
            'Đã thanh toán',
            'Tra cứu, lưu HTML, in hoặc lưu PDF.',
            'Ghi lô xuất, ưu đãi và thông tin tại thời điểm bán.',
          ],
        ],
      ),
      h('Ca sử dụng UC01 – hoàn tất bán hàng'),
      p(
        'Tiền điều kiện: người dùng có quyền POS, sản phẩm hoạt động, lô đủ bán và không bị khóa kiểm kê. Luồng chính: chọn hàng và số lượng; chọn khách; hệ thống báo giá; người dùng chọn phương thức và xác nhận đủ tiền; hệ thống lưu hóa đơn, trừ lô và xóa giỏ. Hậu điều kiện: tổng từng dòng khớp tổng hóa đơn và chỉ có một giao dịch cho checkoutKey đó.',
      ),
      h('Luồng thay thế'),
      p(
        'Thiếu tiền thì giữ hộp thoại và chỉ rõ số tiền phải thanh toán đủ. Hết hàng, đổi giá, ưu đãi hết hiệu lực hoặc tab khác đã thay dữ liệu thì yêu cầu cập nhật trước khi tiếp tục. Chuyển khoản/thẻ không có kết nối tự kiểm tra tiền về; nhân viên chịu trách nhiệm xác nhận ngoài ứng dụng.',
      ),
      n(
        'Mã và chống lặp',
        'Mã hóa đơn và checkoutKey có vai trò khác nhau. Mã tham chiếu ngẫu nhiên HDxxxxx được tạo nội bộ lúc thành công, kiểm tránh trùng; không yêu cầu thu ngân điền lại hoặc coi nó là mã của ngân hàng.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.5. Luồng nhập và đối chiếu thực nhận',
    'Tách quyết định đặt mua với quyết định ghi nhận vào kho.',
    [
      flow([
        'Kho gửi yêu cầu',
        'Admin duyệt đặt',
        'Kho khai từng lần giao',
        'Admin đối chiếu',
        'Nhập đúng số duyệt',
      ]),
      t(
        ['Bước / trạng thái', 'Người phụ trách', 'Điều kiện chuyển'],
        [
          [
            'Nháp → chờ duyệt',
            'Kho',
            'NCC hợp lệ, hàng đúng phạm vi, số lượng và giá nhập nguyên.',
          ],
          ['Chờ duyệt → đã duyệt / từ chối', 'Admin', 'Xác minh nhu cầu và ý kiến kiểm duyệt.'],
          [
            'Đã duyệt / nhận thiếu → chờ đối chiếu',
            'Kho',
            'Khai đủ các dòng, lô/HSD và lý do thiếu/dư/không đạt.',
          ],
          [
            'Chờ đối chiếu → nhận thiếu / nhận đủ',
            'Admin',
            'Duyệt phần đạt; có quyết định đối với phần dư.',
          ],
          [
            'Nhận thiếu → chốt thiếu',
            'Admin',
            'Có xác nhận NCC không giao thêm và cách xử lý lượng còn đặt.',
          ],
        ],
      ),
      h('Ví dụ định lượng'),
      p(
        'Đặt 10 chai; lần đầu giao 8, không đạt 2. Kho đề nghị 6 đạt; admin duyệt thì nhập 6, còn theo dõi 4. Lần sau giao 6 đạt tức dư 2 so với phần còn đặt. Nếu admin giao lại 2 dư thì nhập thêm 4; nếu nhận bổ sung thì nhập thêm 6, tổng nhập 12 và giữ nguyên số đặt gốc 10.',
      ),
      h('Nguyên tắc đối thoại hai bên'),
      p(
        'Bản hiện tại mô phỏng sự đối chiếu từ chứng từ giao của NCC, chưa xây tài khoản NCC. Các trường deliveryRef, mã lô, HSD, lý do, ý kiến duyệt và từng biên bản bảo đảm có điểm đối chiếu. Thông tin “đã giao” không được suy ra từ trạng thái yêu cầu “đã duyệt”.',
      ),
      n(
        'Tính nguyên khối',
        'Nếu phiếu có nhiều dòng mà một dòng không hợp lệ tại lúc duyệt, không để những dòng trước đã được cộng dở vào kho. Việc tạo lô lồng trong duyệt phiếu phải cùng một lần lưu nguyên khối.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.6. Luồng kiểm kê và đối soát tháng',
    'Chốt số thực tế sau xác minh, không dùng nút cộng/trừ tùy ý.',
    [
      flow([
        'Khóa phạm vi',
        'Lưu lần đếm đầu',
        'Lọc hóa đơn đúng SKU',
        'Chốt đếm lại',
        'Admin duyệt',
      ]),
      t(
        ['Tình huống', 'Xử lý trước duyệt', 'Kết quả khi duyệt'],
        [
          [
            'Sổ 120, đếm 121',
            'Cảnh báo dư; kiểm tra đơn vị, vị trí, lô, hóa đơn và phiếu nhập.',
            'Tăng 1 đúng lô khi có căn cứ; không tạo doanh thu.',
          ],
          [
            'Sổ 120, đếm 119',
            'Đối chiếu giao hàng/bán hàng, đếm lại, giải trình thiếu.',
            'Giảm 1 vật lý; ghi khoản thiếu tháng theo giá bán chụp lúc mở.',
          ],
          [
            'Đếm khớp nhưng cách ly lệch',
            'Kiểm tra hàng hỏng và phần nằm trong tổng vật lý.',
            'Điều chỉnh số cách ly được xác nhận.',
          ],
          [
            'Chứng từ nhập còn thiếu',
            'Không cộng bù qua kiểm kê cho cùng lượng.',
            'Hoàn thiện chứng từ và kiểm kê lại để tránh ghi hai lần.',
          ],
        ],
      ),
      h('Nguyên tắc lọc hóa đơn'),
      p(
        'Dùng đúng mã sản phẩm trong dòng hóa đơn và chỉ xét hóa đơn đã thanh toán trước mốc khóa kiểm kê. Hóa đơn có nhiều mặt hàng vẫn được liệt kê nếu chứa mã đó; cột số lượng và thành tiền chỉ tính phần mã đang kiểm kê. Hóa đơn không có mã bị loại. Tên trên chứng từ được giữ theo thời điểm bán để không sửa lịch sử khi danh mục đổi tên.',
      ),
      h('Chỉ tiêu cuối tháng'),
      p(
        'Thu sau hao hụt = số thu hóa đơn trong tháng − điều chỉnh lịch sử trong tháng − tổng thiếu đã duyệt trong tháng. Khoản thiếu = lượng thiếu × giá bán chụp lúc mở phiếu. Ví dụ số thu 10.000.000đ, thiếu 2 hàng giá 30.000đ đã duyệt → thu sau hao hụt 9.940.000đ nếu không có điều chỉnh khác.',
      ),
      n(
        'Giới hạn chỉ tiêu',
        'Đây là chỉ tiêu quản trị theo yêu cầu đề tài, chưa phải lợi nhuận hoặc doanh thu kế toán sau các bút toán chuẩn. Không lấy hàng dư bù tự động cho thiếu, không thay số tiền trên hóa đơn gốc và không tự trừ lương nhân viên.',
      ),
    ],
  );
  page(
    'CHƯƠNG 4',
    '4.7. Lưu trữ, nhất quán và phục hồi',
    'Giao diện phải phản ánh được cả lỗi lưu dữ liệu.',
    [
      t(
        ['Cơ chế', 'Mục tiêu', 'Giới hạn'],
        [
          [
            'commit nguyên khối',
            'Sao dữ liệu trước đổi; hoàn nguyên khi lỗi; chỉ lưu ngoài cùng khi thao tác lồng nhau.',
            'Không thay thế giao dịch của cơ sở dữ liệu máy chủ.',
          ],
          [
            'revision và sự kiện storage',
            'Phát hiện tab khác thay dữ liệu; yêu cầu tải lại trước khi ghi.',
            'Không phải đồng bộ đa người dùng hoặc khóa phân tán.',
          ],
          [
            'checkoutKey',
            'Không thanh toán cùng giỏ hai lần khi gửi lặp.',
            'Cần thiết kế lại khóa idempotency tại server khi có API.',
          ],
          [
            'Kiểm tra bản sao lưu',
            'Kiểm tra cấu trúc, số nguyên, chứng từ và tổng tồn lô.',
            'Tệp hợp lệ về cấu trúc không mặc nhiên đáng tin về nguồn gốc.',
          ],
          [
            'Di trú dữ liệu',
            'Giữ hóa đơn/tồn cũ; bổ sung lô chưa xác minh HSD; sửa liên kết NCC sai.',
            'Dữ liệu cũ phải được xác minh, không suy đoán HSD thực.',
          ],
        ],
      ),
      p(
        'Khóa lưu chính vẫn là retailflow.v1 với schema 3. Khi nâng cấp từ cấu trúc cũ, hệ thống giữ bản trước v2 hoặc v3 theo nguồn. Sản phẩm cũ thiếu HSD không được bán cho đến khi admin cập nhật từ nhãn/biên bản. Ưu đãi dưới mức tiền tối thiểu bị tạm dừng thay vì âm thầm đổi giá trị.',
      ),
      h('Ứng xử khi lỗi'),
      p(
        'Khi không đọc hoặc ghi được bộ nhớ, ứng dụng báo lỗi và có thể chuyển sang chế độ chỉ đọc. Sau lỗi không được thông báo thanh toán hay nhập kho thành công. Người vận hành cần sao lưu có kiểm soát, kiểm tra dung lượng và tải lại dữ liệu trước khi tiếp tục.',
      ),
      n(
        'Bảo toàn lịch sử',
        'Sửa liên kết sản phẩm–NCC hoặc thiết kế mới không có nghĩa là viết lại hóa đơn cũ. Tài liệu lịch sử và các chứng từ đã hoàn tất phải được phân biệt với danh mục đang dùng để lập chứng từ mới.',
      ),
    ],
  );
};
