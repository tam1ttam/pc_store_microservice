package tam.userservice.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.AddressResponse;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.entities.Address;
import tam.userservice.entities.User;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-28T11:43:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class UserProfileMapperImpl implements UserProfileMapper {

    @Autowired
    private AddressMapper addressMapper;

    @Override
    public User toUser(UserProfileRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( request.getId() );
        user.identityUserId( request.getIdentityUserId() );
        user.defaultPhoneNumber( request.getDefaultPhoneNumber() );
        user.defaultEmail( request.getDefaultEmail() );
        user.firstName( request.getFirstName() );
        user.lastName( request.getLastName() );
        user.gender( request.getGender() );
        user.dateOfBirth( request.getDateOfBirth() );
        user.avatar( request.getAvatar() );
        List<Address> list = request.getAddresses();
        if ( list != null ) {
            user.addresses( new ArrayList<Address>( list ) );
        }

        return user.build();
    }

    @Override
    public UserProfileResponse toUserProfileResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserProfileResponse userProfileResponse = new UserProfileResponse();

        userProfileResponse.setAddresses( addressListToAddressResponseList( user.getAddresses() ) );
        userProfileResponse.setId( user.getId() );
        userProfileResponse.setIdentityUserId( user.getIdentityUserId() );
        userProfileResponse.setDefaultPhoneNumber( user.getDefaultPhoneNumber() );
        userProfileResponse.setDefaultEmail( user.getDefaultEmail() );
        userProfileResponse.setFirstName( user.getFirstName() );
        userProfileResponse.setLastName( user.getLastName() );
        userProfileResponse.setGender( user.getGender() );
        userProfileResponse.setDateOfBirth( user.getDateOfBirth() );
        userProfileResponse.setAvatar( user.getAvatar() );
        userProfileResponse.setIsActive( user.getIsActive() );

        return userProfileResponse;
    }

    @Override
    public void updateUser(User user, UserProfileRequest request) {
        if ( request == null ) {
            return;
        }

        user.setDefaultPhoneNumber( request.getDefaultPhoneNumber() );
        user.setDefaultEmail( request.getDefaultEmail() );
        user.setFirstName( request.getFirstName() );
        user.setLastName( request.getLastName() );
        user.setGender( request.getGender() );
        user.setDateOfBirth( request.getDateOfBirth() );
        user.setAvatar( request.getAvatar() );
        user.setIsActive( request.getIsActive() );
    }

    protected List<AddressResponse> addressListToAddressResponseList(List<Address> list) {
        if ( list == null ) {
            return null;
        }

        List<AddressResponse> list1 = new ArrayList<AddressResponse>( list.size() );
        for ( Address address : list ) {
            list1.add( addressMapper.toAddressResponse( address ) );
        }

        return list1;
    }
}
