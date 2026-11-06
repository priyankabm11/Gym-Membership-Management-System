
CREATE DATABASE IF NOT EXISTS gym_membership_db;
USE gym_membership_db;

-- Table 1: Member
CREATE TABLE IF NOT EXISTS Member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    gender VARCHAR(20) DEFAULT NULL,
    join_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Membership_Plan
CREATE TABLE IF NOT EXISTS Membership_Plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL UNIQUE,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    CONSTRAINT chk_plan_duration CHECK (duration_months > 0),
    CONSTRAINT chk_plan_price CHECK (price >= 0)
);

-- Table 3: Membership
CREATE TABLE IF NOT EXISTS Membership (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Expired', 'Cancelled')
        NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_membership_member
        FOREIGN KEY (member_id) REFERENCES Member(member_id),
    CONSTRAINT fk_membership_plan
        FOREIGN KEY (plan_id) REFERENCES Membership_Plan(plan_id),
    CONSTRAINT chk_membership_dates
        CHECK (end_date >= start_date)
);

-- Sample membership plans
INSERT INTO Membership_Plan
    (plan_name, duration_months, price, description)
VALUES
    ('Monthly', 1, 1500.00, 'One-month gym membership'),
    ('Quarterly', 3, 4000.00, 'Three-month gym membership'),
    ('Half-Yearly', 6, 7500.00, 'Six-month gym membership'),
    ('Yearly', 12, 12000.00, 'Twelve-month gym membership');

-- Sample members
INSERT INTO Member
    (full_name, email, phone, gender, join_date)
VALUES
    ('Priya Sharma', 'priya.sharma@gmail.com', '9876543210', 'Female', '2026-10-18'),
    ('Rahul Kumar', 'rahul.kumar@gmail.com', '9876543211', 'Male', '2026-10-18'),
    ('Ananya Rao', 'ananya.rao@gmail.com', '9876543212', 'Female', '2026-10-18'),
    ('Arjun Reddy', 'arjun.reddy@gmail.com', '9876543213', 'Male', '2026-10-18'),
    ('Sneha Nair', 'sneha.nair@gmail.com', '9876543214', 'Female', '2026-10-18');

-- Sample memberships
INSERT INTO Membership
    (member_id, plan_id, start_date, end_date, status)
VALUES
    (1, 1, '2026-10-01', '2026-10-31', 'Active'),
    (2, 2, '2026-10-01', '2026-12-31', 'Active'),
    (3, 3, '2026-10-01', '2027-03-31', 'Active'),
    (4, 4, '2026-10-01', '2027-09-30', 'Active'),
    (5, 1, '2026-10-15', '2026-11-14', 'Active');