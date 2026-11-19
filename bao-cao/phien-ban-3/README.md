# Báo cáo thiết kế giao diện RetailFlow — bản hiện hành

Ngày lập: **19/11/2026**. Mã nguồn khảo sát: **ae5a928**, đã bao gồm các thay đổi về nhiều chương trình khuyến mãi, danh mục đúng NCC, đối chiếu hóa đơn và quy trình kiểm duyệt. Bản này thay báo cáo thiết kế cũ ở thư mục cấp trên.

## Tài liệu chính

- [PDF đã kiểm tra phân trang](Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.pdf): **69 trang**, 7 chương, 29 đặc tả màn hình/nhóm tương tác, 39 hình và 59 bảng, tài liệu tham khảo và 3 phụ lục.
- [Word có thể chỉnh sửa](Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.docx): cùng nội dung, đề mục có cấu trúc và mục lục tự động. Khi mở hoặc sau sửa, chọn cập nhật trường; có thể nhấn Ctrl+A rồi F9. Word có thể dàn trang khác PDF.
- [HTML](Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.html): bản có thể đọc bằng trình duyệt, ảnh được nhúng, mục lục liên kết đến nội dung.
- [Nội dung nguồn](noi-dung-bao-cao-v3.json) và [thông tin bìa](thong-tin-bia.json).

Thông tin trường, khoa, môn học, giảng viên và người thực hiện chưa được cung cấp nên đang để trường điền rõ ràng. Không tự gán tên hoặc học vị. Cần điền các mục này và đối chiếu mẫu bìa của đơn vị trước khi nộp.

## Nội dung

1. Tổng quan đề tài, mục tiêu, phạm vi và phương pháp.
2. Cơ sở thiết kế theo tài liệu môn học, khả dụng, khả năng tiếp cận và an toàn thông tin.
3. Tác nhân, quyền, yêu cầu chức năng, quy tắc và dữ liệu.
4. Kiến trúc giao diện, điều hướng, hệ quy chuẩn và luồng nghiệp vụ.
5. Đặc tả màn hình: D1/D2, biến cố, điều kiện, lỗi và nhận xét thiết kế.
6. Kế hoạch, kết quả kiểm thử, truy vết và tình huống biên.
7. Đánh giá, giới hạn và định hướng hoàn thiện.

Kết luận; 8 nguồn tham khảo; phụ lục chạy thử, từ điển dữ liệu và bộ bàn giao.

## Bằng chứng và chất lượng

- `anh/`: 45 ảnh chụp mới bằng hồ sơ thử riêng; 39 ảnh được dùng trực tiếp trong báo cáo.
- `bang-chung-giao-dien.json`: ngày chụp, phiên bản Edge/Node, kích thước và số liệu dữ liệu mẫu.
- `kiem-thu-nghiep-vu.txt`, `ket-qua-nghiep-vu.json`: **41/41 ca đạt** ngày 19/11/2026.
- `kiem-thu-trinh-duyet.txt`, `ket-qua-trinh-duyet.json`: **39 kiểm tra PASS**, không có lỗi JavaScript ngoài dự kiến.
- `kiem-tra-bo-cuc-v3.json`: bố cục HTML của 69 trang PDF, không tràn.
- `kiem-tra-tai-lieu-v3.json`: kiểm đếm trang, Unicode, nội dung và cấu trúc Word.
- `van-ban-trich-xuat-pdf.json`: văn bản trích xuất để kiểm nội dung PDF.

PDF được kiểm bằng công cụ và quan sát ảnh các trang tiêu biểu. Word được kiểm cấu trúc, ảnh, Unicode và trường mục lục; chưa có kết quả xác nhận phân trang Word bằng Office trên máy này. Không gán số trang PDF làm số trang Word.

Ảnh là dữ liệu minh họa; báo cáo không tự nhận đã khảo sát thực địa, đạt WCAG, có bảo mật máy chủ hoặc kết nối ngân hàng/NCC. Các giới hạn và chính sách kế toán quản trị được phân tích trong nội dung.

## Tái tạo

Xem [hướng dẫn công cụ báo cáo](../../scripts/report/README.md). Khi thay thông tin bìa hoặc nội dung, cần xuất lại cả Word/PDF và kiểm tra bố cục lần cuối.
