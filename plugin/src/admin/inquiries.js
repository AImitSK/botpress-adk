import { createRoot } from '@wordpress/element';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { Button, Spinner, TextControl, TextareaControl, CheckboxControl, SelectControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import './inquiries.css';

const STATUS_LABELS = {
	new: 'Neu',
	read: 'Gelesen',
	replied: 'Beantwortet',
	archived: 'Archiviert',
};

const STATUS_COLORS = {
	new: 'bpwc-badge--error',
	read: 'bpwc-badge--muted',
	replied: 'bpwc-badge--success',
	archived: 'bpwc-badge--muted',
};

function InquiryRow( { item, onStatusChange } ) {
	const date = new Date( item.created_at ).toLocaleString( 'de-DE', {
		day: '2-digit', month: '2-digit', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	} );

	return (
		<tr className={ item.status === 'new' ? 'bpwc-inquiries__row--new' : '' }>
			<td className="bpwc-inquiries__cell-status">
				<span className={ `bpwc-badge ${ STATUS_COLORS[ item.status ] || '' }` }>
					{ STATUS_LABELS[ item.status ] || item.status }
				</span>
			</td>
			<td>
				<strong>{ item.name }</strong>
				{ item.email && <div className="bpwc-inquiries__contact">{ item.email }</div> }
				{ item.phone && <div className="bpwc-inquiries__contact">{ item.phone }</div> }
			</td>
			<td className="bpwc-inquiries__cell-message">{ item.message }</td>
			<td className="bpwc-inquiries__cell-date">{ date }</td>
			<td className="bpwc-inquiries__cell-icons">
				{ item.notify_sent === '1' && <span title="Team benachrichtigt" className="dashicons dashicons-email-alt" /> }
				{ item.confirm_sent === '1' && <span title="Bestätigung gesendet" className="dashicons dashicons-yes-alt" /> }
			</td>
			<td className="bpwc-inquiries__cell-actions">
				<SelectControl
					value={ item.status }
					options={ Object.entries( STATUS_LABELS ).map( ( [ k, v ] ) => ( { value: k, label: v } ) ) }
					onChange={ ( v ) => onStatusChange( item.id, v ) }
					__nextHasNoMarginBottom
				/>
			</td>
		</tr>
	);
}

function NotificationSettings() {
	const [ settings, setSettings ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/bpwc/v1/settings' } ).then( ( res ) => {
			if ( res.success ) {
				setSettings( res.data.notifications || {} );
			}
		} );
	}, [] );

	const update = ( key, value ) => {
		setSettings( { ...settings, [ key ]: value } );
	};

	const save = async () => {
		setSaving( true );
		setNotice( null );
		try {
			const res = await apiFetch( {
				path: '/bpwc/v1/settings',
				method: 'POST',
				data: { notifications: settings },
			} );
			if ( res.success ) {
				setNotice( { type: 'success', text: __( 'Settings saved.', 'botpress-webchat' ) } );
			}
		} catch {
			setNotice( { type: 'error', text: __( 'Error saving settings.', 'botpress-webchat' ) } );
		}
		setSaving( false );
	};

	if ( ! settings ) {
		return <Spinner />;
	}

	return (
		<div className="bpwc-panel">
			<h2>{ __( 'Notification Settings', 'botpress-webchat' ) }</h2>

			{ notice && (
				<div className={ `bpwc-notice bpwc-notice--${ notice.type }` }>{ notice.text }</div>
			) }

			<div className="bpwc-inquiries__settings-grid">
				<div>
					<h3>SendGrid</h3>
					<TextControl
						label={ __( 'API Key', 'botpress-webchat' ) }
						value={ settings.sendgrid_api_key || '' }
						onChange={ ( v ) => update( 'sendgrid_api_key', v ) }
						type="password"
					/>
					<TextControl
						label={ __( 'From Email', 'botpress-webchat' ) }
						value={ settings.sendgrid_from_email || '' }
						onChange={ ( v ) => update( 'sendgrid_from_email', v ) }
						type="email"
						placeholder="bot@example.com"
					/>
					<TextControl
						label={ __( 'From Name', 'botpress-webchat' ) }
						value={ settings.sendgrid_from_name || '' }
						onChange={ ( v ) => update( 'sendgrid_from_name', v ) }
						placeholder="Chatbot"
					/>
				</div>

				<div>
					<h3>{ __( 'Team Notification', 'botpress-webchat' ) }</h3>
					<TextareaControl
						label={ __( 'Recipient emails (comma-separated)', 'botpress-webchat' ) }
						value={ settings.notify_emails || '' }
						onChange={ ( v ) => update( 'notify_emails', v ) }
						rows={ 2 }
						placeholder="team@example.com, support@example.com"
					/>

					<hr />
					<h3>{ __( 'Customer Confirmation', 'botpress-webchat' ) }</h3>
					<CheckboxControl
						label={ __( 'Send confirmation email to customer', 'botpress-webchat' ) }
						checked={ !! settings.customer_confirmation }
						onChange={ ( v ) => update( 'customer_confirmation', v ) }
					/>
					{ !! settings.customer_confirmation && (
						<>
							<TextControl
								label={ __( 'Subject', 'botpress-webchat' ) }
								value={ settings.confirm_subject || '' }
								onChange={ ( v ) => update( 'confirm_subject', v ) }
							/>
							<TextareaControl
								label={ __( 'Message template', 'botpress-webchat' ) }
								help={ __( 'Placeholders: {name}, {site_name}, {message}', 'botpress-webchat' ) }
								value={ settings.confirm_message || '' }
								onChange={ ( v ) => update( 'confirm_message', v ) }
								rows={ 5 }
							/>
						</>
					) }
				</div>
			</div>

			<Button className="bpwc-btn-primary" onClick={ save } isBusy={ saving } disabled={ saving }>
				{ __( 'Save Settings', 'botpress-webchat' ) }
			</Button>
		</div>
	);
}

