<?php

if ( ! function_exists( 'gb_blog_render_callback' ) ) {
	function gb_blog_render_callback( $attributes ) {
		$args = array(
			'posts_per_page' => $attributes['postsToShow'] ?? 5,
			'order'          => $attributes['order'] ?? 'desc',
			'orderby'        => $attributes['orderBy'] ?? 'date',
		);

		$query = new WP_Query( $args );
		ob_start();

		printf(
			'<div class="wp-block-gb-blog-blog-posts-grid" style="background-color:%s;color:%s;">',
			esc_attr( $attributes['backgroundColor'] ?? '#fff' ),
			esc_attr( $attributes['textColor'] ?? '#000' )
		);

		while ( $query->have_posts() ) {
			$query->the_post();
			echo '<article class="post-card">';
			if ( ! empty( $attributes['displayFeaturedImage'] ) && has_post_thumbnail() ) {
				the_post_thumbnail( 'medium', [ 'class' => 'post-featured-image' ] );
			}
			echo '<div class="post-content">';
			echo '<h3>' . esc_html( get_the_title() ) . '</h3>';
			if ( ! empty( $attributes['displayExcerpt'] ) ) {
				echo '<div class="post-excerpt">' . wp_kses_post( wp_trim_words( get_the_excerpt(), 20, '...' ) ) . '</div>';
			}
			echo '</div></article>';
		}

		echo '</div>';
		wp_reset_postdata();

		return ob_get_clean();
	}
}

echo gb_blog_render_callback( $attributes );

