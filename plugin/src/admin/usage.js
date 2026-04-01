import { createRoot } from '@wordpress/element';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { Button, Spinner, TextControl, CheckboxControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import './usage.css';

function StatCard( { label, value, sub } ) {
	return (
		<div className="bpwc-usage__stat-card">
			<div className="bpwc-usage__stat-value">{ value }</div>
			<div className="bpwc-usage__stat-label">{ label }</div>
			{ sub && <div className="bpwc-usage__stat-sub">{ sub }</div> }
		</div>
	);
}

function BudgetBar( { spent, budget } ) {
	if ( ! budget || budget <= 0 ) {
		return null;
	}

	const pct = Math.min( ( spent / budget ) * 100, 100 );
	let barClass = 'bpwc-usage__budget-fill';
	if ( pct >= 100 ) {
		barClass += ' is-danger';
	} else if ( pct >= 80 ) {
		barClass += ' is-warning';
	}

	return (
		<div className="bpwc-usage__budget">
			<div className="bpwc-usage__budget-header">
				<span>Budget</span>
				<span>{ pct.toFixed( 1 ) }% (${ spent.toFixed( 2 ) } / ${ budget.toFixed( 2 ) })</span>
			</div>
			<div className="bpwc-usage__budget-track">
				<div className={ barClass } style={ { width: pct + '%' } } />
			</div>
		</div>
	);
}

function BarChart( { data, dataKey, label, color = 'var(--bpwc-primary)' } ) {
	if ( ! data || data.length === 0 ) {
		return <div className="bpwc-usage__chart-empty">{ __( 'No data yet.', 'botpress-webchat' ) }</div>;
	}

	const values = data.map( ( d ) => d[ dataKey ] || 0 );
	const max = Math.max( ...values, 1 );

	return (
		<div className="bpwc-usage__chart">
			<div className="bpwc-usage__chart-title">{ label }</div>
			<div className="bpwc-usage__chart-area">
				{ data.map( ( d, i ) => {
					const val = d[ dataKey ] || 0;
					const height = ( val / max ) * 100;
					const day = d.date ? parseInt( d.date.split( '-' )[ 2 ], 10 ) : i + 1;

					return (
						<div key={ i } className="bpwc-usage__bar-col" title={ `${ d.date }: ${ dataKey === 'ai_spend_usd' ? '$' + val.toFixed( 4 ) : val }` }>
							<div className="bpwc-usage__bar-wrapper">
								<div
									className="bpwc-usage__bar"
									style={ { height: height + '%', background: color } }
								/>
							</div>
							<span className="bpwc-usage__bar-label">{ day }</span>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}

function MonthSelector( { year, month, onChange } ) {
	const months = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
	];

	const prev = () => {
		if ( month === 1 ) {
			onChange( year - 1, 12 );
		} else {
			onChange( year, month - 1 );
		}
	};

	const next = () => {
		if ( month === 12 ) {
			onChange( year + 1, 1 );
		} else {
			onChange( year, month + 1 );
		}
	};

	return (
		<div className="bpwc-usage__month-selector">
			<button className="bpwc-usage__month-btn" onClick={ prev }>&lsaquo;</button>
			<span className="bpwc-usage__month-label">{ months[ month - 1 ] } { year }</span>
			<button className="bpwc-usage__month-btn" onClick={ next }>&rsaquo;</button>
		</div>
	);
}

function App() {
	const now = new Date();
	const [ year, setYear ] = useState( now.getFullYear() );
	const [ month, setMonth ] = useState( now.getMonth() + 1 );
	const [ summary, setSummary ] = useState( null );
	const [ daily, setDaily ] = useState( null );
	const [ limit, setLimit ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	// Budget form state
	const [ budgetInput, setBudgetInput ] = useState( '' );
	const [ notify80, setNotify80 ] = useState( false );
	const [ notify100, setNotify100 ] = useState( false );
	const [ stopAtLimit, setStopAtLimit ] = useState( false );

	const fetchData = useCallback( async () => {
		setLoading( true );
		try {
			const params = `year=${ year }&month=${ month }`;
			const [ summaryRes, dailyRes, limitRes ] = await Promise.all( [
				apiFetch( { path: `/bpwc/v1/usage?${ params }` } ),
				apiFetch( { path: `/bpwc/v1/usage/daily?${ params }` } ),
				apiFetch( { path: '/bpwc/v1/usage/limit' } ),
			] );

			if ( summaryRes.success ) setSummary( summaryRes.data );
			if ( dailyRes.success ) setDaily( dailyRes.data );
			if ( limitRes.success ) {
				setLimit( limitRes.data );
				setBudgetInput( String( limitRes.data.monthly_budget_usd || '' ) );
				setNotify80( limitRes.data.notify_at_80 || false );
				setNotify100( limitRes.data.notify_at_100 || false );
				setStopAtLimit( limitRes.data.stop_at_limit || false );
			}
		} catch {
			// On error, show zeroed dashboard instead of empty state.
			setSummary( {
				ai_spend_usd: 0,
				messages: 0,
				conversations: 0,
				input_tokens: 0,
				output_tokens: 0,
				budget_usd: 0,
				budget_percent: 0,
			} );
			setDaily( [] );
		}
		setLoading( false );
	}, [ year, month ] );

	useEffect( () => {
		fetchData();
	}, [ fetchData ] );

	const handleMonthChange = ( newYear, newMonth ) => {
		setYear( newYear );
		setMonth( newMonth );
	};

	const saveBudget = async () => {
		setSaving( true );
		setNotice( null );
		try {
			const res = await apiFetch( {
				path: '/bpwc/v1/usage/limit',
				method: 'POST',
				data: {
					monthly_budget_usd: parseFloat( budgetInput ) || 0,
					notify_at_80: notify80,
					notify_at_100: notify100,
					stop_at_limit: stopAtLimit,
				},
			} );
			if ( res.success ) {
				setLimit( res.data );
				setNotice( { type: 'success', text: __( 'Budget settings saved.', 'botpress-webchat' ) } );
				// Refresh summary to update budget display
				fetchData();
			}
		} catch {
			setNotice( { type: 'error', text: __( 'Error saving budget settings.', 'botpress-webchat' ) } );
		}
		setSaving( false );
	};

	return (
		<div className="bpwc-page">
			<div className="bpwc-page__topbar">
				<div className="bpwc-page__topbar-left">
					<span className="dashicons dashicons-format-chat" />
					<h1 className="bpwc-page__title">Webchat</h1>
					<span className="bpwc-page__breadcrumb">Usage</span>
				</div>
				<div className="bpwc-page__topbar-right">
					<MonthSelector year={ year } month={ month } onChange={ handleMonthChange } />
				</div>
			</div>

			<div className="bpwc-page__content" style={ { padding: '32px 48px' } }>
				{ loading ? (
					<div style={ { display: 'flex', justifyContent: 'center', padding: '64px 0' } }>
						<Spinner />
					</div>
				) : ! summary ? (
					<div className="bpwc-empty">
						<div className="bpwc-empty__icon">
							<span className="dashicons dashicons-chart-bar" />
						</div>
						<h3>{ __( 'No usage data available', 'botpress-webchat' ) }</h3>
						<p>{ __( 'Usage data will appear here once the bot starts handling conversations.', 'botpress-webchat' ) }</p>
					</div>
				) : (
					<>
						{ notice && (
							<div className={ `bpwc-notice bpwc-notice--${ notice.type }` }>
								{ notice.text }
							</div>
						) }

						{ /* Stat Cards */ }
						<div className="bpwc-usage__stats">
							<StatCard
								label={ __( 'AI Spend', 'botpress-webchat' ) }
								value={ `$${ summary.ai_spend_usd.toFixed( 2 ) }` }
								sub={ __( 'this month', 'botpress-webchat' ) }
							/>
							<StatCard
								label={ __( 'Messages', 'botpress-webchat' ) }
								value={ summary.messages.toLocaleString() }
								sub={ __( 'this month', 'botpress-webchat' ) }
							/>
							<StatCard
								label={ __( 'Conversations', 'botpress-webchat' ) }
								value={ summary.conversations.toLocaleString() }
								sub={ __( 'this month', 'botpress-webchat' ) }
							/>
							<StatCard
								label={ __( 'Tokens', 'botpress-webchat' ) }
								value={ ( summary.input_tokens + summary.output_tokens ).toLocaleString() }
								sub={ `${ summary.input_tokens.toLocaleString() } in / ${ summary.output_tokens.toLocaleString() } out` }
							/>
						</div>

						{ /* Budget Bar */ }
						<BudgetBar spent={ summary.ai_spend_usd } budget={ summary.budget_usd } />

						{ /* Charts */ }
						<div className="bpwc-usage__charts">
							<div className="bpwc-panel">
								<BarChart
									data={ daily }
									dataKey="ai_spend_usd"
									label={ __( 'Daily AI Spend ($)', 'botpress-webchat' ) }
									color="var(--bpwc-primary)"
								/>
							</div>
							<div className="bpwc-panel">
								<BarChart
									data={ daily }
									dataKey="messages"
									label={ __( 'Daily Messages', 'botpress-webchat' ) }
									color="var(--bpwc-accent)"
								/>
							</div>
						</div>

						{ /* Budget Limit Settings */ }
						<div className="bpwc-panel">
							<h2>{ __( 'Budget Limit', 'botpress-webchat' ) }</h2>

							<div className="bpwc-usage__budget-form">
								<div className="bpwc-usage__budget-input-row">
									<label>{ __( 'Monthly budget (USD)', 'botpress-webchat' ) }</label>
									<div className="bpwc-usage__budget-input-wrap">
										<span className="bpwc-usage__budget-currency">$</span>
										<TextControl
											value={ budgetInput }
											onChange={ setBudgetInput }
											type="number"
											min="0"
											step="0.01"
											placeholder="0.00"
										/>
									</div>
								</div>

								<div className="bpwc-usage__budget-checks">
									<CheckboxControl
										label={ __( 'Notify me at 80%', 'botpress-webchat' ) }
										checked={ notify80 }
										onChange={ setNotify80 }
									/>
									<CheckboxControl
										label={ __( 'Notify me at 100%', 'botpress-webchat' ) }
										checked={ notify100 }
										onChange={ setNotify100 }
									/>
									<CheckboxControl
										label={ __( 'Stop bot at limit', 'botpress-webchat' ) }
										checked={ stopAtLimit }
										onChange={ setStopAtLimit }
									/>
								</div>

								<Button
									className="bpwc-btn-primary"
									onClick={ saveBudget }
									isBusy={ saving }
									disabled={ saving }
								>
									{ __( 'Save', 'botpress-webchat' ) }
								</Button>
							</div>
						</div>
					</>
				) }
			</div>
		</div>
	);
}

document.addEventListener( 'DOMContentLoaded', () => {
	const root = document.getElementById( 'bpwc-usage-root' );
	if ( root ) {
		createRoot( root ).render( <App /> );
	}
} );
