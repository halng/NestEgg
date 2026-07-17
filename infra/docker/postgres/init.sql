-- ==========================
-- User Service
-- ==========================
CREATE USER user_user WITH PASSWORD 'user_pass';
CREATE DATABASE user_db;
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_user;
ALTER DATABASE user_db OWNER TO user_user;
\c user_db
GRANT ALL ON SCHEMA public TO user_user;

-- ==========================
-- Portfolio Service
-- ==========================
CREATE USER portfolio_user WITH PASSWORD 'portfolio_pass';
CREATE DATABASE portfolio_db;
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
ALTER DATABASE portfolio_db OWNER TO portfolio_user;
\c portfolio_db
GRANT ALL ON SCHEMA public TO portfolio_user;

-- ==========================
-- Trading Service
-- ==========================
CREATE USER trading_user WITH PASSWORD 'trading_pass';
CREATE DATABASE trading_db;
GRANT ALL PRIVILEGES ON DATABASE trading_db TO trading_user;
ALTER DATABASE trading_db OWNER TO trading_user;
\c trading_db
GRANT ALL ON SCHEMA public TO trading_user;

-- ==========================
-- Order Service
-- ==========================
CREATE USER order_user WITH PASSWORD 'order_pass';
CREATE DATABASE order_db;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_user;
ALTER DATABASE order_db OWNER TO order_user;
\c order_db
GRANT ALL ON SCHEMA public TO order_user;

-- ==========================
-- Notification Service
-- ==========================
CREATE USER notification_user WITH PASSWORD 'notification_pass';
CREATE DATABASE notification_db;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO notification_user;
ALTER DATABASE notification_db OWNER TO notification_user;
\c notification_db
GRANT ALL ON SCHEMA public TO notification_user;

-- ==========================
-- Audit Service
-- ==========================
CREATE USER audit_user WITH PASSWORD 'audit_pass';
CREATE DATABASE audit_db;
GRANT ALL PRIVILEGES ON DATABASE audit_db TO audit_user;
ALTER DATABASE audit_db OWNER TO audit_user;
\c audit_db
GRANT ALL ON SCHEMA public TO audit_user;

-- ==========================
-- Keycloak
-- ==========================
CREATE USER keycloak_user WITH PASSWORD 'keycloak_pass';
CREATE DATABASE keycloak_db;
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
ALTER DATABASE keycloak_db OWNER TO keycloak_user;
\c keycloak_db
GRANT ALL ON SCHEMA public TO keycloak_user;