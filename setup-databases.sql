-- Create all databases for pc_store microservices
-- Run this script with: psql -U postgres -f setup-databases.sql

-- User service database
CREATE DATABASE userservice;

-- Product service database
CREATE DATABASE product;

-- Order service database
CREATE DATABASE "order";

-- Payment service database
CREATE DATABASE payment;

-- Inventory service database
CREATE DATABASE inventory;

-- Favorite service database
CREATE DATABASE favorite;

-- Rating service database
CREATE DATABASE rating;

-- Shipping service database
CREATE DATABASE shipping;

-- Tax service database
CREATE DATABASE tax;

-- Promotion service database
CREATE DATABASE promotion;

-- Media service database
CREATE DATABASE media;

-- Identity service database
CREATE DATABASE identityservice;

-- Notification service database
CREATE DATABASE notification;

-- Search service database
CREATE DATABASE search;

\dt
