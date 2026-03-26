package tam.product.repository;

import org.springframework.data.repository.PagingAndSortingRepository;
import tam.product.entity.Category;

public interface CategoryRepositoryPagingAndSorting extends PagingAndSortingRepository<Category, String> {
}
