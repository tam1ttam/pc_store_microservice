"""clean_voucher.py — exact removal of voucher code from AIService"""
from pathlib import Path

p = Path(r'd:\nhap\nhap_iluttmab\BE\chat-service\src\main\java\com\tam\chat\service\AIService.java')
lines = p.read_text('utf-8').splitlines()

# 1. Find and remove import line
filtered = [l for l in lines if 'import com.tam.chat.repository.httpclient.VoucherClient;' not in l]

# 2. Find and remove field line
filtered = [l for l in filtered if 'private final VoucherClient voucherClient;' not in l]

# 3. Find the voucher fetch block by its unique first line
voucher_start = None
for i, l in enumerate(filtered):
    if 'voucherClient.getAllActiveVouchers' in l:
        voucher_start = i
        break

# Find the blank line after the if-block (which ends at closing })
if voucher_start is not None:
    # Find line ' String response = buildProductCardResponse' — that's the call site
    call_site_idx = None
    for i in range(voucher_start, min(voucher_start + 30, len(filtered))):
        if 'String response = buildProductCardResponse(product, stock, attributes)' in filtered[i]:
            call_site_idx = i
            break
    if call_site_idx is not None:
        # Remove lines from voucher_start to (call_site_idx - 1), plus blank lines around
        # Find preceding blank lines to remove
        del_start = voucher_start
        while del_start > 0 and filtered[del_start - 1].strip() == '':
            del_start -= 1
        # Find trailing blank lines after closing brace
        del_end = call_site_idx
        # Remove
        del filtered[del_start:del_end]
        print(f'Removed voucher fetch block: lines {del_start} to {del_end-1}')
    else:
        print('WARNING: call site not found')

# 4. Fix method signature: remove vouchers param
for i, l in enumerate(filtered):
    if 'List<ProductAttributeProto> attributes, List<Map<String, Object>> vouchers)' in l:
        filtered[i] = l.replace(
            'List<ProductAttributeProto> attributes, List<Map<String, Object>> vouchers) {',
            'List<ProductAttributeProto> attributes) {'
        )
        print(f'Fixed signature at line {i}')
        break

# 5. Remove voucher rendering block in buildProductCardResponse
voucher_render_start = None
for i, l in enumerate(filtered):
    if 'if (vouchers != null && !vouchers.isEmpty()) {' in l and 'Voucher khuyến mãi' in filtered[i+1]:
        voucher_render_start = i
        break

if voucher_render_start is not None:
    # Find end of block (the closing brace + following blank line)
    end_idx = voucher_render_start + 1
    brace_count = 1
    while end_idx < len(filtered) and brace_count > 0:
        line = filtered[end_idx]
        brace_count += line.count('{') - line.count('}')
        end_idx += 1
    # Remove trailing blank line
    while end_idx < len(filtered) and filtered[end_idx].strip() == '':
        end_idx += 1
    del filtered[voucher_render_start:end_idx]
    print(f'Removed voucher render block: lines {voucher_render_start} to {end_idx-1}')

# 6. Fix call site — remove , applicable)
filtered = [l.replace(
    'buildProductCardResponse(product, stock, attributes, applicable)',
    'buildProductCardResponse(product, stock, attributes)'
) for l in filtered]

p.write_text('\n'.join(filtered) + '\n', 'utf-8')
print('OK')
for needle in ['voucherClient', 'VoucherClient', 'applicable', 'vouchers']:
    print(f'  {needle} remaining:', needle in p.read_text('utf-8'))
