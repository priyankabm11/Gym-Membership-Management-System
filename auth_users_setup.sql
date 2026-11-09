USE gym_membership_db;

CREATE TABLE IF NOT EXISTS auth_users (
    user_id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    member_id INT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY email (email),
    UNIQUE KEY member_id (member_id),
    CONSTRAINT fk_auth_member
        FOREIGN KEY (member_id)
        REFERENCES Member(member_id)
        ON DELETE SET NULL
);
