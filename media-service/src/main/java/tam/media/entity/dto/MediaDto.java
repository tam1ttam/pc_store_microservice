package tam.media.entity.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.MediaType;

import java.io.InputStream;

@Builder
@Getter
public class MediaDto {

    private InputStream content;
    private MediaType mediaType;
}