package tam.repository;

import com.pc.store.server.entities.Payment;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {
    Payment findPaymentsByPaymentId(String paymentId);
}
