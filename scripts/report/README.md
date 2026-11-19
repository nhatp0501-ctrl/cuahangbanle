# Công cụ tạo báo cáo hiện trạng

Các công cụ này không thuộc luồng vận hành ứng dụng. Dữ liệu chụp và kiểm thử dùng hồ sơ trình duyệt riêng. Cần Node.js, Microsoft Edge; Word không bắt buộc để tạo tệp DOCX.

```sh
npm install --prefix scripts/report
node scripts/report/collect-tests.cjs
node scripts/report/collect-tests.cjs --browser
node scripts/report/capture-current.cjs
node scripts/report/build-current.cjs
node scripts/report/print-current.cjs
node scripts/report/verify-current.cjs
```

Nếu Edge không ở vị trí mặc định, đặt `EDGE_PATH` trỏ tới tệp thực thi. Khi chạy trong môi trường giới hạn quyền, chụp và in qua Edge có thể cần quyền mở tiến trình ngoài sandbox.

- `content-*.cjs`: bản thảo chia theo nhóm chương.
- `content.cjs`: hợp nhất, đánh số hình/bảng và lấy kết quả kiểm thử.
- `thong-tin-bia.json` trong thư mục kết quả: thông tin cá nhân/học thuật; chỉ điền dữ liệu được chủ đồ án cung cấp.
- `build-current.cjs`: tạo Word và HTML, không nạp lại dữ liệu thật của người dùng.
- `print-current.cjs`: dàn trang, cập nhật mục lục PDF, kiểm tra tràn và xuất PDF.
- `verify-current.cjs`: kiểm PDF, văn bản Unicode, ảnh Word và trường mục lục; ảnh QA ở `preview/report-v3-qa/`.

Kết quả ở `bao-cao/phien-ban-3/`. Phiên bản khảo sát hiện cố định ae5a928 và ngày 19/11/2026; nếu khảo sát phiên bản khác, cập nhật nội dung tương ứng, không chỉ đổi ngày bìa. Nội dung report không tự suy ra hoàn toàn từ mã nguồn: cần rà soát và đánh giá trước khi tái xuất.

Word có mục lục tự động; cập nhật trường trong Word khi mở/sau thay đổi. PDF là bản đã kiểm tra số trang. Không khẳng định tệp Word có cùng phân trang với PDF chỉ qua kiểm cấu trúc ZIP/XML.
