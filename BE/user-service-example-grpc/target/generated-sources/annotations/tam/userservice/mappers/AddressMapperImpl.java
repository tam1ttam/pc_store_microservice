package tam.userservice.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.dtos.res.AddressResponse;
import tam.userservice.entities.Address;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-28T11:43:56+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class AddressMapperImpl implements AddressMapper {

    @Override
    public Address toAddress(AddressRequest request) {
        if ( request == null ) {
            return null;
        }

        Address.AddressBuilder address = Address.builder();

        address.id( request.getId() );
        address.country( request.getCountry() );
        address.province( request.getProvince() );
        address.city( request.getCity() );
        address.ward( request.getWard() );
        address.street( request.getStreet() );
        address.isDefault( request.getIsDefault() );
        List<String> list = request.getPhoneContacts();
        if ( list != null ) {
            address.phoneContacts( new ArrayList<String>( list ) );
        }
        address.isActive( request.getIsActive() );

        return address.build();
    }

    @Override
    public AddressRequest toAddressRequest(Address address) {
        if ( address == null ) {
            return null;
        }

        AddressRequest addressRequest = new AddressRequest();

        addressRequest.setId( address.getId() );
        addressRequest.setCountry( address.getCountry() );
        addressRequest.setProvince( address.getProvince() );
        addressRequest.setCity( address.getCity() );
        addressRequest.setWard( address.getWard() );
        addressRequest.setStreet( address.getStreet() );
        addressRequest.setIsDefault( address.getIsDefault() );
        List<String> list = address.getPhoneContacts();
        if ( list != null ) {
            addressRequest.setPhoneContacts( new ArrayList<String>( list ) );
        }
        addressRequest.setIsActive( address.getIsActive() );

        return addressRequest;
    }

    @Override
    public AddressResponse toAddressResponse(Address address) {
        if ( address == null ) {
            return null;
        }

        AddressResponse.AddressResponseBuilder addressResponse = AddressResponse.builder();

        addressResponse.id( address.getId() );
        addressResponse.country( address.getCountry() );
        addressResponse.province( address.getProvince() );
        addressResponse.city( address.getCity() );
        addressResponse.ward( address.getWard() );
        addressResponse.street( address.getStreet() );
        addressResponse.isDefault( address.getIsDefault() );
        List<String> list = address.getPhoneContacts();
        if ( list != null ) {
            addressResponse.phoneContacts( new ArrayList<String>( list ) );
        }
        addressResponse.isActive( address.getIsActive() );

        return addressResponse.build();
    }

    @Override
    public void updateAddress(Address address, AddressRequest request) {
        if ( request == null ) {
            return;
        }

        address.setCountry( request.getCountry() );
        address.setProvince( request.getProvince() );
        address.setCity( request.getCity() );
        address.setWard( request.getWard() );
        address.setStreet( request.getStreet() );
        address.setIsDefault( request.getIsDefault() );
        if ( address.getPhoneContacts() != null ) {
            List<String> list = request.getPhoneContacts();
            if ( list != null ) {
                address.getPhoneContacts().clear();
                address.getPhoneContacts().addAll( list );
            }
            else {
                address.setPhoneContacts( null );
            }
        }
        else {
            List<String> list = request.getPhoneContacts();
            if ( list != null ) {
                address.setPhoneContacts( new ArrayList<String>( list ) );
            }
        }
        address.setIsActive( request.getIsActive() );
    }
}
