"""strip_voucher_v2.py — clean removal of VoucherClient from AIService"""
from pathlib import Path

p = Path(r'd:\nhap\nhap_iluttmab\BE\chat-service\src\main\java\com\tam\chat\service\AIService.java')
txt = p.read_text('utf-8')

# 1. Remove import
txt = txt.replace('import com.tam.chat.repository.httpclient.VoucherClient;\n', '')

# 2. Remove field
txt = txt.replace(' private final VoucherClient voucherClient;\n', '\n')

# 3. Remove the voucher fetch block in handleProductCard (line ~104-121)
old_fetch = '''        var vouchers = voucherClient.getAllActiveVouchers();
        List<Map<String, Object>> applicable = List.of();
        if (vouchers != null && vouchers.getResult() != null) {
            LocalDateTime now = LocalDateTime.now();
            applicable = vouchers.getResult().stream()
            .filter(v -> Boolean.TRUE.equals(v.getIsActive())
            && (v.getExpiredAt() == null
            || !LocalDateTime.parse(v.getExpiredAt())
            .isBefore(now)))
            .map(v -> Map.<String, Object>of(
                "code", v.getCode(),
                "description", v.getDescription() != null ? v.getDescription() : "",
                "type", v.getAccessType() != null ? v.getAccessType() : "PUBLIC",
                "discountAmount", v.getDiscountAmount(),
                "discountPercent", v.getDiscountPercent(),
                "expiredAt", v.getExpiredAt()))
            .collect(Collectors.toList());
        }

'''
if old_fetch not in txt:
    # Try alternate formatting
    old_fetch = old_fetch.replace('        var vouchers', '       var vouchers')
    old_fetch = old_fetch.replace('        List<Map', '       List<Map')
    old_fetch = old_fetch.replace('        if (vouchers', '       if (vouchers')
    old_fetch = old_fetch.replace('            LocalDateTime', '           LocalDateTime')
    old_fetch = old_fetch.replace('            applicable', '           applicable')
    old_fetch = old_fetch.replace('            .filter', '           .filter')
    old_fetch = old_fetch.replace('            && (v', '           && (v')
    old_fetch = old_fetch.replace('            || !Local', '           || !Local')
    old_fetch = old_fetch.replace('            .isBefore', '           .isBefore')
    old_fetch = old_fetch.replace('            .map(v', '           .map(v')
    old_fetch = old_fetch.replace('                "code"', '               "code"')
    old_fetch = old_fetch.replace('                "desc', '               "desc')
    old_fetch = old_fetch.replace('                "type', '               "type')
    old_fetch = old_fetch.replace('                "discountAmount"', '               "discountAmount"')
    old_fetch = old_fetch.replace('                "discountPercent"', '               "discountPercent"')
    old_fetch = old_fetch.replace('                "expiredAt"', '               "expiredAt"')
    old_fetch = old_fetch.replace('            .collect', '           .collect')
txt = txt.replace(old_fetch, '')

# 4. Update buildProductCardResponse signature — remove vouchers param
old_sig = '''List<ProductAttributeProto> attributes, List<Map<String, Object>> vouchers) {'''
new_sig = '''List<ProductAttributeProto> attributes) {'''
txt = txt.replace(old_sig, new_sig)

# 5. Remove vouchers rendering section
old_vouchers_section = '''    if (vouchers != null && !vouchers.isEmpty()) {
        sb.append("🎟️ **Voucher khuyến mãi hiện có (")
            .append(vouchers.size())
            .append("):**\\n");
        vouchers.stream().limit(5).forEach(v -> {
            String desc = (String) v.get("description");
            String code = (String) v.get("code");
            String type = (String) v.get("type");
            sb.append("- `").append(code).append("` (");
            if (desc != null && !desc.isBlank()) sb.append(desc).append(" — ");
            sb.append(type.equals("PRIVATE") ? "Cá nhân" : "Công khai").append(")\\n");
        });
        sb.append("\\n");
    }

'''
txt = txt.replace(old_vouchers_section, '')

# 6. Fix call site
txt = txt.replace(
    'String response = buildProductCardResponse(product, stock, attributes, applicable);',
    'String response = buildProductCardResponse(product, stock, attributes);',
)

p.write_text(txt, 'utf-8')
print('OK')
print('voucherClient remaining:', 'voucherClient' in txt)
print('VoucherClient remaining:', 'VoucherClient' in txt)
print('vouchers remaining:', 'vouchers' in txt)
print('applicable remaining:', 'applicable' in txt)
