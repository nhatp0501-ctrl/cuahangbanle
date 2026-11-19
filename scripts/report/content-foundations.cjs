'use strict';
module.exports = function ({ page, p, h, t, b, n, f, flow }) {
  page('MỞ ĐẦU', 'Tóm tắt báo cáo', 'Thiết kế giao diện gắn với tính đúng đắn của nghiệp vụ.', [
    p(
      'RetailFlow là đồ án giao diện hệ thống quản lý cửa hàng bán lẻ hàng tiêu dùng, phát triển từ hai mẫu pt và pttk. Báo cáo này đặc tả phiên bản hiện hành sau các vòng hiệu chỉnh nghiệp vụ: quản lý hàng theo lô và hạn dùng; nhiều chương trình khuyến mãi trên các mặt hàng khác nhau; thanh toán đủ một lần; đề nghị nhập hàng do kho lập và admin kiểm duyệt; kiểm kê có đối chiếu hóa đơn, đếm lại và ghi nhận hao hụt cuối tháng.',
    ),
    p(
      'Trọng tâm thiết kế là giúp người vận hành nhận biết trạng thái công việc, nhập đúng dữ liệu và hiểu hệ quả của thao tác trước khi xác nhận. Dữ liệu minh họa gồm 186 sản phẩm với ảnh bao bì thực tế, ba vai trò và các bộ chứng từ mẫu. Ảnh trong báo cáo được chụp từ ứng dụng chạy với hồ sơ thử riêng, không lấy từ bản thiết kế cũ.',
    ),
    p(
      'Phương pháp thực hiện gồm khảo sát mã nguồn, đối chiếu yêu cầu đã thống nhất, đặc tả D1–D2 và biến cố theo tài liệu môn học, chụp bằng chứng giao diện, chạy kiểm thử tự động và phân tích giới hạn. Đánh giá hiện tại là kiểm tra kỹ thuật và rà soát theo tiêu chí thiết kế; chưa phải nghiên cứu khả dụng có người tham gia hay chứng nhận tuân thủ khả năng tiếp cận.',
    ),
    n(
      'Kết quả và phạm vi',
      'Bản giao diện đã thực thi được các luồng nghiệp vụ trong trình duyệt. Hệ thống vẫn dùng localStorage, tài khoản thử và xác nhận thanh toán thủ công; chưa có máy chủ xác thực, cơ sở dữ liệu dùng chung hoặc cổng nhà cung cấp. Không quy đổi kết quả kiểm thử chức năng thành bằng chứng về độ an toàn triển khai thực tế.',
    ),
    t(
      ['Thông tin', 'Giá trị'],
      [
        [
          'Phiên bản khảo sát',
          'Mã nguồn ae5a928; nghiệp vụ giao diện v3, cập nhật ngày 19/11/2026.',
        ],
        [
          'Ngôn ngữ và nền tảng',
          'Tiếng Việt; HTML, CSS, JavaScript; Node.js phục vụ tệp và kiểm thử.',
        ],
        ['Bộ tài liệu', 'Báo cáo PDF, Word, HTML; ảnh chụp, nội dung nguồn và kết quả kiểm thử.'],
      ],
    ),
  ]);
  page(
    'MỞ ĐẦU',
    'Thông tin, quy ước và cách đọc',
    'Phân biệt thiết kế đã triển khai, kiểm chứng và định hướng phát triển.',
    [
      t(
        ['Ký hiệu', 'Diễn giải'],
        [
          ['D1', 'Dữ liệu người dùng đưa vào giao diện.'],
          ['D2', 'Dữ liệu, kết quả xử lý và thông báo giao diện trả lại.'],
          [
            'D3 / D4',
            'Dữ liệu đọc từ và ghi về kho lưu trữ trong sơ đồ phân tích; hiện lưu cục bộ.',
          ],
          [
            'POS / SKU',
            'Điểm bán hàng; mã phân biệt một mặt hàng. SKU không tự đồng nhất với mã EAN.',
          ],
          ['NCC / HSD', 'Nhà cung cấp; hạn sử dụng.'],
          ['FEFO', 'Xuất trước lô còn hạn có ngày hết hạn sớm hơn.'],
          ['Admin / kho / thu ngân', 'Ba vai trò thao tác trong phạm vi bản thử.'],
          [
            'Hao hụt quản trị',
            'Khoản thiếu vật lý đã duyệt quy đổi theo giá bán chụp lúc mở kiểm kê.',
          ],
        ],
      ),
      h('Quy ước trạng thái bằng chứng'),
      p(
        '“Đã triển khai” chỉ hành vi có trong mã nguồn và quan sát được. “Đã kiểm thử” chỉ tình huống có kết quả thực thi trong các tệp bằng chứng. “Đề xuất” là hướng cải tiến chưa được xem là chức năng sẵn có. Các ảnh, số lượng và ví dụ giao dịch là dữ liệu mẫu phục vụ thuyết minh.',
      ),
      h('Quy ước đặc tả màn hình'),
      p(
        'Mỗi màn hình được xác định theo mục đích, đối tượng có quyền, dữ liệu nhập D1, dữ liệu hiển thị D2 và biến cố cần xử lý. Với thao tác làm thay đổi tồn hoặc giá trị quản trị, báo cáo bổ sung tiền điều kiện, hậu điều kiện và tình huống từ chối.',
      ),
      n(
        'Đối tượng sử dụng báo cáo',
        'Giảng viên có thể đọc chương yêu cầu và ma trận truy vết trước; người bảo trì đọc chương kiến trúc, đặc tả tương tác và phụ lục cấu trúc mã nguồn. Thông tin trường, giảng viên và sinh viên trên bìa được để trống nếu chưa được cung cấp, không tự suy đoán danh tính.',
      ),
    ],
  );
  page(
    'CHƯƠNG 1',
    '1.1. Bài toán và lý do chọn đề tài',
    'Giao diện phải giúp vận hành đúng, đặc biệt ở các tình huống ngoại lệ.',
    [
      p(
        'Hoạt động của cửa hàng tiêu dùng gồm nhiều công việc liên tiếp nhưng có mục đích khác nhau: bán nhanh tại quầy, nhận biết hàng sắp hết hoặc cận date, đặt hàng đúng nhà cung cấp, kiểm tra hàng được giao và xác minh chênh lệch khi kiểm kê. Nếu các công việc này dùng chung một thao tác “lưu” không phân biệt, người dùng có thể hiểu nhầm rằng lập yêu cầu đã đồng nghĩa với nhập kho, hoặc đếm lệch đã đồng nghĩa với điều chỉnh sổ.',
      ),
      p(
        'Các vấn đề được giải quyết trong đồ án xuất phát từ quá trình hoàn thiện yêu cầu: danh sách mẫu quá ngắn; biểu tượng không đủ gần với hàng thật; chọn khách bằng danh sách kéo dài; ưu đãi chưa mô tả đủ điều kiện; thiếu phân biệt lượng đặt với lượng thực nhận; và kiểm kê mới thể hiện chênh lệch mà chưa có lộ trình đối chiếu, đếm lại, kiểm duyệt.',
      ),
      t(
        ['Vấn đề vận hành', 'Hướng thiết kế'],
        [
          ['Nhận nhầm mặt hàng', 'Ảnh bao bì thật, tên và dung tích; giữ mã sản phẩm duy nhất.'],
          [
            'Bỏ sót ưu đãi của mặt hàng khác',
            'Hiện gợi ý theo sản phẩm; tính nhiều chương trình và liệt kê từng khoản.',
          ],
          ['Nhập kho vượt quyền', 'Kho gửi yêu cầu và biên bản; admin duyệt trước khi cộng tồn.'],
          [
            'Không rõ cách xử lý lệch kiểm kê',
            'Cảnh báo → lọc hóa đơn → xác nhận đối chiếu → chốt đếm lại → admin duyệt.',
          ],
          [
            'Báo cáo khó giải thích',
            'Tách số thu gốc, điều chỉnh lịch sử và khoản thiếu đã duyệt.',
          ],
        ],
      ),
      h('Giá trị của đề tài'),
      p(
        'Đề tài cho thấy cách chuyển quy tắc nghiệp vụ thành điều kiện giao diện, thay vì chỉ bố trí các thành phần nhìn giống một phần mềm quản lý. Tính hợp lý được đánh giá thông qua các kịch bản cụ thể, dữ liệu lưu và các ràng buộc được kiểm tra trong lớp nghiệp vụ.',
      ),
    ],
  );
  page(
    'CHƯƠNG 1',
    '1.2. Mục tiêu, đối tượng và phạm vi',
    'Tập trung vào một cửa hàng và ba nhóm người vận hành.',
    [
      t(
        ['Nhóm mục tiêu', 'Nội dung kiểm chứng'],
        [
          [
            'Đúng đắn',
            'Tổng tiền nguyên đồng; không giảm sai phạm vi; không bán lô bị chặn; không cộng tồn khi chưa duyệt.',
          ],
          [
            'Tiện dụng',
            'Tìm khách theo tiền tố điện thoại, chọn số lượng trực tiếp, gợi ý ưu đãi và hàng sắp hết.',
          ],
          [
            'Nhận biết trạng thái',
            'Màu kết hợp nhãn; bước xử lý rõ; nút không phù hợp bị khóa hoặc không xuất hiện.',
          ],
          [
            'Khả năng bảo trì',
            'Tách quy tắc nghiệp vụ, dựng giao diện và xử lý sự kiện; chia file theo chủ đề.',
          ],
          [
            'Khả năng đánh giá',
            'Có đặc tả, bằng chứng ảnh, kiểm thử, ma trận truy vết và giới hạn được công bố.',
          ],
        ],
      ),
      h('Phạm vi hiện thực'),
      p(
        'Ứng dụng hỗ trợ đăng nhập thử; tổng quan; POS; sản phẩm; hóa đơn; kho, lô và kiểm kê; nhập hàng; nhà cung cấp; khách hàng; nhân viên; voucher và chương trình; báo cáo; đề xuất chi nhánh; cấu hình và sao lưu. Có 13 trang nghiệp vụ sau đăng nhập, cộng màn hình đăng nhập. Vai trò quản trị thấy toàn bộ; thu ngân và kho chỉ thấy các trang thuộc phạm vi của mình.',
      ),
      h('Ngoài phạm vi'),
      p(
        'Không mô tả việc gửi đơn trực tiếp sang hệ thống NCC, thu tiền thực qua ngân hàng, lập hóa đơn điện tử hợp pháp, quản trị chuỗi nhiều cửa hàng có đồng bộ tức thời hoặc tính lợi nhuận kế toán. Phân hệ trả hàng đã được loại khỏi phiên bản hiện hành; chứng từ cũ chỉ còn để giữ số liệu lịch sử.',
      ),
      n(
        'Giới hạn nghiên cứu',
        'Đây là đồ án thiết kế và hiện thực giao diện có xử lý nghiệp vụ cục bộ. Chưa tiến hành khảo sát định lượng tại cửa hàng thật; không đưa ra số liệu thời gian thao tác, mức hài lòng hoặc hiệu quả kinh doanh nếu chưa đo.',
      ),
    ],
  );
  page(
    'CHƯƠNG 1',
    '1.3. Phương pháp và cơ sở khảo sát',
    'Sử dụng nhiều loại bằng chứng để tránh mô tả sai hiện trạng.',
    [
      t(
        ['Bước', 'Cách thực hiện', 'Sản phẩm'],
        [
          [
            '1. Khảo sát nguồn',
            'Đọc pt, pttk và mã RetailFlow hiện tại; xem tài liệu môn học.',
            'Danh sách năng lực kế thừa và yêu cầu điều chỉnh.',
          ],
          [
            '2. Chốt nghiệp vụ',
            'Đối chiếu các yêu cầu bán hàng, giảm giá, nhập và kiểm kê.',
            'Quy tắc BR và tiêu chí chấp nhận.',
          ],
          [
            '3. Phân tích tương tác',
            'Xác định tác nhân, trạng thái, D1/D2 và biến cố.',
            'Luồng công việc và đặc tả màn hình.',
          ],
          [
            '4. Quan sát thực thi',
            'Chạy hồ sơ riêng, chụp màn hình với dữ liệu mẫu có kiểm soát.',
            'Ảnh chụp và thông tin môi trường.',
          ],
          [
            '5. Kiểm chứng',
            'Chạy bộ kiểm thử nghiệp vụ và kiểm thử Edge.',
            'Nhật ký và số lượng ca đạt/thất bại.',
          ],
          [
            '6. Đánh giá',
            'So sánh hiện trạng với tiêu chí; nêu điểm chưa được đo.',
            'Hạn chế và lộ trình hoàn thiện.',
          ],
        ],
      ),
      p(
        'Hai mẫu ban đầu được dùng như đầu vào khảo sát chức năng, không phải bằng chứng cho toàn bộ chất lượng của bản hiện tại. Những phần không phù hợp với bối cảnh hàng tiêu dùng được điều chỉnh: loại hàng pha chế/photobooth mẫu cũ khỏi danh mục đang bán, bỏ trả hàng, bổ sung lô và HSD, tổ chức lại nhà cung cấp và thay cách xử lý kiểm kê.',
      ),
      p(
        'Tài liệu “Thiết kế giao diện.pdf” do người dùng cung cấp là cơ sở môn học cho việc phân tách nhập liệu, kết xuất và tương tác; các trang 3–4, 17–28, 30–37 và 58 được đối chiếu trong báo cáo [1]. Các hướng dẫn bên ngoài chỉ bổ sung góc nhìn đánh giá; không được dùng để tuyên bố hệ thống đã đạt một tiêu chuẩn chỉ qua quan sát.',
      ),
      n(
        'Nguồn dữ liệu',
        'Giá bán, giá vốn, tồn và hạn dùng khởi tạo là minh họa. Ảnh bao bì và tên hàng có bảng nguồn riêng. Các NCC dạng đại lý là hồ sơ mẫu; việc phân nhóm theo thương hiệu không khẳng định có hợp đồng phân phối thật.',
      ),
    ],
  );
  page(
    'CHƯƠNG 2',
    '2.1. Cơ sở thiết kế D1–D2 và đối thoại',
    'Áp dụng khung của tài liệu giảng dạy vào sản phẩm cụ thể.',
    [
      p(
        'Tài liệu môn học yêu cầu mô tả nội dung, hình thức trình bày và biến cố khi người dùng trao đổi với phần mềm [1, tr. 4]. Vì vậy, một đặc tả giao diện phải trả lời được: người dùng nhập gì, nhìn thấy gì, bấm nút nào, điều kiện nào khiến hệ thống chấp nhận và người dùng sửa lỗi ở đâu.',
      ),
      t(
        ['Lớp thiết kế', 'Áp dụng trong đồ án'],
        [
          [
            'Ngữ nghĩa',
            'Tên “Yêu cầu nhập”, “Biên bản thực nhận” và “Duyệt điều chỉnh” thể hiện các nghiệp vụ riêng, không gộp thành một thao tác nhập hàng.',
          ],
          [
            'Cú pháp đối thoại',
            'Trình tự có điều kiện: kho gửi → admin duyệt → kho khai thực giao → admin chốt; không bỏ qua bước.',
          ],
          [
            'Từ vựng và hình thức',
            'Nhãn tiếng Việt, biểu tượng đi kèm chữ, màu nhất quán và đơn vị đồng/sản phẩm.',
          ],
          [
            'Giao diện nhập',
            'Số lượng nguyên, lựa chọn NCC và sản phẩm có ràng buộc; giá trị tính toán không yêu cầu người dùng nhập lại.',
          ],
          [
            'Giao diện xuất',
            'Hóa đơn chi tiết, số tiền từng ưu đãi, bảng đối soát tháng và thông tin nguồn chứng từ.',
          ],
        ],
      ),
      h('Tính nhất quán và tính ngữ cảnh'),
      p(
        'Các trang 17–28 và 30–37 của tài liệu nhấn mạnh tính dễ dùng, nhất quán, hạn chế thao tác thừa, phản hồi lỗi và lựa chọn hình thức kết xuất [1]. Trong RetailFlow, nguyên tắc này được chuyển thành các quyết định: lọc đúng hóa đơn theo mã hàng đang kiểm kê; tự sinh mã giao dịch; khóa nút duyệt theo vai trò và trạng thái; giữ lại số đặt gốc khi nhận thiếu hoặc dư.',
      ),
      n(
        'Không đồng nhất tài liệu và sản phẩm',
        'Các hướng dẫn về hoàn tác, trợ giúp hoặc khả năng tùy biến không được xem là đã đáp ứng đầy đủ chỉ vì có hộp thoại xác nhận. Báo cáo chỉ ra các phần còn thiếu ở chương đánh giá.',
      ),
    ],
  );
  page(
    'CHƯƠNG 2',
    '2.2. Tiêu chí đánh giá giao diện',
    'Kết hợp yêu cầu môn học và hướng dẫn khả dụng.',
    [
      p(
        'Báo cáo dùng một tập tiêu chí rà soát, không dùng bảng tự chấm điểm thay cho nghiên cứu người dùng. Hướng dẫn của Nielsen hỗ trợ kiểm tra phản hồi trạng thái, tính quen thuộc, nhất quán và khả năng phòng lỗi [4]. Bảng dưới đây diễn giải ngắn các tiêu chí liên quan trực tiếp đến các luồng của đồ án.',
      ),
      t(
        ['Tiêu chí', 'Câu hỏi đánh giá', 'Dấu hiệu trên giao diện'],
        [
          [
            'Nhìn thấy trạng thái',
            'Người dùng có biết công việc đang ở bước nào?',
            'Nhãn chờ duyệt, nhận thiếu, đã duyệt; phần đếm lại.',
          ],
          [
            'Ngôn ngữ nghiệp vụ',
            'Tên gọi có giúp phân biệt ý nghĩa thao tác?',
            'Đặt, thực giao, không đạt, duyệt nhập được ghi riêng.',
          ],
          [
            'Phòng sai sót',
            'Có chặn dữ liệu hoặc bước không hợp lệ?',
            'Không bán lô bị chặn; không thanh toán thiếu.',
          ],
          [
            'Gợi nhớ bằng nhận biết',
            'Có phải nhớ dữ liệu từ màn hình khác?',
            'Gợi ý khách, chương trình, tồn và hóa đơn liên quan.',
          ],
          [
            'Phản hồi lỗi',
            'Thông báo có chỉ cách sửa?',
            'Nêu thiếu tiền, thiếu giải trình hoặc sai NCC.',
          ],
          [
            'Kiểm soát thao tác',
            'Có thể rời hộp thoại và quay về ngữ cảnh?',
            'Đóng, quay lại phiếu; không tự điều chỉnh tồn.',
          ],
        ],
      ),
      h('Từ tiêu chí đến tiêu chí chấp nhận'),
      p(
        'Mỗi tiêu chí được gắn với một kịch bản quan sát được. Ví dụ “thông tin phù hợp ngữ cảnh” được kiểm bằng việc danh sách đối chiếu chỉ có hóa đơn chứa đúng mã hàng, thay vì đánh giá cảm tính rằng bảng “dễ hiểu”. Các tiêu chí cần người dùng thật, như tốc độ học và tỷ lệ nhầm sản phẩm, được để thành kế hoạch đánh giá tiếp theo.',
      ),
      n(
        'Phương pháp đánh giá',
        'Phần kiểm thử tự động chứng minh tính đúng của các tình huống đã chạy. Nó không tự chứng minh mọi thao tác thuận tiện hoặc mọi người dùng đều hiểu cùng một nhãn.',
      ),
    ],
  );
  page(
    'CHƯƠNG 2',
    '2.3. Khả năng tiếp cận và an toàn thông tin',
    'Tiêu chí tham chiếu được tách khỏi tuyên bố tuân thủ.',
    [
      t(
        ['Nhóm', 'Đối chiếu và hiện trạng'],
        [
          [
            'Khả năng nhận biết',
            'Màu có nhãn chữ; lỗi có nội dung; biểu tượng tác vụ có tên hoặc nhãn hỗ trợ. Các biểu đồ cần được kiểm thêm với công nghệ hỗ trợ.',
          ],
          [
            'Bàn phím',
            'Có viền focus, phím tắt một số tác vụ và cơ chế dialog; chưa có bằng chứng thử đầy đủ bằng trình đọc màn hình.',
          ],
          [
            'Kích thước đích bấm',
            'W3C WCAG 2.2, tiêu chí 2.5.8 quy định đích bấm tối thiểu 24×24 CSS px hoặc các ngoại lệ/khoảng cách thích hợp [5]. Nút chính của bản hiện tại được tăng kích thước; chưa đo toàn bộ đích bấm.',
          ],
          [
            'Màu và độ tương phản',
            'WCAG 2.2 là tiêu chí tham chiếu cho việc kiểm tra tương phản và focus [5]. Báo cáo chưa công bố một kết quả đo đủ để kết luận đạt mức AA.',
          ],
          [
            'Lưu trữ cục bộ',
            'localStorage không thay thế kho dữ liệu có xác thực máy chủ. Hướng dẫn OWASP yêu cầu thận trọng với dữ liệu nhạy cảm trong bộ nhớ trình duyệt và nguy cơ XSS [6].',
          ],
        ],
      ),
      p(
        'Mô hình phân quyền hiện tại giúp mô phỏng đúng quy trình thao tác, nhưng kiểm tra vai trò phía trình duyệt có thể bị người kiểm soát môi trường chạy sửa đổi. Tài khoản và mật khẩu thử không phù hợp cho hệ thống vận hành thật. Báo cáo đánh giá giao diện phân vai trong phạm vi đồ án, không gọi đây là một cơ chế bảo mật hoàn chỉnh.',
      ),
      h('Yêu cầu khi triển khai thực tế'),
      b([
        'Đưa xác thực và phân quyền đến máy chủ, băm mật khẩu và giới hạn phiên.',
        'Bảo vệ dữ liệu khách hàng; không đưa bản sao lưu chứa dữ liệu thật vào kho mã nguồn công khai.',
        'Kiểm tra bàn phím, trình đọc màn hình, tương phản và nội dung thông báo lỗi bằng công cụ và người dùng phù hợp.',
      ]),
      n(
        'Giới hạn kết luận',
        'Không sử dụng các cụm “đạt WCAG”, “an toàn tuyệt đối” hoặc “đáp ứng đầy đủ thực tế” nếu chưa có kiểm định tương ứng. Các mục này là căn cứ lựa chọn và kế hoạch hoàn thiện.',
      ),
    ],
  );
};
