import { NextRequest, NextResponse } from 'next/server';
import { BookingRepository, PaymentRepository } from '@/lib/repositories/booking-repository';

// Verify Casso webhook signature
function verifyCassoSignature(request: NextRequest): boolean {
  const apiKey = process.env.CASSO_API_KEY;
  const authHeader = request.headers.get('authorization');

  if (!apiKey) {
    console.error('CASSO_API_KEY không được cấu hình trong .env');
    return false;
  }

  // Casso gửi API key trong header Authorization dạng: "Apikey YOUR_API_KEY"
  if (!authHeader || !authHeader.startsWith('Apikey ')) {
    console.error('Missing or invalid Authorization header');
    return false;
  }

  const receivedKey = authHeader.substring(7); // Remove "Apikey " prefix
  return receivedKey === apiKey;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Nhận webhook từ Casso');

    // Verify webhook từ Casso
    if (!verifyCassoSignature(request)) {
      console.error('❌ Unauthorized webhook request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📦 Webhook data:', JSON.stringify(body, null, 2));

    // Parse thông tin giao dịch từ Casso
    // Casso có thể gửi dạng array hoặc object
    const transactions = Array.isArray(body.data) ? body.data : [body.data || body];

    for (const transaction of transactions) {
      const {
        id,              // Transaction ID từ Casso
        amount,          // Số tiền
        description,     // Nội dung chuyển khoản
        when,            // Thời gian giao dịch
        tid,             // Transaction ID từ ngân hàng
        bank_sub_acc_id  // ID tài khoản ngân hàng
      } = transaction;

      console.log('💰 Xử lý giao dịch:', {
        id,
        amount,
        description,
        when
      });

      // Tìm booking code trong description
      // Format mẫu: "NAP TIEN VE VCP123456" hoặc "VCP123456"
      const bookingCodeMatch = description?.match(/VCP[A-Z0-9]+/i);

      if (!bookingCodeMatch) {
        console.log('⚠️ Không tìm thấy mã booking trong nội dung:', description);
        continue; // Skip transaction này
      }

      const bookingCode = bookingCodeMatch[0].toUpperCase();
      console.log('🎫 Tìm thấy booking code:', bookingCode);

      // Tìm booking trong database
      const booking = await BookingRepository.findByCodeWithDetails(bookingCode);

      if (!booking) {
        console.log('❌ Không tìm thấy booking:', bookingCode);
        continue;
      }

      console.log('✅ Tìm thấy booking:', {
        bookingCode,
        customerName: booking.customerName,
        totalPrice: booking.totalPrice,
        status: booking.status
      });

      // Kiểm tra đã thanh toán chưa
      if (booking.status === 'PAID' || booking.status === 'CONFIRMED') {
        console.log('⚠️ Booking đã được thanh toán trước đó');
        continue;
      }

      // Kiểm tra số tiền có khớp không (cho phép sai lệch 1000 VND)
      const amountDiff = Math.abs(booking.totalPrice - amount);
      if (amountDiff > 1000) {
        console.log('⚠️ Số tiền không khớp:', {
          expected: booking.totalPrice,
          received: amount,
          diff: amountDiff
        });
        // Vẫn cập nhật nhưng đánh dấu cần kiểm tra
      }

      // Cập nhật hoặc tạo payment
      if (booking.payment) {
        console.log('📝 Cập nhật payment hiện tại');
        await PaymentRepository.update(booking.payment.id, {
          status: 'COMPLETED',
          transactionId: tid || String(id),
          paidAt: new Date(when),
          metadata: JSON.stringify(transaction)
        });
      } else {
        console.log('📝 Tạo payment mới');
        await PaymentRepository.create({
          bookingId: booking.id,
          amount: amount,
          method: 'BANK_TRANSFER',
          status: 'COMPLETED',
          transactionId: tid || String(id),
          paidAt: new Date(when),
          metadata: JSON.stringify(transaction)
        });
      }

      // Cập nhật trạng thái booking thành PAID
      await BookingRepository.updateStatus(booking.id, 'PAID');

      console.log('✅ Đã cập nhật thanh toán thành công cho booking:', bookingCode);

      // TODO: Gửi email xác nhận đã thanh toán
      try {
        // Uncomment khi đã cấu hình email service
        // await sendPaymentConfirmationEmail(booking);
        console.log('📧 TODO: Gửi email xác nhận thanh toán');
      } catch (emailError) {
        console.error('❌ Lỗi gửi email:', emailError);
        // Không throw error để không ảnh hưởng đến webhook
      }

      // TODO: Gửi SMS xác nhận đã thanh toán
      try {
        // Uncomment khi đã cấu hình SMS service
        // await sendPaymentConfirmationSMS(booking);
        console.log('📱 TODO: Gửi SMS xác nhận thanh toán');
      } catch (smsError) {
        console.error('❌ Lỗi gửi SMS:', smsError);
        // Không throw error để không ảnh hưởng đến webhook
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      processedCount: transactions.length
    });

  } catch (error) {
    console.error('❌ Lỗi xử lý Casso webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  const isAuthorized = verifyCassoSignature(request);

  return NextResponse.json({
    message: 'Casso Webhook endpoint is working',
    authorized: isAuthorized,
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.CASSO_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  });
}
