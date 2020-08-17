package net.timafe.angkor.domain.dto

import net.timafe.angkor.domain.Mappable
import java.util.*

data class POI(

        var id: UUID,
        var name: String,


        // coordinates should be List<Double>? but this didn't work with JPA SELECT NEW query
        // (see PlaceRepository) which raises
        // Expected arguments are: java.util.UUID, java.lang.String, java.lang.Object
        // var coordinates: java.lang.Object? = null
        override var coordinates: List<Double> = listOf()


) : Mappable {
    // Satisfy entity query in PlaceRepository which cannot cast coorindates arg
    // Unable to locate appropriate constructor on class [net.timafe.angkor.domain.dto.POI].
    // Expected arguments are: java.util.UUID, java.lang.String, java.lang.Object
    constructor(id: UUID, name: String, coordinates: Any) : this(id, name, coordinates as List<Double>)
}