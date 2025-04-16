/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

import { useEffect, useState } from '@wordpress/element';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ColorPicker,
	ToggleControl,
	Spinner
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */

const truncateWords = (text, limit = 20) => {
	// Remove HTML tags
	const strippedText = text.replace(/<[^>]+>/g, '');
	const words = strippedText.trim().split(/\s+/);
	if (words.length > limit) {
		return words.slice(0, limit).join(' ') + '...';
	}
	return strippedText;
};

export default function Edit({ attributes, setAttributes }) {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const {
		postsToShow,
		order,
		orderBy,
		displayFeaturedImage,
		displayExcerpt,
		backgroundColor,
		textColor
	} = attributes;

	useEffect(() => {
		fetchPosts();
	}, [postsToShow, order, orderBy]);

	const fetchPosts = async () => {
		try {
			setIsLoading(true);
			const response = await apiFetch({
				path: `/wp/v2/posts?per_page=${postsToShow}&order=${order}&orderby=${orderBy}&_embed`
			});
			setPosts(response);
		} catch (error) {
			console.error('Error fetching posts:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const blockProps = useBlockProps({
		style: {
			backgroundColor,
			color: textColor
		}
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Posts Settings', 'gb-blog')}>
					<RangeControl
						label={__('Number of posts', 'gb-blog')}
						value={postsToShow}
						onChange={(value) => setAttributes({ postsToShow: value })}
						min={1}
						max={12}
					/>
					<SelectControl
						label={__('Order', 'gb-blog')}
						value={order}
						options={[
							{ label: __('Descending', 'gb-blog'), value: 'desc' },
							{ label: __('Ascending', 'gb-blog'), value: 'asc' }
						]}
						onChange={(value) => setAttributes({ order: value })}
					/>
					<SelectControl
						label={__('Order by', 'gb-blog')}
						value={orderBy}
						options={[
							{ label: __('Date', 'gb-blog'), value: 'date' },
							{ label: __('Title', 'gb-blog'), value: 'title' },
							{ label: __('Author', 'gb-blog'), value: 'author' }
						]}
						onChange={(value) => setAttributes({ orderBy: value })}
					/>
				</PanelBody>
				<PanelBody title={__('Display Settings', 'gb-blog')}>
					<ToggleControl
						label={__('Show featured image', 'gb-blog')}
						checked={displayFeaturedImage}
						onChange={() => setAttributes({ displayFeaturedImage: !displayFeaturedImage })}
					/>
					<ToggleControl
						label={__('Show excerpt', 'gb-blog')}
						checked={displayExcerpt}
						onChange={() => setAttributes({ displayExcerpt: !displayExcerpt })}
					/>
					<div className="components-base-control">
						<label className="components-base-control__label">
							{__('Background Color', 'gb-blog')}
						</label>
						<ColorPicker
							color={backgroundColor}
							onChangeComplete={(value) => setAttributes({ backgroundColor: value.hex })}
						/>
					</div>
					<div className="components-base-control">
						<label className="components-base-control__label">
							{__('Text Color', 'gb-blog')}
						</label>
						<ColorPicker
							color={textColor}
							onChangeComplete={(value) => setAttributes({ textColor: value.hex })}
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{isLoading ? (
					<Spinner />
				) : (
					<div className="wp-block-gb-blog-blog-posts-grid">
						{posts.map((post) => (
							<article key={post.id} className="post-card">
								{displayFeaturedImage &&
									post._embedded &&
									post._embedded['wp:featuredmedia'] &&
									post._embedded['wp:featuredmedia'][0] &&
									post._embedded['wp:featuredmedia'][0].source_url && (
										<img
											src={post._embedded['wp:featuredmedia'][0].source_url}
											alt={post._embedded['wp:featuredmedia'][0].alt_text || ''}
											className="post-featured-image"
										/>
								)}
								<div className="post-content">
									<h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
									{displayExcerpt && (
										<div
											className="post-excerpt"
											dangerouslySetInnerHTML={{__html: truncateWords(post.content.rendered)}}
										/>
									)}
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</>
	);
}
