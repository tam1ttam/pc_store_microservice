"""strip_voucher.py — remove VoucherClient from AIService"""
from pathlib import Path

p = Path(r'd:\nhap\nhap_iluttmab\BE\chat-service\src\main\java\com\tam\chat\service\AIService.java')
txt = p.read_text('utf-8')

# 1. Remove import
txt = txt.replace('import com.tam.chat.repository.httpclient.VoucherClient;\n', '')

# 2. Remove field
txt = txt.replace(' private final VoucherClient voucherClient;\n', '\n')

# 3. Remove voucher fetch block in handleProductCard
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
txt = txt.replace(old_fetch, '')

# 4. Update method signature
old_sig = (
    'private String buildProductCardResponse(\n'
    '            com.tam.proto.product.v1.GetProductResponse product, int stock, List<ProductAttributeProto> attributes, List<Map<String, Object>> vouchers) {'
)
new_sig = (
    'private String buildProductCardResponse(\n'
    '            com.tam.proto.product.v1.GetProductResponse product, int stock, List<ProductAttributeProto> attributes) {'
)
txt = txt.replace(old_sig, new_sig)

# 5. Remove vouchers section in buildProductCardResponse body
old_block = (
    '        if (vouchers != null && !vouchers.isEmpty()) {\n'
    '        sb.append("🎟️ **Voucher khuyến mãi hiện có (")\n'
    '            .append(vouchers.size())\n'
    '            .append("):**\\n");\n'
    '        vouchers.stream().limit(5).forEach(v -> {\n'
    '            String desc = (String) v.get("description");\n'
    '            String code = (String) v.get("code");\n'
    '            String type = (String) v.get("type");\n'
    '            sb.append("- `").append(code).append("` (");\n'
    '            if (desc != null && !desc.isBlank()) sb.append(desc).append(" — ");\n'
    '            sb.append(type.equals("PRIVATE") ? "Cá nhân" : "Công khai").append(")\\n");\n'
    '        });\n'
    '        sb.append("\\n");\n'
    '    }'
)
txt = txt.replace(old_block, '')

# 6. Update call site
txt = txt.replace(
    'String response = buildProductCardResponse(product, stock, attributes, applicable);',
    'String response = buildProductCardResponse(product, stock, attributes);',
)

p.write_text(txt, 'utf-8')
print('OK')
