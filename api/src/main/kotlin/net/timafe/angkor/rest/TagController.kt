package net.timafe.angkor.rest

import net.timafe.angkor.config.Constants
import net.timafe.angkor.domain.Tag
import net.timafe.angkor.domain.dto.TagSummary
import net.timafe.angkor.domain.enums.EntityType
import net.timafe.angkor.repo.TagRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing [Tag].
 */
@RestController
@RequestMapping(Constants.API_LATEST + "/" + Constants.API_PATH_TAGS)
class TagController(
    private val repository: TagRepository
)  {

    private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    // private val log: Logger = LoggerFactory.getLogger(this.javaClass)

    /**
     * Get all details of a single place
     */
    @GetMapping("{entityType}")
    @ResponseStatus(HttpStatus.OK)
    fun getEntityTags(@PathVariable entityType: String): List<TagSummary> {
        val et = EntityType.valueOf(entityType.toUpperCase())
        when (et) {
            EntityType.DISH -> return repository.findTagsForDishes()
            EntityType.NOTE -> return repository.findTagsForNotes()
            EntityType.PLACE -> return repository.findTagsForPlaces()
            else -> throw IllegalArgumentException("${entityType} is not a support entityType")
        }
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    fun alltags(): List<Tag> {
        return repository.findByOrderByLabel()
    }

}