function App() {
	const [ inquiries, setInquiries ] = useState( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ loading, setLoading ] = useState( true );
	const [ filter, setFilter ] = useState( '' );
	const [ tab, setTab ] = useState( 'list' );

	const fetchInquiries = useCallback( async () => {
		setLoading( true );
		try {
			const params = `limit=50&offset=0${ filter ? '&status=' + filter : '' }`;
			const res = await apiFetch( { path: `/bpwc/v1/inquiries?${ params }` } );
			if ( res.success ) {
				setInquiries( res.data );
				setTotal( res.total );
			}
		} catch {
			setInquiries( [] );
		}
		setLoading( false );
	}, [ filter ] );

	useEffect( () => {
		fetchInquiries();
	}, [ fetchInquiries ] );

	const handleStatusChange = async ( id, status ) => {
		await apiFetch( {
			path: `/bpwc/v1/inquiries/${ id }/status`,
			method: 'POST',
			data: { status },
		} );
		fetchInquiries();
	};

	return (
		<div className="bpwc-page">
			<div className="bpwc-page__topbar">
				<div className="bpwc-page__topbar-left">
					<span className="dashicons dashicons-format-chat" />
					<h1 className="bpwc-page__title">Webchat</h1>
					<span className="bpwc-page__breadcrumb">Inquiries</span>
				</div>
			</div>

			<div className="bpwc-page__content" style={ { padding: '32px 48px' } }>
				<div className="bpwc-inquiries__tabs">
					<button
						className={ `bpwc-inquiries__tab ${ tab === 'list' ? 'is-active' : '' }` }
						onClick={ () => setTab( 'list' ) }
					>
						{ __( 'Inquiries', 'botpress-webchat' ) }
						{ total > 0 && <span className="bpwc-inquiries__tab-count">{ total }</span> }
					</button>
					<button
						className={ `bpwc-inquiries__tab ${ tab === 'settings' ? 'is-active' : '' }` }
						onClick={ () => setTab( 'settings' ) }
					>
						{ __( 'Notification Settings', 'botpress-webchat' ) }
					</button>
				</div>

				{ tab === 'list' && (
					<>
						<div className="bpwc-inquiries__filters">
							<SelectControl
								value={ filter }
								options={ [
									{ value: '', label: __( 'All', 'botpress-webchat' ) },
									{ value: 'new', label: 'Neu' },
									{ value: 'read', label: 'Gelesen' },
									{ value: 'replied', label: 'Beantwortet' },
									{ value: 'archived', label: 'Archiviert' },
								] }
								onChange={ setFilter }
								__nextHasNoMarginBottom
							/>
						</div>

						{ loading ? (
							<div style={ { display: 'flex', justifyContent: 'center', padding: '64px 0' } }>
								<Spinner />
							</div>
						) : inquiries.length === 0 ? (
							<div className="bpwc-empty">
								<div className="bpwc-empty__icon">
									<span className="dashicons dashicons-email" />
								</div>
								<h3>{ __( 'No inquiries yet', 'botpress-webchat' ) }</h3>
								<p>{ __( 'Inquiries from chatbot visitors will appear here.', 'botpress-webchat' ) }</p>
							</div>
						) : (
							<div className="bpwc-panel" style={ { padding: 0, overflow: 'hidden' } }>
								<table className="bpwc-inquiries__table">
									<thead>
										<tr>
											<th>{ __( 'Status', 'botpress-webchat' ) }</th>
											<th>{ __( 'Contact', 'botpress-webchat' ) }</th>
											<th>{ __( 'Message', 'botpress-webchat' ) }</th>
											<th>{ __( 'Date', 'botpress-webchat' ) }</th>
											<th></th>
											<th>{ __( 'Action', 'botpress-webchat' ) }</th>
										</tr>
									</thead>
									<tbody>
										{ inquiries.map( ( item ) => (
											<InquiryRow
												key={ item.id }
												item={ item }
												onStatusChange={ handleStatusChange }
											/>
										) ) }
									</tbody>
								</table>
							</div>
						) }
					</>
				) }

				{ tab === 'settings' && <NotificationSettings /> }
			</div>
		</div>
	);
}

document.addEventListener( 'DOMContentLoaded', () => {
	const root = document.getElementById( 'bpwc-inquiries-root' );
	if ( root ) {
		createRoot( root ).render( <App /> );
	}
} );
