package tam.orchestrator.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tam.orchestrator.model.SagaState;

@Repository
public interface SagaStateRepository extends MongoRepository<SagaState, String> {
}
