import { Route } from '@/types';

export const routes: Route[] = [
    {
        id: '1',
        from: 'Long Khánh',
        to: 'Sài Gòn (Cao tốc)',
        price: 120000,
        duration: '1.5 giờ',
        departureTime: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '2',
        from: 'Long Khánh',
        to: 'Sài Gòn (Quốc lộ)',
        price: 110000,
        duration: '2 giờ',
        departureTime: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '3',
        from: 'Sài Gòn',
        to: 'Long Khánh (Cao tốc)',
        price: 120000,
        duration: '1.5 giờ',
        departureTime: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '4',
        from: 'Sài Gòn',
        to: 'Long Khánh (Quốc lộ)',
        price: 110000,
        duration: ' ~ 2 giờ 30 phút',
        departureTime: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '5',
        from: 'Sài Gòn',
        to: 'Xuân Lộc (Cao tốc)',
        price: 130000,
        duration: ' 2 giờ ~ 4 giờ ',
        departureTime: ['05:30', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '6',
        from: 'Quốc Lộ 1A',
        to: 'Xuân Lộc (Quốc lộ)',
        price: 130000,
        duration: '1.5 giờ ~ 4 tiếng',
        departureTime: ['05:30', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '7',
        from: 'Xuân Lộc',
        to: 'Long Khánh (Cao tốc)',
        price: 130000,
        duration: '1 giờ',
        departureTime: ['05:30', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    },
    {
        id: '8',
        from: 'Xuân Lộc',
        to: 'Long Khánh (Quốc lộ)',
        price: 130000,
        duration: '1.5 giờ',
        departureTime: ['05:30', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
        availableSeats: 28,
        busType: 'Ghế ngồi',
        distance: 80
    }
];

export const companyInfo = {
    name: 'Nhà Xe Võ Cúc Phương',
    phone: '02519 999 975',
    hotline: '02519 999 975',
    email: 'vocucphuong0018@gmail.com',
    address: ['Long Khánh: 18 đường Nguyễn Du, phường Xuân An, Thành phố Long Khánh', 'Quận 5: 97i đường Nguyễn Duy Dương, phường 9, quận 5', 'Hàng Xanh: 496B đường Điện Biên Phủ, phường 21, quận Bình Thạnh'],
    founded: '2011',
    vision: 'Trở thành đơn vị vận tải hàng đầu tại Đồng Nai - Sài Gòn, mang đến trải nghiệm di chuyển an toàn, thoải mái và tiện lợi nhất cho khách hàng.',
    mission: 'Cung cấp dịch vụ vận chuyển khách chất lượng cao với đội xe hiện đại, đội ngũ lái xe chuyên nghiệp, và cam kết đúng giờ.',
    busTypes: ['Ghế ngồi 45 chỗ', 'Ghế ngồi 28 chỗ', 'Limousine 16 chỗ'],
    services: [
        'Vận chuyển hành khách liên tỉnh',
        'Cho thuê xe du lịch',
        'Dịch vụ đưa đón sân bay',
        'Vận chuyển hàng hóa ký gửi'
    ]
};
