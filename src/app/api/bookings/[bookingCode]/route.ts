import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Lấy thông tin vé công khai (không cần auth)
// API này dùng để hiển thị thông tin vé khi quét QR code
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingCode: string } }
) {
  try {
    const { bookingCode } = params

    // Lấy thông tin booking với tất cả relations
    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        route: {
          select: {
            from: true,
            to: true,
            duration: true,
            busType: true,
            distance: true,
            price: true
          }
        },
        schedule: {
          select: {
            date: true,
            departureTime: true,
            bus: {
              select: {
                licensePlate: true,
                busType: true
              }
            }
          }
        },
        payment: {
          select: {
            method: true,
            status: true,
            paidAt: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy vé với mã này' },
        { status: 404 }
      )
    }

    // Trả về thông tin vé (ẩn một số thông tin nhạy cảm)
    return NextResponse.json({
      booking: {
        bookingCode: booking.bookingCode,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,

        // Thông tin chuyến đi
        route: {
          from: booking.route.from,
          to: booking.route.to,
          duration: booking.route.duration,
          busType: booking.route.busType,
          distance: booking.route.distance
        },

        date: booking.date,
        departureTime: booking.departureTime,
        seats: booking.seats,
        totalPrice: booking.totalPrice,

        // Thông tin xe
        bus: booking.schedule?.bus ? {
          licensePlate: booking.schedule.bus.licensePlate,
          busType: booking.schedule.bus.busType
        } : null,

        // Trạng thái
        status: booking.status,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,

        // QR Code
        qrCode: booking.qrCode,

        // Thanh toán
        payment: booking.payment ? {
          method: booking.payment.method,
          status: booking.payment.status,
          paidAt: booking.payment.paidAt
        } : null,

        createdAt: booking.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin vé' },
      { status: 500 }
    )
  }
}
