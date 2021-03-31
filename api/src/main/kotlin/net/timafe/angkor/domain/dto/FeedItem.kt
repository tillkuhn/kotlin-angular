package net.timafe.angkor.domain.dto

import java.time.LocalDateTime

// Loosely based on https://diamantidis.github.io/2019/10/13/json-feed-reader-app-with-kotlin-native
data class FeedItem (
    val id: String,
    val url: String,
    val title: String,
    // @SerialName("date_published")
    val datePublished: LocalDateTime? = null,
    // @SerialName("date_modified")
    val dateModified:  LocalDateTime? = null,
    val author: String? = null, // Author
    val summary: String? = null,
   // @SerialName("content_html")
    val contentHtml: String? = null
)
