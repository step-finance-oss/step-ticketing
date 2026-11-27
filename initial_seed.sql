INSERT INTO public."Event" (id, title, date, description, published, "ticketsAvailabilityDuration", "priceTierDescription") VALUES ('cm34kkhqu0000ugi3n6x0u2cu', 'Crossroads demo', CURRENT_DATE + INTERVAL '30 days', 'Local sample based on Solana Crossroads 2025.', true, 48, 'Secure your spot and get ready to connect, learn, and build with the best in the decentralized world!');
INSERT INTO public."PriceTier" (id, title, "eventId", price, description, "limit", "isMostPopular", options, "registrationFormURL") VALUES ('cm34krrdx0001ugi3462vb9i7', 'General', 'cm34kkhqu0000ugi3n6x0u2cu', 99.00, 'Basic option', 200, false, '["Admission to speaker stages and exhibition halls", "Coffee/Tea"]', null);
INSERT INTO public."PriceTier" (id, title, "eventId", price, description, "limit", "isMostPopular", options, "registrationFormURL") VALUES ('cm34ksb6b0002ugi3x784u78e', 'VIP', 'cm34kkhqu0000ugi3n6x0u2cu', 149.00, 'VIP access', 100, false, '["VIP lunch included both days of the event", "Access to VIP Lounge all conference", "Admission to Crossroads Closing Celebration/Afterparty", "VIP Merch bag"]', null);

INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wk0g70003h5am68e32w3k', 'cm34krrdx0001ugi3462vb9i7', CURRENT_DATE + INTERVAL '29 days', 249.00, 'Regular Admission');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wqefx0007h5amg8ssvdis', 'cm34ksb6b0002ugi3x784u78e', CURRENT_DATE + INTERVAL '29 days', 449.00, 'Regular Admission');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wnp5s0004h5ampf5d0l0m', 'cm34ksb6b0002ugi3x784u78e', CURRENT_DATE + INTERVAL '7 days', 149.00, 'Pre-Sale');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36whd110001h5am22zrigip', 'cm34krrdx0001ugi3462vb9i7', CURRENT_DATE + INTERVAL '14 days', 149.00, 'Early bird');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36woim20005h5amagh2yoh2', 'cm34ksb6b0002ugi3x784u78e', CURRENT_DATE + INTERVAL '14 days', 249.00, 'Early bird');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wpwtw0006h5amnsd7erm1', 'cm34ksb6b0002ugi3x784u78e', CURRENT_DATE + INTERVAL '21 days', 349.00, 'Early Access');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wintx0002h5ambmswa7ts', 'cm34krrdx0001ugi3462vb9i7', CURRENT_DATE + INTERVAL '21 days', 199.00, 'Early Access');
INSERT INTO public."PriceOption" (id, "priceTierId", "validUntil", price, label) VALUES ('cm36wfs4d0000h5ama4o2009h', 'cm34krrdx0001ugi3462vb9i7', CURRENT_DATE + INTERVAL '7 days', 99.00, 'Pre-Sale');


INSERT INTO "MerchOption" ("id", "label", "eventId", "options")
SELECT gen_random_uuid(), 'Shirt', id, '{"size": ["S", "M", "L", "XL", "XXL"]}' FROM "Event" WHERE id = 'cm34kkhqu0000ugi3n6x0u2cu';
