package tam.product.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tam.product.repository.CategoryRepository;
import tam.product.repository.CategoryRepositoryPagingAndSorting;
import tam.product.service.CategoryService;

@Slf4j
@RequiredArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private final CategoryRepository categoryRepository;

    @Autowired
    private final CategoryRepositoryPagingAndSorting categoryRepositoryPagingAndSorting;
}
