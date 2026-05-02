-- =============================================
-- Retrack - 연구과제 관리 시스템
-- Database Schema
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id     BIGSERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS PROJECTS (
    project_id   BIGSERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    status       VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    user_id      BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    manager_id   BIGINT REFERENCES USERS(user_id) ON DELETE SET NULL,
    start_date   DATE,
    end_date     DATE,
    budget_total BIGINT DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PROJECT_HISTORY
CREATE TABLE IF NOT EXISTS PROJECT_HISTORY (
    history_id  BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
    changed_by  BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    prev_status VARCHAR(30),
    new_status  VARCHAR(30) NOT NULL,
    comment     TEXT,
    changed_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- BUDGET
CREATE TABLE IF NOT EXISTS BUDGET (
    budget_id   BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
    category    VARCHAR(30) NOT NULL,
    description TEXT,
    amount      BIGINT NOT NULL DEFAULT 0,
    used_by     BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    used_at     TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FILES
CREATE TABLE IF NOT EXISTS FILES (
    file_id     BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES PROJECTS(project_id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_type   VARCHAR(100) NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS ACTIVITY_LOGS (
    log_id      BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    action      VARCHAR(50) NOT NULL,
    target_type VARCHAR(30),
    target_id   BIGINT,
    description TEXT,
    ip_address  VARCHAR(50),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- K_NOTIFICATIONS
CREATE TABLE IF NOT EXISTS K_NOTIFICATIONS (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    project_id      BIGINT REFERENCES PROJECTS(project_id) ON DELETE SET NULL,
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sent_at         TIMESTAMP
);
