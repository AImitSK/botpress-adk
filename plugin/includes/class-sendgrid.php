<?php

namespace Bpwc;

class Sendgrid {

	/**
	 * Send an email via SendGrid API.
	 *
	 * @return true|\WP_Error
	 */
	public static function send( string $to, string $subject, string $body, string $reply_to = '' ): true|\WP_Error {
		$api_key    = Settings::get( 'notifications.sendgrid_api_key', '' );
		$from_email = Settings::get( 'notifications.sendgrid_from_email', '' );
		$from_name  = Settings::get( 'notifications.sendgrid_from_name', '' ) ?: get_bloginfo( 'name' );

		if ( empty( $api_key ) || empty( $from_email ) ) {
			// Fallback to wp_mail if SendGrid not configured.
			$headers = [ 'Content-Type: text/plain; charset=UTF-8' ];
			if ( $reply_to ) {
				$headers[] = 'Reply-To: ' . $reply_to;
			}

			$sent = wp_mail( $to, $subject, $body, $headers );
			return $sent ? true : new \WP_Error( 'mail_failed', 'wp_mail failed' );
		}

		$payload = [
			'personalizations' => [
				[
					'to' => [ [ 'email' => $to ] ],
				],
			],
			'from'    => [
				'email' => $from_email,
				'name'  => $from_name,
			],
			'subject' => $subject,
			'content' => [
				[
					'type'  => 'text/plain',
					'value' => $body,
				],
			],
		];

		if ( $reply_to ) {
			$payload['reply_to'] = [ 'email' => $reply_to ];
		}

		$response = wp_remote_post( 'https://api.sendgrid.com/v3/mail/send', [
			'headers' => [
				'Authorization' => 'Bearer ' . $api_key,
				'Content-Type'  => 'application/json',
			],
			'body'    => wp_json_encode( $payload ),
			'timeout' => 15,
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code < 200 || $code >= 300 ) {
			$body_text = wp_remote_retrieve_body( $response );
			return new \WP_Error( 'sendgrid_error', "SendGrid API error: {$code} — {$body_text}" );
		}

		return true;
	}

	/**
	 * Send team notification for a new inquiry.
	 */
	public static function notify_team( object $inquiry ): bool {
		$emails = Settings::get( 'notifications.notify_emails', '' );

		if ( empty( $emails ) ) {
			return false;
		}

		$recipients = array_map( 'trim', explode( ',', $emails ) );
		$site_name  = get_bloginfo( 'name' );
		$subject    = "[{$site_name}] Neue Anfrage von {$inquiry->name}";

		$body = "Neue Anfrage über den Chatbot:\n\n";
		$body .= "Name: {$inquiry->name}\n";
		if ( $inquiry->email ) {
			$body .= "E-Mail: {$inquiry->email}\n";
		}
		if ( $inquiry->phone ) {
			$body .= "Telefon: {$inquiry->phone}\n";
		}
		$body .= "\nNachricht:\n{$inquiry->message}\n";
		$body .= "\n---\nEingegangen am: {$inquiry->created_at}";

		$reply_to = $inquiry->email ?: '';
		$success  = true;

		foreach ( $recipients as $to ) {
			if ( ! is_email( $to ) ) {
				continue;
			}
			$result = self::send( $to, $subject, $body, $reply_to );
			if ( is_wp_error( $result ) ) {
				$success = false;
			}
		}

		return $success;
	}

	/**
	 * Send confirmation email to the customer.
	 */
	public static function confirm_customer( object $inquiry ): bool {
		if ( ! Settings::get( 'notifications.customer_confirmation', true ) ) {
			return false;
		}

		if ( empty( $inquiry->email ) ) {
			return false;
		}

		$site_name = get_bloginfo( 'name' );
		$subject   = Settings::get( 'notifications.confirm_subject', '' ) ?: 'Wir haben Ihre Anfrage erhalten';
		$template  = Settings::get( 'notifications.confirm_message', '' );

		if ( empty( $template ) ) {
			return false;
		}

		$body = str_replace(
			[ '{name}', '{site_name}', '{message}' ],
			[ $inquiry->name, $site_name, $inquiry->message ],
			$template
		);

		$result = self::send( $inquiry->email, $subject, $body );
		return ! is_wp_error( $result );
	}
}
