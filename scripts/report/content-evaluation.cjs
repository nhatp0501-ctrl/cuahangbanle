'use strict';
module.exports = function ({ page, p, h, t, b, n, flow, evidence }) {
  page(
    'CHƯƠNG 6',
    '6.1. Kế hoạch và môi trường kiểm thử',
    'Kiểm tra từ quy tắc nghiệp vụ đến tương tác và tệp báo cáo.',
    [
      t(
        ['Thành phần', 'Môi trường / phương pháp'],
        [
          [
            'Mã nguồn khảo sát',
            'ae5a928; hồ sơ mẫu độc lập, không dùng dữ liệu trình duyệt của người vận hành.',
          ],
          [
            'Nghiệp vụ',
            'Node.js ' +
              (evidence.unit?.node || 'v24.21.0') +
              '; node --test --test-reporter=spec tests/store.test.js.',
          ],
          [
            'Giao diện',
            'Microsoft Edge Headless qua DevTools Protocol; thao tác và assertion trong tests/browser.cjs.',
          ],
          [
            'Kích thước',
            'Desktop 1440×1050; điện thoại 390×844; máy tính bảng 768×1024 CSS px khi chụp. Kiểm thử luồng hiện có dùng desktop và điện thoại.',
          ],
          ['Dữ liệu', '186 mặt hàng hoạt động, 10 nhóm; các lô có HSD minh họa; ba tài khoản thử.'],
          [
            'Tài liệu',
            'Kiểm nội dung nguồn, ảnh tồn tại, font Unicode, phân trang, tràn nội dung và tệp Word/PDF.',
          ],
        ],
      ),
      h('Lý do kết hợp các mức kiểm tra'),
      p(
        'Kiểm thử lớp nghiệp vụ kiểm tra tính toán và trạng thái mà không phụ thuộc bố cục. Kiểm thử trình duyệt phát hiện tình huống nút đúng về mã nhưng người dùng không hoàn tất được biểu mẫu, hoặc thông tin không xuất hiện đúng ngữ cảnh. Kiểm tài liệu bảo đảm bằng chứng được trình bày đọc được, nhưng không thay thế hai mức kiểm thử trước.',
      ),
      p(
        'Dữ liệu thử được khởi tạo mới và các biến cố được thực hiện có kiểm soát. Một phần ảnh được chuẩn bị trạng thái bằng lời gọi nghiệp vụ để minh họa; hành vi bấm nút được kiểm riêng trong bộ Edge. Không gọi toàn bộ ảnh chụp là bằng chứng thử thao tác bằng tay.',
      ),
      n(
        'Tiêu chí dừng',
        'Bộ nghiệp vụ có mã thoát thành công, không có ca thất bại; bộ Edge không có assertion hoặc lỗi JavaScript ngoài dự kiến; tài liệu không tràn trang, không thiếu ảnh và có đủ phần giới hạn/kết luận.',
      ),
    ],
  );
  page(
    'CHƯƠNG 6',
    '6.2. Kết quả kiểm thử nghiệp vụ',
    'Kết quả chạy lại được lưu cùng báo cáo, không chỉ ghi nhận bằng lời.',
    [
      t(
        ['Bộ kiểm thử', 'Số ca', 'Phạm vi', 'Kết quả'],
        [
          [
            'sales-v2.test.cjs',
            '14',
            'Danh mục, di trú, thanh toán, FEFO, voucher, đơn tạm, lỗi lưu.',
            'Đạt',
          ],
          [
            'purchasing-v2.test.cjs',
            '8',
            'Quyền duyệt, thiếu/dư, hàng không đạt, từ chối, nguyên khối.',
            'Đạt',
          ],
          [
            'stock-counts-v2.test.cjs',
            '3',
            'Khóa phạm vi, gửi đếm, duyệt/đếm lại và phần cách ly.',
            'Đạt',
          ],
          [
            'workflows-v3.test.cjs',
            '7',
            'Mức giảm tối thiểu, nhóm/lô, NCC, chênh lệch, tháng và di trú.',
            'Đạt',
          ],
          [
            'review-fixes.test.cjs',
            '9',
            'Nhiều KM, trần/ngưỡng, phân bổ tiền, hóa đơn và đúng thương hiệu.',
            'Đạt',
          ],
        ],
      ),
      t(
        ['Chỉ số', 'Giá trị từ lần chạy'],
        [
          ['Tổng ca', String(evidence.unit?.counts?.tests || 41)],
          [
            'Đạt / thất bại',
            String(evidence.unit?.counts?.pass || 41) +
              ' / ' +
              String(evidence.unit?.counts?.fail || 0),
          ],
          ['Ngày kiểm chứng', '19/11/2026; thời điểm ISO lưu trong ket-qua-nghiep-vu.json.'],
          ['Tệp nhật ký', 'kiem-thu-nghiep-vu.txt và ket-qua-nghiep-vu.json.'],
        ],
      ),
      h('Diễn giải kết quả'),
      p(
        'Các ca đạt chứng minh các kỳ vọng đã mã hóa đúng với những dữ liệu được thử. Ví dụ, phiếu nhiều dòng gặp lỗi ở dòng sau không để lô của dòng trước đã được lưu dở; thao tác thanh toán lặp cùng khóa không làm giảm tồn hai lần; phần giảm của một SKU không được dồn sai số làm âm giá trị dòng.',
      ),
      n(
        'Không suy rộng độ bao phủ',
        'Số lượng 41 ca không tương đương bao phủ 100% dòng lệnh, nhánh hoặc mọi tổ hợp dữ liệu. Báo cáo không có số đo coverage hoặc kiểm chứng hình thức; các giới hạn này phải được giữ rõ khi nhận xét kết quả.',
      ),
    ],
  );
  page(
    'CHƯƠNG 6',
    '6.3. Kịch bản giao diện và truy vết',
    'Các yêu cầu quan trọng có đầu vào, kết quả và bằng chứng tương ứng.',
    [
      t(
        ['Yêu cầu', 'Kịch bản và kỳ vọng', 'Bằng chứng'],
        [
          [
            'FR02–03',
            'Chọn số lượng trước thêm; sửa lượng; gợi ý điện thoại chọn đúng khách.',
            'Edge: quantity chooser, cart edit, live phone lookup.',
          ],
          [
            'FR04',
            'Hai SKU có hai KM 5.000đ và 3.000đ → tổng giảm 8.000đ.',
            'Edge: multi-programme; giỏ và hóa đơn giữ hai khoản.',
          ],
          [
            'FR04–05',
            'Chọn nhiều checkbox; voucher đối tác không giảm hàng ngoài NCC.',
            'Edge + review-fixes và sales-v2.',
          ],
          [
            'FR06',
            'Tiền mặt thiếu không có hóa đơn; thẻ/chuyển khoản xác nhận đủ; tự sinh tham chiếu.',
            'Edge + cash/transfer/card domain tests.',
          ],
          [
            'FR09–10',
            'Kho gửi, admin duyệt; nhận 6 đạt; giao dư được admin quyết định.',
            'Edge + purchasing-v2.',
          ],
          [
            'FR11',
            'Chỉ hóa đơn có SKU; click xác nhận không ghi chú vẫn lưu và mở đếm lại.',
            'Edge: invoice list + click confirm; review-fixes.',
          ],
          [
            'FR12',
            'Chỉ thiếu đã duyệt mới có khoản trừ tháng; reload giữ số liệu.',
            'Edge + month end summary tests.',
          ],
          [
            'FR13',
            'Vinamilk/Acecook đúng hàng; chặn gán sai thương hiệu.',
            'Edge + supplier repair tests.',
          ],
          [
            'FR14',
            'Tệp hợp lệ, giữ cân bằng tồn; lỗi bộ nhớ/tab khác không ghi dở.',
            'sales-v2 + kiểm tra khôi phục.',
          ],
        ],
      ),
      p(
        'Bộ trình duyệt thực hiện đăng nhập luân phiên admin, kho và thu ngân với cùng nguồn dữ liệu thử. Kiểm tra việc chỉ ẩn nút được bổ sung bằng kiểm thử quyền trong domain để tránh bỏ sót điều kiện bảo vệ ở lớp xử lý.',
      ),
      n(
        'Bằng chứng đi kèm',
        'Nhật ký kiem-thu-trinh-duyet.txt và ket-qua-trinh-duyet.json ghi lại từng assertion PASS. Ảnh minh họa có manifest thời điểm chụp và môi trường; chúng không thay cho các assertion.',
      ),
    ],
  );
  page(
    'CHƯƠNG 6',
    '6.4. Tình huống biên và phục hồi',
    'Ưu tiên thử các trường hợp có thể làm sai tiền hoặc tồn.',
    [
      t(
        ['Tình huống', 'Kết quả phải giữ', 'Cách kiểm tra'],
        [
          [
            'Hàng cùng mã nhưng khác lô',
            'Chỉ lượng đúng lô được giảm; không bán lô bị chặn.',
            'FEFO và near-date promotion tests.',
          ],
          [
            'Ưu đãi có trần chung',
            'Tính lại trên nhóm hàng thực áp dụng; không vượt trần.',
            'Shared cap/minimum-spend tests.',
          ],
          [
            'Giảm gần 100% trên nhiều dòng',
            'Tiền nguyên, tổng khớp và không vượt giá trị từng dòng.',
            'Discount allocation integer test.',
          ],
          [
            'NCC giao dư sau lần thiếu',
            'Theo dõi cộng dồn; quyết định phần dư trước nhập.',
            'Overdelivery accept/send_back tests.',
          ],
          [
            'Lô hết hạn lúc admin duyệt',
            'Không lưu một phần các dòng còn lại của phiếu.',
            'Atomic multi-line receiving test.',
          ],
          [
            'Số đếm thay sau chốt',
            'Phải xác nhận đếm lại; không dùng xác nhận cũ.',
            'Quy tắc trong inventory/reconciliation, cần mở rộng tổ hợp thử.',
          ],
          [
            'Bộ nhớ đầy / tab khác ghi',
            'Không công bố giao dịch thành công; hoàn nguyên thay đổi.',
            'Quota và stale-tab test.',
          ],
          [
            'Nâng cấp danh mục có voucher cũ',
            'Sửa liên kết sai, không mở rộng voucher ra hàng ngoại phạm vi.',
            'Legacy supplier repair test.',
          ],
        ],
      ),
      h('Điểm còn thiếu trong kiểm thử'),
      p(
        'Chưa có kiểm thử trên trình duyệt khác, kiểm thử hiệu năng đồng thời, kiểm thử bảo mật có hệ thống, khả năng tiếp cận toàn bộ hoặc thử nghiệm với dữ liệu hàng chục nghìn chứng từ. Không có API ngân hàng/NCC để kiểm thử tích hợp. Các phần này không thể suy ra từ việc các luồng Edge hiện tại chạy thành công.',
      ),
      n(
        'Ưu tiên hồi quy',
        'Mỗi lần sửa tính tiền, phân bổ lô, nhận hàng hoặc duyệt kiểm kê phải chạy lại các kiểm thử có liên quan. Sửa nội dung báo cáo không yêu cầu tạo lại nghiệp vụ nếu không làm thay hành vi ứng dụng.',
      ),
    ],
  );
  page(
    'CHƯƠNG 7',
    '7.1. Đánh giá kết quả thiết kế',
    'Đối chiếu các mục tiêu với bằng chứng và phần chưa được đo.',
    [
      t(
        ['Tiêu chí', 'Kết quả quan sát', 'Giới hạn kết luận'],
        [
          [
            'Đúng ngữ cảnh',
            'Đối chiếu chỉ hóa đơn có SKU; NCC có danh mục phù hợp; menu theo vai trò.',
            'Chưa thử danh mục thương hiệu phức tạp và dữ liệu thật.',
          ],
          [
            'Giảm nhập lặp',
            'Điện thoại gợi ý, số lượng chọn nhanh, mã tham chiếu tự sinh.',
            'Chưa đo mức giảm thời gian thao tác ngoài cửa hàng.',
          ],
          [
            'Nhận biết trạng thái',
            'Có nhãn chờ duyệt, thiếu/dư, đếm lại và thông báo kết quả.',
            'Cần kiểm chứng người mới có hiểu đúng các trạng thái.',
          ],
          [
            'Phòng lỗi',
            'Chặn thanh toán thiếu, lô không hợp lệ và duyệt ngoài quy trình.',
            'Không phải bằng chứng an toàn khi có người cố sửa môi trường chạy.',
          ],
          [
            'Giải thích số tiền',
            'Nhiều KM có khoản riêng; tháng có phiếu và giá trị thiếu.',
            'Thu sau hao hụt chưa là lợi nhuận kế toán.',
          ],
          [
            'Bảo trì',
            'Các module tách chủ đề và dùng chung quy tắc cho UI/test.',
            'Ngữ cảnh toàn cục và dựng lại DOM còn gây khó mở rộng.',
          ],
        ],
      ),
      p(
        'Kết quả nổi bật là chuyển các ngoại lệ thường gặp thành đối thoại có hướng xử lý: giao dư có lựa chọn quyết định, kiểm kê lệch có đối chiếu và đếm lại, ưu đãi có điều kiện theo lô/nhóm, và danh mục NCC có kiểm tra phạm vi. Điều này có ý nghĩa hơn việc chỉ bổ sung nhiều trang danh sách.',
      ),
      h('Nhận xét về chất lượng thẩm mỹ và thao tác'),
      p(
        'Khung thống nhất, nút màu rõ và ảnh hàng thật tạo tính liên tục. Tuy nhiên, hộp thoại nhiều dòng và giỏ dài có thể tăng cuộn; bảng nhiều cột cần kiểm tra ở mức zoom lớn. Các nhận xét này là đánh giá của người thiết kế dựa trên quan sát, không phải điểm đánh giá định lượng từ người dùng thật.',
      ),
    ],
  );
  page(
    'CHƯƠNG 7',
    '7.2. Hạn chế và kế hoạch cải tiến',
    'Ưu tiên nền tảng dữ liệu trước khi mở rộng trang chức năng.',
    [
      t(
        ['Mức ưu tiên', 'Hạn chế', 'Hướng xử lý đề xuất'],
        [
          [
            'P1',
            'Tài khoản và quyền nằm phía trình duyệt.',
            'Xác thực server, băm mật khẩu, kiểm quyền từng API, quản lý phiên và audit log.',
          ],
          [
            'P1',
            'localStorage không đồng bộ và không phải DB giao dịch.',
            'CSDL, transaction, khóa phiên kiểm kê và khóa idempotency phía server.',
          ],
          [
            'P1',
            'Danh mục NCC dựa một phần vào tên/phạm vi cấu hình.',
            'Chuẩn hóa thương hiệu, SKU và quan hệ cung ứng có hiệu lực theo thời gian.',
          ],
          [
            'P2',
            'Quyết định dư chung cả biên bản.',
            'Cho quyết định theo từng dòng và lượng dư; theo dõi chứng từ giao lại NCC.',
          ],
          [
            'P2',
            'Ghép KM chưa có chứng minh tối ưu tổng quát.',
            'Định nghĩa chính sách ưu tiên, kiểm xung đột cấu hình; thử tối ưu có ràng buộc và tập ca đối chứng.',
          ],
          [
            'P2',
            'Chưa có ngân hàng/NCC thực.',
            'Thiết kế API, xác minh trạng thái, xử lý retry/webhook và đối soát.',
          ],
          [
            'P2',
            'Chưa đánh giá với người dùng thật.',
            'Thử nhiệm vụ theo ba vai trò, đo hoàn thành/lỗi/thời gian và phỏng vấn.',
          ],
          [
            'P3',
            'Chưa kiểm định accessibility đầy đủ.',
            'Đo tương phản, đích bấm, zoom, keyboard và screen reader; sửa theo mức độ ảnh hưởng.',
          ],
        ],
      ),
      h('Kế hoạch thử khả dụng được đề xuất'),
      p(
        'Tuyển người đại diện cả ba vai trò; cho thực hiện bán có nhiều ưu đãi, nhận thiếu/dư và kiểm kê lệch. Ghi tỷ lệ hoàn thành độc lập, số lỗi cần hỗ trợ, thời gian và cách hiểu trạng thái. Chạy thử thí điểm trước khi đặt ngưỡng nghiệm thu. Không dùng số liệu giả định để báo cáo rằng hệ thống đã hiệu quả hơn sản phẩm khác.',
      ),
      n(
        'Thứ tự triển khai',
        'Không mở rộng sang nhiều chi nhánh hoặc thu tiền thực trước khi giải quyết dữ liệu dùng chung, quyền máy chủ và tính nguyên khối. Các cải tiến thẩm mỹ phải được kiểm lại cùng các luồng có rủi ro số liệu.',
      ),
    ],
  );
  page(
    'KẾT LUẬN',
    'Kết luận',
    'Thiết kế giao diện là thiết kế cách người dùng hoàn thành công việc đúng.',
    [
      p(
        'Đồ án đã xây dựng một giao diện quản lý cửa hàng bán lẻ hàng tiêu dùng với khung điều hướng thống nhất, các màn hình nghiệp vụ và quy tắc xử lý có thể thực thi trong trình duyệt. Bản báo cáo hiện tại thay thế mô tả giao diện trước đây bằng đặc tả dựa trên phiên bản mới: không còn trả hàng; nhiều chương trình được xét trên các sản phẩm khác nhau; thanh toán đủ một lần; lô/HSD và FEFO; nhập hàng có kiểm duyệt; kiểm kê gắn đối chiếu hóa đơn, đếm lại và đối soát tháng.',
      ),
      p(
        'Quá trình hoàn thiện cho thấy nhiều lỗi giao diện có bản chất nghiệp vụ: một nút “Lưu” thiếu điều kiện có thể làm sai tồn, một danh sách hóa đơn không theo SKU làm người dùng đối chiếu sai, và việc chỉ chọn một chương trình cho cả giỏ làm mất ưu đãi hợp lệ của các mặt hàng khác. Những vấn đề này cần được giải quyết đồng thời ở nhãn, trình tự đối thoại và lớp quy tắc dùng chung.',
      ),
      p(
        'Bộ kiểm thử nghiệp vụ, các luồng Edge và ảnh chụp cung cấp căn cứ kiểm tra cho phạm vi đã triển khai. Các chứng cứ chưa bao gồm đánh giá thực địa, khả năng tiếp cận đầy đủ, bảo mật hoặc hiệu năng quy mô lớn. Do đó kết quả phù hợp để trình bày và đánh giá một đồ án giao diện có xử lý nghiệp vụ, chưa đủ để khẳng định sẵn sàng vận hành thương mại.',
      ),
      h('Định hướng tiếp tục'),
      p(
        'Giai đoạn sau cần chuyển xác thực và dữ liệu lên máy chủ, chuẩn hóa quan hệ cung ứng, phát triển kiểm duyệt giao dư theo dòng, xác định rõ chính sách xung đột khuyến mãi và đánh giá với người vận hành thực tế. Việc mở rộng nên giữ nguyên nguyên tắc: hành vi có hệ quả số liệu phải minh bạch, có căn cứ và kiểm chứng được.',
      ),
      n(
        'Giá trị học thuật của báo cáo',
        'Báo cáo không dựa vào số trang hoặc số màn hình để chứng minh chất lượng. Giá trị nằm ở quan hệ truy vết từ yêu cầu đến dữ liệu, biến cố, điều kiện chuyển trạng thái, kết quả kiểm thử và các giới hạn được nhận diện.',
      ),
    ],
  );
  page(
    'TÀI LIỆU THAM KHẢO',
    'Tài liệu tham khảo',
    'Nguồn được đối chiếu ngày 19/11/2026; không suy đoán tác giả tài liệu nội bộ.',
    [
      p(
        '[1] Tài liệu môn học do người dùng cung cấp, “Thiết kế giao diện.pdf”, 58 trang. Không xác minh được tên tác giả và năm phát hành từ thông tin đã cung cấp. Trích dẫn theo số trang của bản PDF; tham khảo các trang 3–4, 17–28, 30–37 và 58.',
      ),
      p(
        '[2] Dự án RetailFlow, kho mã nguồn cuahangbanle, bản khảo sát ae5a928, 2026. https://github.com/nhatp0501-ctrl/cuahangbanle. Tài liệu nghiệp vụ: docs/QUY-TRINH-NGHIEP-VU.md; quy tắc và giao diện: src/domain, src/features, src/events.',
      ),
      p(
        '[3] Dự án RetailFlow, “Kết quả kiểm thử và bằng chứng giao diện v3”, 19/11/2026. Các tệp ket-qua-nghiep-vu.json, kiem-thu-nghiep-vu.txt, ket-qua-trinh-duyet.json, kiem-thu-trinh-duyet.txt và bang-chung-giao-dien.json trong cùng thư mục báo cáo.',
      ),
      p(
        '[4] Jakob Nielsen, “10 Usability Heuristics for User Interface Design”, Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/. Truy cập ngày 19/11/2026. Dùng làm khung rà soát, không thay nghiên cứu người dùng.',
      ),
      p(
        '[5] World Wide Web Consortium, “Web Content Accessibility Guidelines (WCAG) 2.2”. https://www.w3.org/TR/WCAG22/. Tham chiếu tiêu chí về tương phản, bàn phím, focus và kích thước đích bấm; không tuyên bố toàn bộ ứng dụng đã đạt chuẩn.',
      ),
      p(
        '[6] OWASP Cheat Sheet Series, “HTML5 Security Cheat Sheet”. https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html. Tham khảo giới hạn lưu dữ liệu nhạy cảm bằng Web Storage.',
      ),
      p(
        '[7] MDN Web Docs, “Window: localStorage property”. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage. Tham khảo cơ chế lưu dữ liệu theo nguồn và giới hạn môi trường trình duyệt.',
      ),
      p(
        '[8] Node.js Documentation, “Test runner”. https://nodejs.org/api/test.html. Tham khảo công cụ chạy kiểm thử tích hợp; phiên bản thực thi ghi trong tệp kết quả.',
      ),
      n(
        'Nguồn ảnh',
        'Ảnh màn hình: chụp từ RetailFlow với dữ liệu mẫu ngày 19/11/2026. Ảnh bao bì và URL gốc: assets/products/sources.json. Không xem nhãn hàng xuất hiện trong ảnh là sự bảo trợ hoặc hợp đồng cung cấp cho đồ án.',
      ),
    ],
  );
  page(
    'PHỤ LỤC A',
    'A. Hướng dẫn cài đặt và trình diễn',
    'Các bước có thể tái lập trên máy có Node.js và trình duyệt.',
    [
      b([
        'Mở terminal tại thư mục retailflow, chạy node server.js hoặc nhấp đúp start.cmd. Mở http://127.0.0.1:4173. Không cần cài thư viện để chạy ứng dụng chính.',
        'Dùng admin, nhanvien hoặc kho, mật khẩu thử 123456. Giữ cùng trình duyệt, địa chỉ và cổng khi luân phiên vai trò để dùng chung bộ dữ liệu cục bộ.',
        'Nếu vừa cập nhật mã: dừng/chạy lại server khi cần và Ctrl+F5. Không xóa localStorage nếu muốn giữ dữ liệu thử.',
        'Chạy npm test, npm run test:browser và npm run verify:assets để kiểm tra. Kiểm thử Edge dùng hồ sơ riêng.',
      ]),
      t(
        ['Kịch bản trình diễn', 'Bước trọng tâm'],
        [
          [
            'Bán hàng nhiều ưu đãi',
            'Chọn hai SKU thuộc hai chương trình; kiểm tên và số giảm từng khoản; chọn khách; thanh toán đủ; xem hóa đơn.',
          ],
          [
            'Nhận hàng thiếu rồi dư',
            'Kho gửi đặt 10 → admin duyệt → kho khai giao 8, không đạt 2 → admin nhập 6 → lần sau giao 6, chờ quyết định dư 2.',
          ],
          [
            'Kiểm kê thiếu',
            'Mở phiên → đếm lệch → lưu → xem hóa đơn đúng SKU → xác nhận → chốt đếm lại → gửi → admin duyệt → xem khoản trừ tháng.',
          ],
          [
            'Kiểm kê dư',
            'Đếm hơn sổ; trình bày gợi ý kiểm chứng nguồn gốc, đơn vị và phiếu nhập; không ghi dư thành số thu.',
          ],
        ],
      ),
      n(
        'Chuẩn bị trước buổi bảo vệ',
        'Kiểm lại chương trình còn hiệu lực theo ngày trình diễn, dùng lô mẫu còn hạn và ghi rõ đây là dữ liệu minh họa. Không giả giao dịch ngân hàng thật hoặc tài khoản quản trị sản xuất.',
      ),
    ],
  );
  page(
    'PHỤ LỤC B',
    'B. Từ điển trường dữ liệu giao diện',
    'Các trường thường bị hiểu nhầm cần được định nghĩa nhất quán.',
    [
      t(
        ['Trường / thuật ngữ', 'Ý nghĩa và ràng buộc'],
        [
          ['stock', 'Tồn vật lý sản phẩm; bằng tổng số vật lý các lô.'],
          [
            'saleableStock',
            'Tổng còn bán được sau loại số cách ly và lô không đủ điều kiện; không đồng nhất stock.',
          ],
          ['qty trên yêu cầu nhập', 'Lượng đề nghị/đặt gốc; giữ lại để đối chiếu dù đã nhận dư.'],
          ['actualQty', 'NCC thực giao ở lần đang khai; có thể lớn hơn phần còn đặt.'],
          ['rejectedQty', 'Trong số giao lần này, phần không đạt chất lượng; không nhập kho bán.'],
          [
            'acceptedQty',
            'Phần đạt đề nghị = actualQty − rejectedQty, chưa đồng nghĩa đã được duyệt nhập.',
          ],
          [
            'approvedQty / sentBackQty',
            'Phần được admin duyệt nhập / phần dư đạt được giao lại NCC.',
          ],
          [
            'bookQty / countedQty',
            'Mốc sổ lúc mở phiên / tổng vật lý đã đếm; số cuối có lịch sử đếm lại.',
          ],
          ['damagedQty', 'Phần hỏng/cách ly nằm trong tổng đếm; không cộng thêm ngoài countedQty.'],
          [
            'invoiceReview',
            'Người, thời gian, nội dung và tập hóa đơn đúng SKU đã được xác nhận đối chiếu.',
          ],
          [
            'lossValue / costLoss',
            'Giá trị thiếu quản trị theo giá bán chụp / giá vốn thiếu được lưu riêng.',
          ],
          [
            'checkoutKey / paymentRef',
            'Khóa chống thanh toán lặp / mã tham chiếu nội bộ HDxxxxx tự sinh.',
          ],
        ],
      ),
      n(
        'Đơn vị và thời điểm',
        'Mọi phép tính số lượng phải dùng cùng đơn vị SKU; thùng/lốc/chai khác quy cách cần quản lý rõ, không cộng tùy ý. Giá trị trên chứng từ dùng dữ liệu tại thời điểm lập/duyệt tương ứng, không tự thay bằng giá danh mục hiện tại.',
      ),
    ],
  );
  page(
    'PHỤ LỤC C',
    'C. Cấu trúc bàn giao và nguồn bằng chứng',
    'Đủ thông tin để giảng viên kiểm tra, người khác tiếp tục chỉnh sửa.',
    [
      t(
        ['Vị trí', 'Nội dung'],
        [
          [
            'src/domain',
            'Quy tắc tính tiền, ghép chương trình, HSD/FEFO, phiếu nhập, kiểm kê và đối soát.',
          ],
          [
            'src/features, src/events',
            'Các màn hình, hộp thoại, click, nhập và submit chia theo chủ đề.',
          ],
          ['tests', 'Các bộ nghiệp vụ và kiểm thử Edge; kết quả thực thi được lưu trong báo cáo.'],
          ['assets/products', '186 ảnh local, danh mục và nguồn ảnh.'],
          [
            'bao-cao/phien-ban-3',
            'Bản báo cáo mới PDF/Word/HTML, nội dung nguồn, ảnh và tệp kiểm tra.',
          ],
          ['scripts/report', 'Công cụ tạo nội dung, chụp giao diện, xuất tài liệu và kiểm tra.'],
          ['bao-cao ở cấp trên', 'Báo cáo cũ được giữ như lịch sử, không dùng thay bản v3.'],
        ],
      ),
      h('Bộ tài liệu chính'),
      p(
        'Bản PDF dùng để đọc và nộp với phân trang đã kiểm tra. Bản Word dùng chỉnh sửa thông tin bìa hoặc nội dung; mục lục trường Word có thể cần cập nhật khi thay bố cục. Bản HTML và nội dung nguồn phục vụ tái tạo tài liệu. Số trang Word có thể thay đổi theo phiên bản Office, font và thiết lập in; không gán số trang PDF cho Word một cách mặc định.',
      ),
      h('Tính tái lập'),
      p(
        'Các tệp bằng chứng ghi ngày thực thi, môi trường Node/Edge và dữ liệu mẫu. Khi tái tạo vào ngày khác, hạn dùng và hiệu lực mẫu có thể thay đổi; cần ghi lại phiên bản mã và ngày khảo sát mới. Ảnh chụp không được chỉnh thành trạng thái mà ứng dụng không tạo được.',
      ),
      n(
        'Trước khi nộp',
        'Điền thông tin trường, môn học, giảng viên và người thực hiện còn trống; kiểm tra yêu cầu mẫu bìa của đơn vị đào tạo. Nếu có sửa nội dung, tái xuất và kiểm tra mục lục, bảng/hình cùng tệp PDF cuối.',
      ),
    ],
  );
};
