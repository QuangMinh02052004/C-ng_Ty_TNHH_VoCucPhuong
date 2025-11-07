// File data cho bài viết tin tức
// Dễ dàng thêm, sửa, xóa bài viết mà không sợ lỗi

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    image: string;
    tags: string[];
}

export const posts: Post[] = [
    {
        id: '1',
        title: 'Xe Đồng Nai Sài Gòn: Thông tin giá vé và số điện thoại',
        slug: 'xe-dong-nai-sai-gon',
        excerpt: 'Xe Đồng Nai đi Sài Gòn Tuyến đường từ Đồng Nai đến TP. Hồ Chí Minh dài khoảng 100km, là lựa chọn phù hợp...',
        content: `
            <h2>1. Xe Đồng Nai đi Sài Gòn</h2>
            <p>Tuyến đường từ Đồng Nai đến TP. Hồ Chí Minh dài khoảng 100km, là lựa chọn phù hợp cho các hành khách cần di chuyển giữa hai thành phố lớn.</p>
            
            <h3>Giá vé:</h3>
            <ul>
                <li>Ghế ngồi: 110.000 - 120.000 VNĐ</li>
                <li>Giường nằm: 150.000 - 180.000 VNĐ</li>
            </ul>

            <h3>Thời gian di chuyển:</h3>
            <p>Khoảng 1.5 - 2 giờ tùy theo lộ trình và điều kiện giao thông.</p>

            <h3>Điểm đón trả khách:</h3>
            <ul>
                <li>Đồng Nai: Bến xe Long Khánh, Xuân Lộc</li>
                <li>Sài Gòn: Bến xe Miền Đông, các điểm trung tâm</li>
            </ul>

            <h3>Liên hệ đặt vé:</h3>
            <p>Hotline: <strong>0123 456 789</strong></p>
            <p>Hoặc đặt vé online tại website: <a href="/">xevocucphuong.com</a></p>
        `,
        author: 'Võ Cúc Phương',
        date: '2025-01-15',
        category: 'Tin tức',
        image: '/gioithieu.jpg',
        tags: ['Đồng Nai', 'Sài Gòn', 'Giá vé', 'Lịch trình']
    },
    {
        id: '2',
        title: 'Hướng dẫn đặt vé xe online nhanh chóng và tiện lợi',
        slug: 'huong-dan-dat-ve-online',
        excerpt: 'Đặt vé xe khách online giúp bạn tiết kiệm thời gian và đảm bảo có chỗ ngồi trong các dịp cao điểm...',
        content: `
            <h2>Tại sao nên đặt vé online?</h2>
            <p>Đặt vé xe khách online mang lại nhiều lợi ích:</p>
            <ul>
                <li>Tiết kiệm thời gian, không cần đến bến xe</li>
                <li>Chọn chỗ ngồi theo ý muốn</li>
                <li>Thanh toán linh hoạt (chuyển khoản, ví điện tử)</li>
                <li>Nhận thông tin lịch trình qua SMS/Email</li>
            </ul>

            <h2>Các bước đặt vé online</h2>
            <h3>Bước 1: Chọn tuyến đường</h3>
            <p>Truy cập trang Tuyến đường để xem danh sách các tuyến xe và giá vé.</p>

            <h3>Bước 2: Chọn ngày và giờ xuất bến</h3>
            <p>Lựa chọn ngày đi và khung giờ phù hợp với lịch trình của bạn.</p>

            <h3>Bước 3: Điền thông tin</h3>
            <p>Nhập đầy đủ thông tin: Họ tên, số điện thoại, email.</p>

            <h3>Bước 4: Xác nhận và thanh toán</h3>
            <p>Kiểm tra thông tin và hoàn tất đặt vé. Bạn sẽ nhận mã vé qua SMS.</p>

            <h2>Lưu ý quan trọng</h2>
            <ul>
                <li>Đặt vé trước ít nhất 2 giờ trước giờ xuất bến</li>
                <li>Mang theo CMND/CCCD để đối chiếu</li>
                <li>Đến bến xe trước 15 phút</li>
            </ul>
        `,
        author: 'Admin',
        date: '2025-01-10',
        category: 'Hướng dẫn',
        image: '/hopdong.jpg',
        tags: ['Đặt vé', 'Online', 'Hướng dẫn']
    },
    {
        id: '3',
        title: 'Chính sách hoàn hủy vé và đổi lịch trình',
        slug: 'chinh-sach-hoan-huy-ve',
        excerpt: 'Tìm hiểu về chính sách hoàn vé, đổi lịch để có sự chuẩn bị tốt nhất cho chuyến đi của bạn...',
        content: `
            <h2>Chính sách hoàn vé</h2>
            <p>Nhà xe Võ Cúc Phương có chính sách hoàn vé linh hoạt:</p>

            <h3>Hoàn vé trước 24 giờ:</h3>
            <ul>
                <li>Hoàn 90% giá trị vé</li>
                <li>Xử lý trong vòng 1-2 ngày làm việc</li>
            </ul>

            <h3>Hoàn vé trước 12 giờ:</h3>
            <ul>
                <li>Hoàn 70% giá trị vé</li>
                <li>Phí xử lý 10.000đ</li>
            </ul>

            <h3>Hoàn vé trước 6 giờ:</h3>
            <ul>
                <li>Hoàn 50% giá trị vé</li>
                <li>Phí xử lý 20.000đ</li>
            </ul>

            <h3>Trong vòng 6 giờ:</h3>
            <ul>
                <li>Không được hoàn vé</li>
                <li>Có thể đổi sang chuyến khác (phụ thu 20.000đ)</li>
            </ul>

            <h2>Chính sách đổi lịch</h2>
            <p>Khách hàng có thể đổi lịch miễn phí 1 lần nếu:</p>
            <ul>
                <li>Thông báo trước ít nhất 12 giờ</li>
                <li>Còn chỗ trống trên chuyến xe muốn đổi</li>
                <li>Không phát sinh thêm chi phí</li>
            </ul>

            <h2>Liên hệ hỗ trợ</h2>
            <p>Để hoàn/đổi vé, vui lòng liên hệ:</p>
            <ul>
                <li>Hotline: <strong>0123 456 789</strong></li>
                <li>Email: support@xevocucphuong.com</li>
                <li>Hoặc trực tiếp tại văn phòng</li>
            </ul>
        `,
        author: 'Võ Cúc Phương',
        date: '2025-01-05',
        category: 'Chính sách',
        image: '/lienhe.jpg',
        tags: ['Hoàn vé', 'Đổi lịch', 'Chính sách']
    }
];

// Helper function để lấy bài viết theo slug
export const getPostBySlug = (slug: string): Post | undefined => {
    return posts.find(post => post.slug === slug);
};

// Helper function để lấy bài viết theo category
export const getPostsByCategory = (category: string): Post[] => {
    return posts.filter(post => post.category === category);
};

// Helper function để lấy các bài viết mới nhất
export const getLatestPosts = (limit: number = 3): Post[] => {
    return posts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
};
