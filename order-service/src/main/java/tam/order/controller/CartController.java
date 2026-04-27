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
}
