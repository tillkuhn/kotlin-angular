package net.timafe.angkor.security

import net.timafe.angkor.domain.AuthScoped
import net.timafe.angkor.domain.enums.AuthScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.server.ResponseStatusException
import java.lang.IllegalStateException

// this is the future place for static security helpers ....
/*
* Sample Auth Token
    "sub" : "3913****-****-****-****-****hase8b9c",
    "cognito:groups" : [ "eu-central-1_ILJadY8m3_Facebook", "angkor-admins" ],
    "cognito:preferred_role" : "arn:aws:iam::06********:role/angkor-cognito-role-admin",
    "cognito:roles" : [ "arn:aws:iam::06********:role/angkor-cognito-role-admin" ],
    "cognito:username" : "Facebook_16************65",
    "given_name" : "Gin",
    "name" : "Gin Tonic",
    "family_name" : "Tonic",
    "email" : "gin.tonic@gmail.com"
    "nonce" : "HIaFHPVbRPM1l3hase-****-****",
    "iss" : "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_ILJ******",
    "aud" : [ "20hase*********" ]
*/

class SecurityUtils {
    companion object {

        val log: Logger = LoggerFactory.getLogger(AuthService::class.java)

        // fun getCurrentUserLogin(): Optional<String> =
        // fun getAuthorities(authentication: Authentication): List<String>? {

        /**
         * Returns true if user is not authenticated, i.e. bears the AnonymousAuthenticationToken
         * as opposed to OAuth2AuthenticationToken
         */
        @JvmStatic
        fun isAnonymous(): Boolean = SecurityContextHolder.getContext().authentication is AnonymousAuthenticationToken

        /**
         * Just the opposite of isAnonymous :-)
         */
        @JvmStatic
        fun isAuthenticated(): Boolean = !isAnonymous()

        fun isCurrentUserInRole(authority: String): Boolean {
            // val authentication = SecurityContextHolder.getContext().authentication
            throw IllegalStateException("Method to be implemented so $authority will be checked")
            return true
        }

        /**
         * Check if current user it allowed to access item. If not, throws
         * ResponseStatusException 403 exception
         */
        fun verifyAccessPermissions(item: AuthScoped) {
            val itemScope = item.authScope
            if (! allowedAuthScopes().contains(itemScope)) {
                val msg = "User's scopes ${allowedAuthScopes()} are insufficient to access ${item.authScope} items"
                log.warn(msg)
                throw ResponseStatusException(HttpStatus.FORBIDDEN,msg)
            }
        }

        /**
         * Returns a list of AuthScopes (PUBLIC,ALL_AUTH) the user is allows to access
         */
        fun allowedAuthScopes(): List<AuthScope> {
            val authorities = SecurityContextHolder.getContext().authentication.authorities
            // https://riptutorial.com/kotlin/topic/707/java-8-stream-equivalents
            val isAdmin = authorities.asSequence().filter { it.authority.equals("ROLE_ADMIN") }.any{it.authority.equals("ROLE_ADMIN")}
            val isUser = authorities.asSequence().filter { it.authority.equals("ROLE_USER") }.any{it.authority.equals("ROLE_USER")}
            val scopes = mutableListOf<AuthScope>(AuthScope.PUBLIC)
            if (isAuthenticated()) scopes.add(AuthScope.ALL_AUTH)
            if (isUser) scopes.add(AuthScope.RESTRICTED)
            if (isAdmin) scopes.add((AuthScope.PRIVATE))
            return scopes
        }

        // Needed to support native SQL queries e.g. such as AND auth_scope= ANY (cast(:authScopes as auth_scope[]))
        fun allowedAuthScopesAsString(): String = authScopesAsString(allowedAuthScopes())

        /**
         * helper to convert AuthScope enum list into a String array which can be used in NativeSQL Postgres queries
         * return example: {"PUBLIC", "PRIVATE"}
         */
        fun authScopesAsString(authScopes: List<AuthScope>): String {
            return "{" + authScopes.joinToString { "\"${it.name}\"" } + "}"
        }

        /**
         * Checks if the authscope of the item argument is part of allowedAuthScopes for the current user
         */
        fun allowedToAccess(item: AuthScoped): Boolean {
            val allowed = item.authScope in allowedAuthScopes()
            if (!allowed) {
                log.warn("current user not allowed to access ${item.authScope} ${item.javaClass.simpleName} item")
            }
            return allowed
        }


    }
}