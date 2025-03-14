-- Insert Admin and User Accounts
INSERT INTO users (id, name, email, password, role) VALUES 
(0, 'Admin User', 'admin@example.com', '$2b$10$LNOGqmUOBaqzB7nf1.szFOdlxd9mtQxF620LhFPVvRuqr6t6MUyEW', 'admin'),
(NULL, 'Regular User', 'user@example.com', '$2b$10$Av/ywYAOCRVupBXMSsdcnuPziIcAdV2KbPwQOwxXAF776vw9Vn1BS', 'user');
