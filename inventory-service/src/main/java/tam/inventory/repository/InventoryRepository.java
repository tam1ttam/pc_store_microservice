package tam.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.inventory.model.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
}