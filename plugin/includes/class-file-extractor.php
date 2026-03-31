<?php

namespace Bpwc;

class File_Extractor {

	/**
	 * Extract text content from a file attachment.
	 */
	public static function extract( int $attachment_id ): string {
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path || ! file_exists( $file_path ) ) {
			return '';
		}

		$mime = get_post_mime_type( $attachment_id );

		return match ( true ) {
			self::is_text( $mime )     => self::extract_text( $file_path ),
			self::is_csv( $mime )      => self::extract_csv( $file_path ),
			self::is_pdf( $mime )      => self::extract_pdf( $file_path ),
			default                    => '',
		};
	}

	/**
	 * Get supported MIME types.
	 */
	public static function get_supported_types(): array {
		return [
			'text/plain'       => 'TXT',
			'text/markdown'    => 'Markdown',
			'text/csv'         => 'CSV',
			'application/pdf'  => 'PDF',
		];
	}

	private static function is_text( string $mime ): bool {
		return in_array( $mime, [ 'text/plain', 'text/markdown' ], true );
	}

	private static function is_csv( string $mime ): bool {
		return 'text/csv' === $mime;
	}

	private static function is_pdf( string $mime ): bool {
		return 'application/pdf' === $mime;
	}

	private static function extract_text( string $path ): string {
		$content = file_get_contents( $path );
		return mb_convert_encoding( $content, 'UTF-8', mb_detect_encoding( $content ) );
	}

	private static function extract_csv( string $path ): string {
		$rows = [];
		$handle = fopen( $path, 'r' );
		if ( ! $handle ) {
			return '';
		}

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			$rows[] = implode( ' | ', $row );
		}
		fclose( $handle );

		return implode( "\n", $rows );
	}

	/**
	 * Basic PDF text extraction.
	 * Handles simple text-based PDFs. For complex PDFs with images/scans,
	 * a dedicated library like smalot/pdfparser would be needed.
	 */
	private static function extract_pdf( string $path ): string {
		$content = file_get_contents( $path );
		if ( ! $content ) {
			return '';
		}

		$text = '';

		// Extract text between stream/endstream markers.
		if ( preg_match_all( '/stream\s*\n(.*?)\nendstream/s', $content, $matches ) ) {
			foreach ( $matches[1] as $stream ) {
				// Try to decompress (FlateDecode).
				$decoded = @gzuncompress( $stream );
				if ( false === $decoded ) {
					$decoded = $stream;
				}

				// Extract text from BT/ET blocks.
				if ( preg_match_all( '/\(([^)]+)\)/', $decoded, $text_matches ) ) {
					$text .= implode( ' ', $text_matches[1] ) . "\n";
				}

				// Extract text from TJ arrays.
				if ( preg_match_all( '/\[(.*?)\]\s*TJ/s', $decoded, $tj_matches ) ) {
					foreach ( $tj_matches[1] as $tj ) {
						if ( preg_match_all( '/\(([^)]*)\)/', $tj, $parts ) ) {
							$text .= implode( '', $parts[1] ) . ' ';
						}
					}
					$text .= "\n";
				}
			}
		}

		$text = preg_replace( '/\s+/', ' ', $text );
		$text = trim( $text );

		if ( empty( $text ) ) {
			return __( '(PDF text extraction failed — the file may contain scanned images. Consider using a text-based PDF or uploading the content as Text source instead.)', 'botpress-webchat' );
		}

		return $text;
	}
}
