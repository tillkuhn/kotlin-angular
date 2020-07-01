package net.timafe.angkor.config

import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class SecurityConfig(
        // private val corsFilter: CorsFilter,
        /* private val jwtAuthorityExtractor: JwtAuthorityExtractor */
) : WebSecurityConfigurerAdapter() {

    @Throws(Exception::class)
    public override fun configure(http: HttpSecurity) {
        http.cors();

        http.csrf().disable();

        http.authorizeRequests()
                .antMatchers("/authorize").authenticated()
                .antMatchers("/api/auth-info").permitAll()
                .antMatchers("/api/public/**").permitAll() // tku for unauthenticated users
                .antMatchers("/actuator/health").permitAll()

                // temporary only for /api/secure
                //.antMatchers("/api/**").authenticated()
                .antMatchers("/api/secure/**").authenticated()

                //.antMatchers("/management/**").hasAuthority(ADMIN)
                .and()
                .oauth2Login()
                .and()
                //.oauth2ResourceServer()
                //.jwt()
                //.jwtAuthenticationConverter(jwtAuthorityExtractor)
                //.and()
                .oauth2Client()
    }
}