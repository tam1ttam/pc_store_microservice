package tam.product.service.impl;

import com.pc.store.server.dao.CartRepository;
import com.pc.store.server.dao.OrderRepository;
import com.pc.store.server.entities.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RecommendationService {

    OrderRepository orderRepository;
    CartRepository cartRepository;
    MongoTemplate mongoTemplate;

    /**
     * Gợi ý sản phẩm dựa trên lịch sử Order và Cart hiện tại
     * Logic: Content-based filtering (Lọc theo nội dung: Nhà cung cấp & Từ khóa tên sản phẩm)
     */
    public List<Product> getRecommendedProducts(String customerId, int limit) {
        ObjectId userObjId = new ObjectId(customerId);

        Set<String> interestedSuppliers = new HashSet<>();
        Set<String> interestedKeywords = new HashSet<>();
        // Loại trừ sản phẩm đã mua/có trong giỏ
        Set<ObjectId> excludeProductIds = new HashSet<>();

        // 1. Phân tích Giỏ hàng hiện tại (Cart)
        Cart cart = cartRepository.findByCustomerId(userObjId).orElse(null);
        if (cart != null && cart.getItems() != null) {
            extractInterests(cart.getItems(), interestedSuppliers, interestedKeywords, excludeProductIds);
        }

        // 2. Phân tích Lịch sử mua hàng (Order)
        List<Order> orders = orderRepository.findByCustomerId(userObjId);
        if (orders != null) {
            for (Order order : orders) {
                if (order.getItems() != null) {
                    extractInterests(order.getItems(), interestedSuppliers, interestedKeywords, excludeProductIds);
                }
            }
        }

        // 3. Truy vấn tìm sản phẩm tương tự
        return findSimilarProducts(interestedSuppliers, interestedKeywords, excludeProductIds, limit);
    }

    /**
     * Hàm phụ trợ: Trích xuất thông tin từ list CartItem
     */
    private void extractInterests(
            List<CartItem> items, Set<String> suppliers, Set<String> keywords, Set<ObjectId> excludeIds) {
        for (CartItem item : items) {
            Product p = item.getProduct();
            if (p != null) {
                // Thêm vào danh sách loại trừ (không gợi ý lại cái đang mua)
                excludeIds.add(p.getId());

                // Lấy tên Supplier (vì Supplier embedded không có ID)
                if (p.getSupplier() != null && p.getSupplier().getName() != null) {
                    suppliers.add(p.getSupplier().getName());
                }

                // Phân tích tên sản phẩm thành keyword (đơn giản hóa)
                if (p.getName() != null) {
                    String[] words = p.getName().toLowerCase().split("\\s+");
                    // isStopWord là hàm lọc từ vô nghĩa
                    for (String word : words) {
                        if (word.length() > 3 && !isStopWord(word)) {
                            keywords.add(word);
                        }
                    }
                }
            }
        }
    }

    // Danh sách từ khóa phổ biến nhưng ít giá trị phân loại
    private boolean isStopWord(String word) {
        List<String> stopWords = Arrays.asList("chính", "hãng", "giá", "rẻ", "full", "new", "bảo", "hành");
        return stopWords.contains(word);
    }

    /**
     * Tạo Query MongoDB động
     */
    private List<Product> findSimilarProducts(
            Set<String> suppliers, Set<String> keywords, Set<ObjectId> excludeIds, int limit) {
        Query query = new Query();
        List<Criteria> orCriteria = new ArrayList<>();

        // Tiêu chí 1: Cùng tên Nhà cung cấp
        if (!suppliers.isEmpty()) {
            orCriteria.add(Criteria.where("supplier.name").in(suppliers));
        }

        // Tiêu chí 2: Tên sản phẩm chứa từ khóa quan tâm
        if (!keywords.isEmpty()) {
            // Chỉ lấy tối đa 3 keyword quan trọng nhất để query không quá nặng
            List<String> topKeywords = keywords.stream().limit(3).collect(Collectors.toList());
            for (String key : topKeywords) {
                orCriteria.add(Criteria.where("name").regex(key, "i")); // 'i' = case insensitive
            }
        }

        // Nếu có tiêu chí lọc, thêm vào query
        if (!orCriteria.isEmpty()) {
            query.addCriteria(new Criteria().orOperator(orCriteria.toArray(new Criteria[0])));
        }

        // Loại trừ các sản phẩm đã biết
        if (!excludeIds.isEmpty()) {
            query.addCriteria(Criteria.where("_id").nin(excludeIds));
        }

        query.with(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "discountPercent"))); // Ưu tiên giảm giá cao

        List<Product> recommendations = mongoTemplate.find(query, Product.class);

        // Fallback: Nếu không tìm thấy hoặc ít kết quả, lấy thêm sản phẩm hot/mới nhất
        if (recommendations.size() < limit) {
            int remaining = limit - recommendations.size();
            Query fallbackQuery = new Query();
            if (!excludeIds.isEmpty()) {
                fallbackQuery.addCriteria(Criteria.where("_id").nin(excludeIds));
            }
            // Tránh trùng lặp với list recommendations hiện tại
            Set<ObjectId> currentRecoIds =
                    recommendations.stream().map(Product::getId).collect(Collectors.toSet());
            fallbackQuery.addCriteria(Criteria.where("_id").nin(currentRecoIds));

            fallbackQuery.with(PageRequest.of(
                    0, remaining, Sort.by(Sort.Direction.DESC, "priceAfterDiscount"))); // Lấy sản phẩm giá trị cao

            recommendations.addAll(mongoTemplate.find(fallbackQuery, Product.class));
        }

        return recommendations;
    }
}
