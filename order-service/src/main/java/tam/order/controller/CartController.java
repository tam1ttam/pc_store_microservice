package tam.order.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.order.dto.req.AddToCartRequest;
import tam.order.dto.req.DeleteMultipleCartItemsRequest;
import tam.order.dto.req.UpdateCartItemRequest;
import tam.order.dto.res.CartResponse;
import tam.order.service.CartService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/carts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @PostMapping("/create")
    public ResponseEntity<Boolean> createCart(@RequestBody String userId) {
        CartResponse cartResponse = cartService.getCart(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartResponse.getUserId().equalsIgnoreCase(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable String userId) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddToCartRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        CartResponse response = cartService.addToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Integer itemId,
            @RequestBody UpdateCartItemRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        CartResponse response = cartService.updateCartItem(userId, itemId, request);
        return ResponseEntity.ok(response);
    }



    @DeleteMapping("/items")
    public ResponseEntity<CartResponse> removeMultipleFromCart(
            @RequestBody DeleteMultipleCartItemsRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        CartResponse response = cartService.removeMultipleFromCart(userId, request.getItemIds());
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/empty")
    public ResponseEntity<Void> emptyCart() {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        cartService.emptyCart(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/carts/{userId}/count
     * Đếm tổng số lượng item trong giỏ hàng
     */
    @GetMapping("/{userId}/count")
    public ResponseEntity<Integer> countCartItems(@PathVariable String userId) {
        try {
            log.info("Counting cart items for user: {}", userId);
            CartResponse cartResponse = cartService.getCart(userId);
            int totalQuantity = cartResponse.getItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            return ResponseEntity.ok(totalQuantity);
        } catch (Exception e) {
            log.error("Error counting cart items for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(0);
        }
    }

    /**
     * POST /api/v1/carts/items/increase
     * Tăng số lượng item trong giỏ hàng
     */
    @PostMapping("/items/increase")
    public ResponseEntity<CartResponse> increaseQuantity(
            @RequestParam String userId,
            @RequestParam Integer itemId) {
        try {
            log.info("Increasing quantity for item: {} in cart of user: {}", itemId, userId);
            //TODO: Extract user ID từ JWT token hoặc SecurityContext
            CartResponse cartResponse = cartService.getCart(userId);
            var item = cartResponse.getItems().stream()
                    .filter(i -> i.getItemId().equals(itemId))
                    .findFirst();
            
            if (item.isPresent()) {
                UpdateCartItemRequest request = new UpdateCartItemRequest();
                request.setQuantity(item.get().getQuantity() + 1);
                CartResponse response = cartService.updateCartItem(userId, itemId, request);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            log.error("Error increasing quantity for item: {}", itemId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * POST /api/v1/carts/items/decrease
     * Giảm số lượng item trong giỏ hàng
     */
    @PostMapping("/items/decrease")
    public ResponseEntity<CartResponse> decreaseQuantity(
            @RequestParam String userId,
            @RequestParam Integer itemId) {
        try {
            log.info("Decreasing quantity for item: {} in cart of user: {}", itemId, userId);
            //TODO: Extract user ID từ JWT token hoặc SecurityContext
            CartResponse cartResponse = cartService.getCart(userId);
            var item = cartResponse.getItems().stream()
                    .filter(i -> i.getItemId().equals(itemId))
                    .findFirst();
            
            if (item.isPresent()) {
                int newQuantity = item.get().getQuantity() - 1;
                if (newQuantity <= 0) {
                    // Nếu số lượng <= 0, xóa item khỏi giỏ
                    DeleteMultipleCartItemsRequest deleteRequest = new DeleteMultipleCartItemsRequest();
                    deleteRequest.setItemIds(java.util.List.of(itemId));
                    return ResponseEntity.ok(cartService.removeMultipleFromCart(userId, deleteRequest.getItemIds()));
                } else {
                    UpdateCartItemRequest request = new UpdateCartItemRequest();
                    request.setQuantity(newQuantity);
                    CartResponse response = cartService.updateCartItem(userId, itemId, request);
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            log.error("Error decreasing quantity for item: {}", itemId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
