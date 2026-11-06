
CREATE DATABASE IF NOT EXISTS gym_membership_db;

USE gym_membership_db;

-- Table 1: Gym members
CREATE TABLE IF NOT EXISTS Member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    gender VARCHAR(20),
    join_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Available membership plans
CREATE TABLE IF NOT EXISTS Membership_Plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL UNIQUE,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT chk_plan_duration CHECK (duration_months > 0),
    CONSTRAINT chk_plan_price CHECK (price >= 0)
);

-- Table 3: Membership records
CREATE TABLE IF NOT EXISTS Membership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Expired', 'Cancelled') NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_membership_member
        FOREIGN KEY (member_id) REFERENCES Member(member_id),
    CONSTRAINT fk_membership_plan
        FOREIGN KEY (plan_id) REFERENCES Membership_Plan(plan_id),
    CONSTRAINT chk_membership_dates CHECK (end_date >= start_date)
);

