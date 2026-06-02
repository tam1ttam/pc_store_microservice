package tam.common.config;

import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;

import feign.codec.Encoder;

public class IntrospectFeignConfig {

	@Bean
	public Encoder feignEncoder(ObjectFactory<HttpMessageConverters> messageConverters) {
		return new SpringEncoder(messageConverters);
	}
}
