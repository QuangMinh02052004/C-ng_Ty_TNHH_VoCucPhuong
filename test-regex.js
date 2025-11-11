// Test regex nhận diện booking code (cả format cũ và mới)

function extractBookingCode(description) {
    // Regex hỗ trợ MỌI format (bank có thể bỏ dấu -):
    // - VCP202511106100 (no hyphens)
    // - VCP-20251110-6100 (with hyphens)
    // - VCP20251110-6100 (mixed)
    const match = description.match(/VCP-?\d{8}-?\d{4}/i);
    if (!match) return null;

    // Normalize: bỏ hết dấu "-" để match với database
    return match[0].toUpperCase().replace(/-/g, '');
}

console.log('\n🧪 TEST REGEX NHẬN DIỆN MÃ VÉ\n');
console.log('='.repeat(60));

// Test cases - Real scenarios from banking apps
const testCases = [
    // Format mới (KHÔNG CÓ DẤU - LÀM GÌ CẢ)
    {
        description: 'VCP202511106100 Nguyen Van A',
        expected: 'VCP202511106100',
    },
    {
        description: 'vcp202511106100',
        expected: 'VCP202511106100',
    },
    {
        description: 'Chuyen tien VCP202511109999',
        expected: 'VCP202511109999',
    },

    // Format cũ (có dấu - nhưng sẽ normalize về không có -)
    {
        description: 'VCP-20251110-4745 Le Van C',
        expected: 'VCP202511104745', // Normalized: bỏ dấu -
    },
    {
        description: 'vcp-20251109-1234 nguyen van d',
        expected: 'VCP202511091234', // Normalized: bỏ dấu -
    },

    // Mixed format (bank có thể bỏ 1 số dấu -)
    {
        description: 'VCP20251110-6100',
        expected: 'VCP202511106100', // Normalized: bỏ dấu -
    },

    // REAL data từ Casso (từ log)
    {
        description: '106929306016-XEVCP VCP202511102005-CHUYEN TIEN-OQCH0003e3A4-MOMO106929306016MOMO',
        expected: 'VCP202511102005',
    },
    {
        description: 'XEVCP VCP20251110102-Ma GD ACSP/OD374052',
        expected: null, // Thiếu 1 số (chỉ có 11 số thay vì 12)
    },
    {
        description: 'XEVCP VCP202511106100-Ma GD ACSP/R1341750',
        expected: 'VCP202511106100',
    },

    // Edge cases
    {
        description: 'No booking code here',
        expected: null,
    },
    {
        description: 'VCP2025111-100', // Sai format (thiếu 1 số)
        expected: null,
    },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = extractBookingCode(testCase.description);
    const isPass = result === testCase.expected;

    if (isPass) {
        passed++;
        console.log(`✅ Test ${index + 1}: PASS`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: FAIL`);
    }

    console.log(`   Input:    "${testCase.description}"`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got:      ${result}`);
    console.log('');
});

console.log('='.repeat(60));
console.log(`\n📊 KẾT QUẢ: ${passed}/${testCases.length} tests passed`);

if (failed === 0) {
    console.log('🎉 TẤT CẢ TEST ĐỀU PASS!\n');
} else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
}
