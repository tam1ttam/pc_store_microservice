package tam.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.entities.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "user", ignore = true) // User sẽ được set thủ công trong service
    Address toAddress(AddressRequest request);
    AddressRequest toAddressRequest(Address address);
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateAddress(@MappingTarget Address address, AddressRequest request);
}