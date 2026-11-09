
-- ============================================================
-- FITZONE - MEMBER 2 SQL INTEGRATION
-- Database: gym_membership_db
-- Contribution: Ramalakshmi
-- Includes:
--   1. trainer
--   2. trainer_assignment
--   3. attendance
--   4. payment
--   5. daily_attendance_report
--   6. payment_report
--   7. GetMemberPayments
--
-- Prerequisite:
-- Member 1's member and membership tables must exist.
-- No sample data is inserted by this script.
-- ============================================================

USE gym_membership_db;

-- ============================================================
-- 1. TRAINER TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS trainer (
    trainer_id INT NOT NULL AUTO_INCREMENT,
    trainer_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(15) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (trainer_id),
    UNIQUE KEY uq_trainer_phone (phone),
    UNIQUE KEY uq_trainer_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 2. TRAINER ASSIGNMENT TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS trainer_assignment (
    trainer_id INT NOT NULL,
    member_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    PRIMARY KEY (trainer_id, member_id, assigned_date),
    KEY idx_assignment_member (member_id),
    CONSTRAINT fk_assignment_trainer
        FOREIGN KEY (trainer_id)
        REFERENCES trainer (trainer_id),
    CONSTRAINT fk_assignment_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 3. ATTENDANCE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT NOT NULL AUTO_INCREMENT,
    member_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME DEFAULT NULL,
    check_out_time TIME DEFAULT NULL,
    PRIMARY KEY (attendance_id),
    KEY idx_attendance_member (member_id),
    KEY idx_attendance_date (attendance_date),
    CONSTRAINT fk_attendance_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id),
    CONSTRAINT chk_attendance_times
        CHECK (
            check_out_time IS NULL
            OR check_in_time IS NULL
            OR check_out_time >= check_in_time
        )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 4. PAYMENT TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS payment (
    payment_id INT NOT NULL AUTO_INCREMENT,
    membership_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    payment_status ENUM('Completed','Pending','Failed','Refunded')
        DEFAULT 'Pending',
    PRIMARY KEY (payment_id),
    KEY idx_payment_membership (membership_id),
    KEY idx_payment_date (payment_date),
    CONSTRAINT fk_payment_membership
        FOREIGN KEY (membership_id)
        REFERENCES membership (membership_id),
    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- 5. DAILY ATTENDANCE REPORT VIEW
-- ============================================================

CREATE OR REPLACE VIEW daily_attendance_report AS
SELECT
    attendance_date,
    COUNT(*) AS total_attendance,
    COUNT(DISTINCT member_id) AS unique_members
FROM attendance
GROUP BY attendance_date;


-- ============================================================
-- 6. PAYMENT REPORT VIEW
-- ============================================================

CREATE OR REPLACE VIEW payment_report AS
SELECT
    p.payment_id,
    m.member_id,
    m.full_name,
    ms.membership_id,
    p.amount,
    p.payment_date,
    p.payment_method,
    p.payment_status
FROM payment p
JOIN membership ms
    ON p.membership_id = ms.membership_id
JOIN member m
    ON ms.member_id = m.member_id;


-- ============================================================
-- 7. GET MEMBER PAYMENTS STORED PROCEDURE
-- ============================================================

DROP PROCEDURE IF EXISTS GetMemberPayments;

DELIMITER $$

CREATE PROCEDURE GetMemberPayments(IN p_member_id INT)
BEGIN
    SELECT
        member_id,
        full_name,
        membership_id,
        amount,
        payment_date,
        payment_method,
        payment_status
    FROM payment_report
    WHERE member_id = p_member_id;
END $$

DELIMITER ;

-- ============================================================
-- END OF MEMBER 2 SQL INTEGRATION
-- ============================================================
