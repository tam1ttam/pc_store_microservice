package tam.favorite.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FavoriteServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Favorite Service is running";
    }
}
