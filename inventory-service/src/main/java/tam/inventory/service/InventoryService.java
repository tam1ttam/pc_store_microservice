package tam.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tam.inventory.repository.InventoryRepository;

@RequiredArgsConstructor
@Slf4j
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;
}
