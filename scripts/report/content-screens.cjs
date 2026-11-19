'use strict';
module.exports = function ({ page, p, t, n, f, pair }) {
  function screen(title, lead, image, role, input, output, events, errors, analysis) {
    page('CHƯƠNG 5', title, lead, [
      Array.isArray(image) ? pair(image) : f(image, lead),
      t(
        ['Thuộc tính', 'Đặc tả'],
        [
          ['Mục đích / người dùng', role],
          ['D1 – dữ liệu nhập', input],
          ['D2 – kết quả hiển thị', output],
          ['Biến cố và điều kiện', events],
          ['Lỗi / hướng xử lý', errors],
        ],
      ),
      p(analysis),
    ]);
  }
  screen(
    '5.1. Màn hình đăng nhập',
    'Cửa vào hệ thống và điểm xác định ngữ cảnh vai trò.',
    '01-dang-nhap',
    'Admin, thu ngân, kho; xác định tài khoản đang thao tác và nhóm menu được phép.',
    'Tên đăng nhập và mật khẩu; thông tin thử được trình bày trong hướng dẫn chạy, không xem là tài khoản thật.',
    'Lỗi tại biểu mẫu hoặc khung làm việc tương ứng vai trò khi đăng nhập thành công.',
    'Submit bằng nút đăng nhập hoặc Enter. Sau thành công mở trang đầu tiên trong quyền; đăng xuất xóa ngữ cảnh phiên, không xóa dữ liệu kinh doanh.',
    'Sai thông tin hoặc tài khoản bị khóa: giữ màn hình và cho sửa. Không thông báo thành công khi chưa xác định được người dùng đang hoạt động.',
    'Thiết kế chia khu vực nhận diện hệ thống và vùng nhập liệu để tập trung vào một nhiệm vụ. Cơ chế hiện tại chỉ phục vụ đồ án: dữ liệu tài khoản nằm trong trình duyệt và chưa có xác thực máy chủ. Sự phân biệt này cần được nêu khi trình diễn để tránh đánh đồng mẫu đăng nhập với an toàn vận hành.',
  );
  screen(
    '5.2. Khung điều hướng và tổng quan',
    'Tóm tắt tình hình ca bán, hỗ trợ đi đến công việc cần xử lý.',
    '02-tong-quan',
    'Admin; theo dõi số thu, số đơn, mặt hàng đang bán và cảnh báo cần quan tâm.',
    'Khoảng ngày biểu đồ; tìm kiếm toàn hệ thống; các nút đi đến POS, đơn hàng và nhập hàng.',
    'Thẻ tổng hợp, xu hướng doanh thu, cơ cấu phương thức, hóa đơn gần đây và tồn thấp/phiếu nhập cần xử lý.',
    'Đổi kỳ biểu đồ chỉ thay phần tổng hợp; nút tạo đơn đưa đến POS. Tìm kiếm trả về các đích mà người dùng được phép truy cập.',
    'Không có dữ liệu: hiện trạng thái rỗng, không vẽ số liệu như có giao dịch. Không dùng số tổng hợp để thay bảng chứng từ gốc khi cần đối soát.',
    'Thanh điều hướng, tiêu đề và nút chính tạo hệ quy chiếu ổn định giữa các trang. Biểu đồ phục vụ nhận biết xu hướng; số tiền cụ thể phải đọc từ thẻ và chứng từ. Chưa có kết quả kiểm tra khả năng đọc biểu đồ bằng công nghệ hỗ trợ nên đây vẫn là một mục cần hoàn thiện.',
  );
  screen(
    '5.3. Bố cục bán hàng tại quầy',
    'Danh mục bên trái và giỏ hiện tại bên phải giữ cùng ngữ cảnh.',
    '03-pos',
    'Thu ngân và admin; tìm, nhận biết, chọn hàng trước khi thanh toán.',
    'Tên/mã/barcode, nhóm hàng, lựa chọn trang sản phẩm và nút thêm hàng.',
    'Thẻ ảnh bao bì, tên/dung tích, giá bán, tồn vật lý, số bán được; giỏ và tổng tạm tính.',
    'Bấm ảnh hoặc Chọn số lượng mở hộp thoại; +1 thêm nhanh; lọc không tự thêm hàng. Mỗi trang tối đa 24 mặt hàng.',
    'Ngừng bán, lô không hợp lệ, hết số bán được hoặc đang khóa kiểm kê: không cho thêm. Số lượng vượt khả dụng được báo ở bước kiểm tra.',
    'Ảnh hỗ trợ nhận biết nhưng không thay tên, dung tích và SKU. Việc trình bày đồng thời tồn vật lý và số bán được giải thích vì sao có hàng trong kho mà POS vẫn khóa bán. Thiết kế giảm thao tác chuyển trang nhưng cần kiểm tra độ cao giỏ khi có nhiều dòng và nhiều ưu đãi.',
  );
  screen(
    '5.4. Chọn số lượng và tìm khách',
    'Rút ngắn nhập liệu bằng giá trị chọn nhanh và gợi ý theo điện thoại.',
    [
      ['04-chon-so-luong', 'Hộp thoại chọn số lượng trước khi thêm hàng.'],
      ['05-tim-khach', 'Gợi ý khách theo tiền tố số điện thoại.'],
    ],
    'Thu ngân/admin; chọn lượng thực bán và đúng khách hàng.',
    'Số lượng nguyên dương hoặc mức nhanh; số điện thoại nhập dần.',
    'Số có thể thêm, lượng trong giỏ; danh sách khách có số khớp và thông tin khách đã chọn.',
    'Bấm mức số lượng rồi Thêm vào giỏ. Gợi ý điện thoại thay đổi theo từng lần nhập; bấm hoặc dùng bàn phím để chọn; có thể bỏ chọn khách.',
    'Không khớp điện thoại: danh sách gợi ý biến mất. Sửa số sau khi đã chọn không được giữ một khách cũ không còn đúng. Số lượng âm/lẻ/vượt tồn bị từ chối.',
    'Hai tương tác giải quyết các vấn đề khác nhau: số lượng làm rõ ý định mua nhiều đơn vị, còn gợi ý điện thoại giảm việc tìm trong danh sách dài. Gợi ý không có kết quả không có nghĩa là tự tạo hồ sơ khách; thu ngân có thể bán cho khách lẻ hoặc tạo khách bằng chức năng riêng.',
  );
  screen(
    '5.5. Tự tính nhiều chương trình',
    'Các mặt hàng khác nhau được hưởng các khoản giảm riêng trong một giỏ.',
    '06-nhieu-khuyen-mai',
    'Thu ngân/admin; phát hiện và thông báo các ưu đãi đang phù hợp cho khách.',
    'Thay đổi hàng hoặc số lượng; mặc định dùng chế độ tự động chương trình.',
    'Gợi ý dưới thẻ hàng, số còn thiếu để đủ nhóm đầu, tên từng chương trình, các SKU áp dụng và số tiền giảm.',
    'Hệ thống kiểm thời gian, hoạt động, phạm vi lô, mức tối thiểu và trần. Tổng giảm là tổng các khoản đã chấp nhận; thanh toán kiểm lại điều kiện.',
    'Chưa đủ nhóm, dưới 1.000đ hoặc sai lô: chưa áp dụng, không làm giảm nhầm mặt hàng. Không tiếp tục dùng mức giảm cũ sau khi bỏ hàng làm mất điều kiện.',
    'Ví dụ hai mặt hàng nhận lần lượt 5.000đ và 3.000đ thì tổng giảm 8.000đ; từng khoản vẫn được giải thích trên giỏ và hóa đơn. Cùng SKU không bị giảm chồng hai chương trình. Hiện thực không được mô tả là bộ tối ưu toàn cục cho mọi cấu hình khuyến mãi có thể tạo.',
  );
  screen(
    '5.6. Chọn nhiều chương trình thủ công',
    'Cho phép chủ động chọn tập chương trình, không có mục Không giảm.',
    '07-chon-nhieu-km',
    'Thu ngân/admin; chủ động giới hạn các chương trình muốn xét trong giỏ.',
    'Các checkbox chương trình có sản phẩm liên quan; nút Về KM tự động.',
    'Trạng thái chọn và danh sách khoản giảm thực áp dụng; có thể chọn nhiều chương trình cùng lúc.',
    'Đánh dấu làm thay đổi tập chương trình được xét. Bỏ lựa chọn cuối quay lại tự động. Áp voucher thay nhóm chương trình đang sử dụng.',
    'Có đánh dấu không đồng nghĩa đã đủ điều kiện giảm. Chương trình hết hiệu lực, không đủ nhóm hoặc sai lô sẽ không tạo khoản giảm.',
    'Sự khác nhau giữa “được chọn để xét” và “đã được áp dụng” được thể hiện bằng hai vùng riêng: danh sách checkbox và danh sách số tiền thực giảm. Điều này đặc biệt cần khi chương trình có điều kiện mua đủ hoặc trần chung. Không có nút tắt giảm giá tùy ý trong phiên bản cuối.',
  );
  screen(
    '5.7. Quản lý và thiết lập voucher',
    'Phân biệt voucher cửa hàng với voucher giới hạn đối tác.',
    [
      ['15-voucher', 'Danh sách voucher, nguồn, hiệu lực và lượt dùng.'],
      ['16-thiet-lap-voucher', 'Biểu mẫu cấu hình nguồn voucher và điều kiện.'],
    ],
    'Admin cấu hình; thu ngân chỉ áp mã trong POS.',
    'Tên, mã, nguồn, NCC đối tác, cách giảm, mức giảm, giá trị tối thiểu, trần, thời gian, lượt và trạng thái.',
    'Danh sách mã, phạm vi, mức giảm và lượt đã dùng/tổng lượt; lỗi điều kiện nhập tại biểu mẫu.',
    'Lưu mới hoặc chỉnh sửa; mã không trùng. Voucher cửa hàng có phạm vi chung; đối tác chỉ giảm hàng thuộc NCC được chọn và phạm vi SKU nếu có.',
    'Mã sai định dạng, thời gian đảo ngược, mức tiền dưới 1.000đ, trần quá nhỏ hoặc đối tác ngừng hoạt động bị từ chối. Không hạ giới hạn lượt xuống dưới đã dùng.',
    'Nguồn voucher là một quy tắc tính tiền, không chỉ là nhãn mô tả. Do đó kiểm tra phải nằm trong lớp nghiệp vụ và được thực thi lại khi báo giá. Bản này chỉ ghi nhận voucher nội bộ/đối tác theo dữ liệu khai báo; chưa kết nối API phát hành hoặc xác minh mã của ứng dụng bên ngoài.',
  );
  screen(
    '5.8. Chương trình cận date và mua đủ',
    'Chọn đúng lô còn hạn và điều kiện nhóm sản phẩm.',
    '18-can-date',
    'Admin; nhận biết lô cần thúc đẩy bán và tạo chương trình đúng phạm vi.',
    'Chọn sản phẩm/lô; kiểu cố định, phần trăm hoặc mua đủ số lượng; buyQty, mức giảm, trần và thời gian.',
    'Danh sách lô cận date, HSD, số còn bán được; chương trình được lưu và gợi ý tương ứng tại POS.',
    'Đưa lô vào chương trình điền sẵn phạm vi; nhóm mua đủ được tính theo từng SKU và số xuất đúng lô, không gộp tùy ý hai mã.',
    'Lô hết hạn hoặc không thuộc sản phẩm đã chọn bị chặn. Giá trị thời gian hoặc nhóm không hợp lệ phải sửa trước khi lưu.',
    'Ngôn ngữ “cận date” cần đi kèm điều kiện còn hạn. Khi sản phẩm có cả lô ưu đãi và lô thường, giảm giá không được áp cho toàn bộ số mua chỉ vì cùng tên hàng. Cơ chế FEFO và phân bổ lô của giao dịch là căn cứ tính phần thuộc ưu đãi.',
  );
  screen(
    '5.9. Thanh toán tiền mặt',
    'Hiện một tổng phải thu và tính tiền trả khách.',
    '08-tien-mat',
    'Thu ngân/admin; hoàn tất toàn bộ hóa đơn một lần.',
    'Tiền khách đưa, nút mệnh giá nhanh hoặc Đủ tiền; nhóm khách tùy chọn.',
    'Tổng tiền, phương thức đang chọn, tiền thừa và lỗi thiếu tiền.',
    'Xác nhận kiểm tra đủ tiền, giỏ hợp lệ và checkoutKey. Khi thành công lưu hóa đơn, xuất lô, ghi lượt voucher và xóa giỏ trong cùng giao dịch lưu.',
    'Nhập thiếu, số không nguyên hoặc lỗi lưu: không tạo hóa đơn một phần. Gửi lặp cùng checkoutKey không được trừ tồn thêm.',
    'Màn hình không có lựa chọn chia tiền, ghi nợ hoặc trả trước một phần. Dòng tiền thừa chỉ có ý nghĩa sau khi so với đúng tổng đang được báo giá; kiểm tra cuối vẫn nằm trong checkout để chống một màn hình thanh toán đã lỗi thời.',
  );
  screen(
    '5.10. Chuyển khoản và thẻ',
    'Xác nhận đã nhận đủ tiền, mã tham chiếu được tự tạo.',
    [
      ['09-chuyen-khoan', 'Thông tin chuyển khoản và xác nhận số đã nhận.'],
      ['10-the', 'Xác nhận thanh toán thẻ đủ toàn bộ hóa đơn.'],
    ],
    'Thu ngân/admin; ghi nhận một giao dịch ngoài ứng dụng.',
    'Lựa chọn phương thức và checkbox xác nhận cửa hàng đã nhận đủ tổng.',
    'Thông tin ngân hàng hoặc hướng dẫn máy POS; tổng phải thu; thông báo mã HDxxxxx tự sinh khi thành công.',
    'Chưa xác nhận đủ tiền thì không hoàn tất. Mã tham chiếu không có ô nhập và phải được tạo tránh trùng giao dịch đã lưu.',
    'Checkbox chỉ là xác nhận trách nhiệm của người thao tác, không phải bằng chứng do ngân hàng gửi. Nếu chưa đối chiếu tiền thì quay lại, không bấm thành công.',
    'Phần giao diện cần giúp người dùng phân biệt mã nội bộ của RetailFlow và mã giao dịch thực của ngân hàng/máy thẻ. Báo cáo không mô tả QR động, webhook, trạng thái ngân hàng hoặc đối soát cổng thanh toán vì chúng chưa được tích hợp.',
  );
  screen(
    '5.11. Hóa đơn và lưu kết xuất',
    'Lưu được căn cứ giải thích số tiền khách đã thanh toán.',
    '11-hoa-don',
    'Thu ngân/admin; xem, in hoặc tải hóa đơn sau bán.',
    'Nút tải HTML, in/lưu PDF qua trình duyệt; không sửa số tiền của hóa đơn đã hoàn tất.',
    'Thông tin cửa hàng, thời điểm, khách, thu ngân, hàng/SL/giá, các chương trình, thuế, tổng và tiền thừa.',
    'Lưu các ảnh chụp dữ liệu giao dịch và khoản giảm theo sản phẩm; in dùng nội dung hóa đơn chứ không in toàn bộ khung quản trị.',
    'Không tìm thấy chứng từ: báo rõ và không tạo bản trắng được coi là hợp lệ. Việc lưu PDF phụ thuộc hộp in trình duyệt.',
    'Cột thành tiền hàng thể hiện giá trị trước giảm; vùng ưu đãi và tổng cho biết cách đi đến số đã thanh toán. Chứng từ này là phiếu bán nội bộ của đồ án, chưa phải hóa đơn điện tử đáp ứng yêu cầu pháp lý hoặc ký số.',
  );
  screen(
    '5.12. Lịch sử hóa đơn',
    'Tra cứu giao dịch bằng tiêu chí nghiệp vụ thay vì dò toàn bộ danh sách.',
    '12-don-hang',
    'Thu ngân/admin; tra cứu, mở và xuất các giao dịch đã lưu.',
    'Mã hóa đơn, khách, thu ngân; phương thức; khoảng ngày; phân trang.',
    'Danh sách mã, khách, thời điểm, phương thức, tổng và trạng thái; số tổng hợp của danh sách/chứng từ.',
    'Bấm mã hoặc Xem hóa đơn mở chi tiết; xuất CSV theo chức năng; thay tiêu chí cập nhật kết quả.',
    'Không có kết quả: thông báo rỗng và gợi ý đổi lọc. Không đưa lại thông tin “trả một phần/toàn bộ” vào phân hệ đã bỏ.',
    'Danh sách ưu tiên các thuộc tính giúp nhận biết giao dịch; phần chi tiết nằm trong hóa đơn. Hóa đơn có nhiều chương trình vẫn phải giữ tổng và danh sách chương trình tại lúc bán, không tính lại bằng cấu hình hiện tại khi người dùng mở lịch sử.',
  );
  screen(
    '5.13. Sản phẩm và danh mục',
    'Đủ thông tin nhận biết hàng và kiểm soát khả năng bán.',
    '13-san-pham',
    'Admin quản lý; kho xem dữ liệu cần cho công việc.',
    'Tìm tên/mã, lọc, phân trang; admin mở biểu mẫu tên, barcode, giá, NCC, HSD và trạng thái.',
    'Ảnh, tên, mã, nhóm, giá, số vật lý/số bán được và trạng thái phù hợp.',
    'Sửa giá không đổi chứng từ đã bán. Tạo tồn đầu có quản lý HSD phải khai lô và HSD; thay tồn hiện hành qua nghiệp vụ nhập/kiểm kê.',
    'Barcode trùng, giá/số lượng không nguyên hoặc hàng không đúng phạm vi NCC bị chặn.',
    'Số lượng 186 SKU giúp đánh giá tìm kiếm, phân trang và mật độ thông tin thực tế hơn mẫu vài sản phẩm. Ảnh và tên có nguồn; giá, ngưỡng tồn và HSD minh họa không được dùng như dữ liệu thương mại đã được xác minh.',
  );
  screen(
    '5.14. Tồn kho, lô và hạn dùng',
    'Tách số vật lý, phần cách ly và phần có thể xuất bán.',
    '20-lo-hsd',
    'Kho/admin; theo dõi từng lô và phát hiện điều kiện chặn bán.',
    'Tìm mặt hàng, lọc trạng thái lô; admin cập nhật HSD kèm căn cứ khi cần.',
    'Mã lô, HSD, số lượng, cách ly, trạng thái còn hạn/cận date/hết hạn/chưa xác minh.',
    'Xem lô từ mặt hàng; chuyển sang tạo ưu đãi nếu đủ điều kiện. Sửa HSD ghi lịch sử trước/sau, thời điểm và người sửa.',
    'HSD không hợp lệ hoặc thiếu căn cứ không được lưu. Phiên kiểm kê đang khóa ngăn xuất/nhập liên quan.',
    'Chỉ nhìn một cột “tồn” dễ làm người dùng hiểu nhầm hàng nào cũng bán được. Giao diện lô làm rõ vì sao một phần số lượng không khả dụng; điều này cần thống nhất với kiểm tra FEFO ở POS và với số đếm vật lý khi kiểm kê.',
  );
  screen(
    '5.15. Mở phiên và đếm độc lập',
    'Giữ mốc tồn, chọn phạm vi có thể kiểm đếm trong ca.',
    [
      ['29-chon-pham-vi', 'Chọn các mã và mục đích kiểm kê.'],
      ['30-dem-doc-lap', 'Kho ghi số đếm trước khi xem số trên sổ.'],
    ],
    'Kho mở và ghi phiên của mình; admin có quyền quản lý.',
    'Tập SKU, khu vực/mục đích; số vật lý từng lô và phần hỏng/cách ly nằm trong tổng.',
    'Phiếu kiểm kê, người đếm, lô/HSD; số sổ ẩn bước đầu đối với kho; dấu khóa xuất/nhập.',
    'Mở phiên khóa các mã trong phạm vi. Giao diện giới hạn 30 mã; lưu tiến độ trước khi gửi duyệt.',
    'Không chọn hàng, trùng phạm vi đang khóa hoặc chưa đếm đủ: không được gửi. Không nhập phần cách ly lớn hơn tổng đã đếm.',
    'Đếm độc lập giúp tránh chép số sổ. Đây là một biện pháp quy trình chứ chưa phải bảo đảm tính trung thực: môi trường trình duyệt vẫn do người dùng kiểm soát. Với triển khai thật, cần cơ chế phiên, khóa và dấu vết ở máy chủ.',
  );
  screen(
    '5.16. Chênh lệch và yêu cầu xử lý',
    'Dòng lệch dẫn đến hành động xác minh ngay trong phiếu.',
    '31-chenh-lech',
    'Kho xử lý phiên của mình; admin theo dõi căn cứ.',
    'Số đếm đã lưu, phần cách ly, giải trình từng lô có lệch.',
    'Sổ/đếm/lệch, yêu cầu xử lý, nút đối chiếu hóa đơn và đếm lại, giá trị thiếu dự kiến.',
    'Nhập khác sổ báo tại dòng; lưu tạo trạng thái cần xử lý. Chưa có đối chiếu thì nút chốt đếm lại bị khóa.',
    'Không cho gửi chênh lệch chỉ bằng việc gõ một lý do. Cần lưu, đối chiếu và xác nhận số đếm lại.',
    'Ví dụ sổ 120 và đếm 121 phải được hiểu là “cần giải thích dư 1”, không phải “bấm tăng 1”. Gợi ý trên phiếu chỉ dẫn kiểm tra đơn vị, vị trí, lô, chứng từ; người dùng phải có kết luận thực tế trước khi admin quyết định.',
  );
  screen(
    '5.17. Đối chiếu hóa đơn đúng sản phẩm',
    'Chỉ hiển thị chứng từ có mã hàng đang kiểm kê.',
    '32-doi-chieu-hoa-don',
    'Kho đang xử lý phiên/admin; xác minh phần bán liên quan đến chênh lệch.',
    'Mã/ngày để lọc thêm trong tập hóa đơn phù hợp; ghi chú tùy chọn.',
    'Tên và SKU đang xét; mã hóa đơn, thời điểm, khách/thu ngân, số mua và tiền riêng của SKU đó.',
    'Chọn đối chiếu từ dòng lệch. Bấm xác nhận lưu người/thời điểm/danh sách mã; ghi chú trống vẫn được và quay lại phiếu.',
    'Hóa đơn không có SKU không được xuất hiện. Hóa đơn nhiều mặt hàng chỉ hiển thị phần đang xét. Không trừ lại lượng đã bán vào sổ lần thứ hai.',
    'Thay đổi này sửa cả tính ngữ cảnh lẫn khả năng hoàn thành đối thoại. Nút xác nhận trước đây dễ bị hiểu là không hoạt động khi thiếu ghi chú và lỗi ở cuối hộp thoại; bản hiện tại chấp nhận xác nhận trực tiếp, ghi nhận nội dung mặc định có số hóa đơn và mã hàng.',
  );
  screen(
    '5.18. Chốt đếm lại và admin kiểm kê',
    'Phân biệt xác nhận số đếm với quyết định điều chỉnh tồn.',
    [
      ['33-chot-dem-lai', 'Nhập con số cuối sau khi đếm lại.'],
      ['34-admin-kiem-ke', 'Admin xem kết quả và quyết định.'],
    ],
    'Kho chốt đếm lại phiên của mình; admin duyệt, yêu cầu lại hoặc từ chối.',
    'Số cuối, phần hỏng/cách ly, kết luận đếm lại; admin ghi ý kiến và xác nhận quyết định.',
    'Số trước/sau, người đếm, lịch sử và kết luận; trạng thái chờ/đã xử lý.',
    'Đã đối chiếu mới chốt đếm lại. Sửa lượng sau chốt làm mất xác nhận trước. Admin duyệt mới cập nhật lô, ghi khoản thiếu và mở khóa.',
    'Thiếu căn cứ, số không hợp lệ, mốc tồn đổi hoặc duyệt lặp đều bị từ chối. Yêu cầu đếm lại đưa về bước đếm, chưa làm thay tồn.',
    'Lưu con số thực dụng cuối cùng không phải sửa số cho khớp sổ. Nếu đếm lại vẫn dư/thiếu thì giữ đúng kết quả đó và giải thích bằng chứng; nếu phát hiện chứng từ bị bỏ sót thì hoàn thiện theo đúng nghiệp vụ, tránh cộng bù trùng.',
  );
  screen(
    '5.19. Gợi ý nhập và danh sách yêu cầu',
    'Nhìn nhu cầu bổ sung cùng trạng thái xử lý với NCC.',
    '21-nhap-hang',
    'Kho/admin; phát hiện hàng sắp hết và theo dõi các yêu cầu.',
    'Tìm mã/NCC, lọc trạng thái; chọn gợi ý lập yêu cầu hoặc thêm hàng gợi ý.',
    'Lượng tồn thấp, ngưỡng, lượng đang đặt và lượng đề xuất; danh sách yêu cầu và lượng đặt/đạt đã nhập.',
    'Chọn gợi ý điền đúng NCC và sản phẩm; lượng đề xuất tính đến các yêu cầu chưa hoàn tất để tránh đề nghị trùng.',
    'NCC/sản phẩm ngừng hoạt động không lập mới. Gợi ý không tự gửi đặt hàng hoặc tự tăng tồn.',
    'Khuyến nghị nhập hiện dựa trên ngưỡng và dữ liệu đang có, chưa là dự báo nhu cầu theo thời gian, thời hạn giao hay hạn dùng kinh tế. Vì vậy nhãn “gợi ý” cần được giữ rõ; nhân viên và admin vẫn phải quyết định nhu cầu thực.',
  );
  screen(
    '5.20. Lập và duyệt yêu cầu nhập',
    'Một nhà cung cấp, đúng hàng thuộc phạm vi cung ứng.',
    [
      ['22-lap-yeu-cau', 'Kho khai sản phẩm, số lượng và lý do.'],
      ['23-admin-duyet-yeu-cau', 'Admin xem yêu cầu trước khi duyệt đặt.'],
    ],
    'Kho lập/lưu nháp/gửi; admin duyệt hoặc từ chối.',
    'NCC, các dòng hàng không trùng, lượng nguyên, giá dự kiến và căn cứ nhu cầu.',
    'Các dòng, tổng dự kiến, người lập, trạng thái; admin thấy nút quyết định.',
    'Đổi NCC làm mới lựa chọn hàng của NCC đó. Lưu nháp không cộng tồn; gửi chuyển chờ admin; duyệt đặt cũng chưa cộng tồn.',
    'Sai thương hiệu hoặc hàng không thuộc NCC bị chặn dù cố đưa vào dữ liệu. Yêu cầu sai cần hủy/lập lại thay vì giả nhận hàng để kết thúc.',
    'Biểu mẫu tránh gộp thông tin “muốn mua” với “đã nhận”. Đơn giá trên yêu cầu là dự kiến và là căn cứ giá trị đặt; giá trị thực nhập phải theo số được duyệt ở các biên bản thực nhận.',
  );
  screen(
    '5.21. Thực nhận và giao thiếu',
    'Khai sự kiện giao thật, không dùng số đặt thay số nhận.',
    [
      ['24-khai-thuc-nhan', 'Nhập số giao, không đạt và lô/HSD.'],
      ['25-nhan-thieu', 'Biên bản gửi admin trước khi tăng tồn.'],
    ],
    'Kho báo từng lần giao; admin đối chiếu và duyệt số nhập.',
    'Phiếu giao NCC, số thực giao, không đạt, lô, HSD, lý do thiếu/dư hoặc chất lượng.',
    'Đặt, đã nhận trước, giao lần này, đạt đề nghị, thiếu, thông tin lô và trạng thái duyệt.',
    'Chỉ ghi thực nhận khi yêu cầu đã duyệt và không có biên bản chờ khác. Admin chốt thì số đạt được duyệt mới tạo lô.',
    'HSD đã hết, thiếu mã lô cho lượng nhập, thiếu lý do hoặc số không hợp lệ phải sửa. Từ chối biên bản không phát sinh tồn.',
    'Đặt 10, giao 8 và hỏng 2 phải theo dõi nhập 6, còn thiếu 4. Không diễn giải là chỉ thiếu 2 vì lượng không đạt cũng chưa thể phục vụ bán hàng. Các lần giao bù được giữ thành biên bản riêng để truy vết.',
  );
  screen(
    '5.22. Giao dư và quyết định xử lý',
    'Lưu đủ số giao và yêu cầu admin chọn hướng cho phần dư.',
    [
      ['26-giao-du', 'Biên bản hiển thị phần dư so với lượng còn đặt.'],
      ['27-quyet-dinh-giao-du', 'Admin chọn nhận bổ sung hoặc giao lại dư.'],
    ],
    'Kho ghi thực giao; admin chịu trách nhiệm quyết định và kết luận.',
    'Số giao thực tế vượt phần còn đặt; ý kiến admin và quyết định phần dư.',
    'Số dư đạt, số duyệt nhập, số giao lại, số đặt gốc và giá trị thực nhập.',
    'Nhận bổ sung tăng lượng và giá trị thực nhập; giao lại dư chỉ nhập phần còn đặt. Phần không đạt được theo dõi riêng.',
    'Có dư mà không chọn quyết định thì không duyệt. Không âm số còn thiếu, không xóa lượng giao thực và không duyệt lại cùng biên bản.',
    'Trong bản hiện tại một quyết định áp dụng cho tất cả dòng dư của biên bản. Nếu cần nhận dư mặt hàng A nhưng giao lại dư mặt hàng B trong cùng lần, cần mở rộng đến quyết định theo dòng; đây là giới hạn đã xác định, không được che bằng một lựa chọn chung.',
  );
  screen(
    '5.23. Hồ sơ và danh mục nhà cung cấp',
    'Tên nhà cung cấp và hàng được chọn phải phù hợp.',
    '38-danh-muc-ncc',
    'Kho/admin; tra cứu hàng riêng, giá/tồn và lịch sử của một đối tác.',
    'Chọn NCC, tìm trong danh mục; nút lập yêu cầu cho một sản phẩm.',
    'Tên, phạm vi thương hiệu, liên hệ, vùng, hàng liên quan và các phiếu nhập của NCC.',
    'Vinamilk chỉ các sản phẩm Vinamilk; Acecook các dòng tương ứng. Các đại lý mẫu khác được đặt tên theo nhãn hàng/phạm vi đã khai báo.',
    'Không giữ liên kết sai chỉ vì có voucher cũ. Nếu sửa phạm vi làm voucher chỉ định không còn hàng phù hợp thì tạm dừng để admin chọn lại.',
    'Quy tắc hiện có dùng phạm vi tên/biểu thức cấu hình trong dữ liệu mẫu. Nó ngăn các nhầm lẫn đã nhận diện nhưng chưa thay thế hợp đồng và danh mục phân phối có mã thương hiệu chuẩn. Định hướng thực tế là chuẩn hóa bảng thương hiệu và quan hệ NCC–SKU thay cho chỉ so tên.',
  );
  screen(
    '5.24. Khách hàng và lịch sử mua',
    'Quản lý hồ sơ ngắn gọn, lịch sử nằm trong ngữ cảnh khách.',
    [
      ['39-khach-hang', 'Danh sách khách, số đơn và giá trị đã mua.'],
      ['40-lich-su-khach', 'Lịch sử hóa đơn của khách đã chọn.'],
    ],
    'Thu ngân/admin; tạo/cập nhật khách và hỗ trợ tra cứu giao dịch.',
    'Tên, số điện thoại, email tùy chọn, trạng thái; tìm kiếm và mở lịch sử.',
    'Thông tin khách, số đơn, giá trị; danh sách hóa đơn có customerId tương ứng.',
    'Lưu khách mới kiểm tra điện thoại; POS chọn theo tiền tố. Ngừng hoạt động ngăn gán mới không xóa hóa đơn cũ.',
    'Số điện thoại sai dạng hoặc trùng sau chuẩn hóa bị từ chối. Không tự ghép lịch sử hai khách chỉ vì tên giống nhau.',
    'Điện thoại là khóa tra cứu quen thuộc nhưng vẫn là dữ liệu cá nhân. Triển khai thật cần phân quyền đọc, mục đích sử dụng và chính sách lưu giữ; không đưa dữ liệu khách thật vào ảnh/bản sao lưu công khai của đồ án.',
  );
  screen(
    '5.25. Nhân viên và phân quyền',
    'Quản trị trách nhiệm vận hành theo tài khoản.',
    '41-nhan-vien',
    'Admin quản lý; các vai trò còn lại không có quyền trang này.',
    'Tên, tài khoản, mật khẩu mới khi cần, vai trò và trạng thái.',
    'Danh sách người vận hành, vai trò, tên tài khoản và hoạt động/khóa.',
    'Tạo/sửa hồ sơ; để trống mật khẩu khi sửa để giữ giá trị hiện có. Không được tự hạ quyền hoặc khóa admin đang dùng; phải giữ ít nhất một admin hoạt động.',
    'Trùng tên đăng nhập, định dạng không hợp lệ, mật khẩu quá ngắn hoặc loại bỏ admin cuối bị chặn.',
    'Vai trò được gắn với quyền và dấu vết trên chứng từ, không chỉ nhãn màu. Tuy vậy, cách lưu tài khoản hiện tại là mẫu cục bộ; việc bảo vệ mật khẩu, phân quyền máy chủ và quản lý phiên là điều kiện bắt buộc của phiên bản triển khai thật.',
  );
  screen(
    '5.26. Báo cáo và đối soát cuối tháng',
    'Giải thích khoản trừ thiếu bằng phiếu và giá chụp theo thời điểm.',
    '35-doi-soat-thang',
    'Admin; xem số tổng hợp và kiểm tra căn cứ hao hụt.',
    'Tháng đối soát, kỳ báo cáo, nút CSV và mở phiếu kiểm kê liên quan.',
    'Số thu hóa đơn, điều chỉnh lịch sử, thiếu đã duyệt, thu sau hao hụt; chi tiết phiếu/lô/SL/giá trị.',
    'Đổi tháng tính theo múi giờ Việt Nam và ngày duyệt; chỉ approved mới có khoản trừ. Xuất CSV theo dữ liệu kỳ.',
    'Phiếu đếm hoặc chờ duyệt không được trừ trước. Hàng dư không tự tăng số thu; không lấy giá hiện tại thay giá chụp khi mở kiểm kê.',
    'Phân tách chỉ tiêu bảo đảm báo cáo quản trị không làm sai số gốc trên hóa đơn. Thu sau hao hụt chưa phải lợi nhuận; các khoản thuế, công nợ, chi phí và bút toán kế toán đầy đủ chưa được mô hình hóa trong đồ án này.',
  );
  screen(
    '5.27. Đề xuất chi nhánh',
    'Chức năng mở rộng được mô tả đúng mức đã triển khai.',
    '42-chi-nhanh',
    'Admin; xem chi nhánh đang có và đề xuất địa điểm mới.',
    'Thông tin địa điểm/vùng và yêu cầu kiểm tra khả năng cung ứng theo dữ liệu NCC.',
    'Thông tin chi nhánh hiện tại, kho liên kết, vùng đối tác và kết quả đề xuất.',
    'Kiểm tra điều kiện vùng trước khi lưu đề xuất; không mặc nhiên tạo một cửa hàng có tồn riêng và đồng bộ vận hành.',
    'Vùng không có NCC phù hợp cần bổ sung hoặc xem lại đề xuất; không thông báo đã mở chi nhánh kinh doanh hoàn chỉnh.',
    'Giữ chữ “đề xuất” giúp tránh phóng đại phạm vi. Bản hiện tại chưa giải quyết điều chuyển liên kho, quyền theo chi nhánh, phân bổ đơn hay đối soát hợp nhất. Các phần này thuộc định hướng nâng cấp kiến trúc sau đồ án.',
  );
  screen(
    '5.28. Cấu hình và sao lưu',
    'Tách thông tin cửa hàng với thao tác bảo toàn dữ liệu.',
    '43-cau-hinh',
    'Admin; thiết lập dữ liệu in hóa đơn và lưu/khôi phục dữ liệu mẫu.',
    'Tên, địa chỉ, liên hệ, thuế, thông tin thanh toán; chọn tệp sao lưu hoặc tải JSON.',
    'Cấu hình đang dùng, thông báo lưu, bản tải và kết quả kiểm tra tệp khôi phục.',
    'Lưu ảnh hưởng giao dịch mới; chứng từ cũ giữ thông tin đã chụp. Khôi phục phải kiểm cấu trúc và tổng tồn lô trước khi thay.',
    'Tệp không hợp lệ, sai tổng, thiếu admin hoặc lỗi lưu bị báo; không thay dữ liệu dở dang.',
    'Sao lưu tạo một bản dữ liệu có thể mang thông tin khách và tài khoản thử; do đó cần quản lý tệp như dữ liệu nhạy cảm nếu dùng với dữ liệu thật. Bản sao JSON không được gọi là mã hóa, sao lưu đám mây hoặc phục hồi thảm họa đầy đủ.',
  );
  screen(
    '5.29. Thích ứng điện thoại và máy tính bảng',
    'Duy trì khả năng thao tác trên chiều rộng khác nhau.',
    [
      ['44-pos-mobile', 'POS ở khung 390×844 CSS px.'],
      ['45-kho-tablet', 'Kho ở khung 768×1024 CSS px.'],
    ],
    'Các vai trò theo quyền; chủ yếu dùng máy tính tại quầy, có tình huống xem/ghi trên màn hình nhỏ.',
    'Menu thu gọn, cuộn trang/bảng, các điều khiển chọn và nhập giống bản lớn.',
    'Các khối được xếp lại theo breakpoint; thông tin không bị đổi nghĩa khi chuyển kích thước.',
    'Ở màn hình nhỏ ưu tiên nội dung và nút có nhãn; bảng nhiều cột có vùng cuộn riêng thay vì kéo rộng cả trang.',
    'Tránh đè nút xác nhận, tràn ngang toàn trang hoặc mất trường bắt buộc. Một số bảng cần cuộn và vẫn phải được thử với dữ liệu dài.',
    'Ảnh chứng minh bố cục ở các kích thước đã chụp, không chứng minh đã hỗ trợ mọi thiết bị. Cần thử thêm bàn phím ảo, zoom, hệ điều hành, hướng màn hình và các phương thức nhập thực của nhân viên.',
  );
};
