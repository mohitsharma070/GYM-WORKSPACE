package com.gym.membership.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

@Component
public class FeignRequestBindingFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes((HttpServletRequest) request)
        );

        chain.doFilter(request, response);
    }
}
