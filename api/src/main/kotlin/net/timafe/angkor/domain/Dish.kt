package net.timafe.angkor.domain

import com.fasterxml.jackson.annotation.JsonFormat
import net.timafe.angkor.config.Constants
import net.timafe.angkor.domain.enums.AuthScope
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@Entity
@EntityListeners(AuditingEntityListener::class)
@TypeDef(
        name = "list-array",
        typeClass = com.vladmihalcea.hibernate.type.array.ListArrayType::class
)
data class Dish(

        // https://vladmihalcea.com/uuid-identifier-jpa-hibernate/
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,

        var name: String,
        var areaCode: String,
        var summary: String?,
        var notes: String?,
        var imageUrl: String?,
        var primaryUrl: String?,
        var timesServed: Short,

        // audit
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = Constants.JACKSON_DATE_TIME_FORMAT)
        @CreatedDate
        var createdAt: LocalDateTime? = LocalDateTime.now(),

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = Constants.JACKSON_DATE_TIME_FORMAT)
        @LastModifiedDate
        var updatedAt: LocalDateTime? = LocalDateTime.now(),

        @Enumerated(EnumType.STRING)
        @Column(columnDefinition = "scope")
        @Type(type = "pgsql_enum")
        override var authScope: AuthScope = AuthScope.PUBLIC,

        @Type(type = "list-array")
        @Column(
                name = "tags",
                columnDefinition = "text[]"
        )
        override var tags: List<String> = listOf()

): Taggable, AuthScoped

