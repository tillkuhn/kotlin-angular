package net.timafe.angkor.domain

import com.fasterxml.jackson.annotation.JsonFormat
import net.timafe.angkor.config.Constants
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table
import javax.validation.constraints.Email
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Size

@Entity
@Table(name = "app_user")
@TypeDef(
    name = "list-array",
    typeClass = com.vladmihalcea.hibernate.type.array.ListArrayType::class
)
data class User(

    @Id
    // No @GeneratedValue, since we want to re-use UUIDs from OAuth2 Provider where possible
    var id: UUID?,

    @field:NotBlank
    // @field:Pattern(regexp = LOGIN_REGEX)
    @field:Size(min = 1, max = 50)
    var login: String? = null,

    @field:Size(max = 50)
    var firstName: String? = null,

    @field:Size(max = 50)
    var lastName: String? = null,

    @field:Size(max = 50)
    var name: String? = null,

    @field:Email
    @field:Size(min = 5, max = 254)
    var email: String? = null,

    @field:Size(max = 256)
    var imageUrl: String? = null,

    var activated: Boolean = false,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = Constants.JACKSON_DATE_TIME_FORMAT)
    var createdAt: ZonedDateTime? = ZonedDateTime.now(),

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = Constants.JACKSON_DATE_TIME_FORMAT)
    var updatedAt: ZonedDateTime? = ZonedDateTime.now(),

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = Constants.JACKSON_DATE_TIME_FORMAT)
    var lastLogin: ZonedDateTime? = null,

    @Type(type = "list-array")
    @Column(
        name = "roles",
        columnDefinition = "text[]"
    )
    var roles: List<String> = listOf(),

    var emoji: String = "👤"

) {

    override fun toString() = "User(id=${this.id}, name=${this.name}), roles=${this.roles}"

}
