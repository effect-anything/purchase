DELETE FROM paykit_credit_ledger
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_entitlement
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_invoice
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_subscription
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_checkout_intent
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_commercial_event
WHERE customer_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_provider_ref
WHERE owner_type = 'customer'
  AND owner_id IN ('studio_acme', 'solo_mia', 'agency_north');

DELETE FROM paykit_customer
WHERE id IN ('studio_acme', 'solo_mia', 'agency_north');
