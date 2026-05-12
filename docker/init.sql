-- This script runs automatically when the MySQL container starts for the first time.
-- It creates the three databases needed by each microservice.

CREATE DATABASE IF NOT EXISTS smartshop_user     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS smartshop_product  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS smartshop_order    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
