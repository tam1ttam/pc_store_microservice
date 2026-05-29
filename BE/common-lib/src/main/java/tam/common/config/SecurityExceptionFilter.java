package tam.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.filter.OncePerRequestFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import tam.common.base.ApiResponse;

import java.io.IOException;

public class SecurityExceptionFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (AuthenticationException authException) {
            handleAuthenticationException(response, authException);
        } catch (Exception e) {
            // For other exceptions, let them propagate to GlobalExceptionHandler or Default Error Controller
            throw e;
        }
    }

    private void handleAuthenticationException(HttpServletResponse response, AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(401)
                .message(authException.getMessage() != null ? authException.getMessage() : "Unauthenticated")
                .build();

        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}
