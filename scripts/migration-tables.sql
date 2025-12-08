-- Migration script to create additional tables for extended features

-- Portfolio Items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200),
  description TEXT,
  media_url TEXT,
  media_type ENUM('image', 'video', 'audio', 'link') DEFAULT 'image',
  work_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT portfolio_items_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200),
  description TEXT,
  event_type ENUM('workshop', 'audition', 'seminar', 'networking') DEFAULT 'workshop',
  location VARCHAR(150),
  event_date DATETIME,
  registration_deadline DATE,
  organizer_id BIGINT,
  max_participants INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY organizer_id (organizer_id),
  CONSTRAINT events_ibfk_1 FOREIGN KEY (organizer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY event_id (event_id),
  KEY user_id (user_id),
  CONSTRAINT event_registrations_ibfk_1 FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT event_registrations_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200),
  message TEXT,
  notification_type ENUM('application_update', 'message', 'casting_alert', 'subscription', 'system') DEFAULT 'system',
  related_id BIGINT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  user_id BIGINT NOT NULL,
  specialization VARCHAR(100),
  experience_years INT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  availability VARCHAR(100),
  portfolio_link TEXT,
  certifications TEXT,
  PRIMARY KEY (user_id),
  CONSTRAINT technicians_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan_id INT NOT NULL,
  subscription_start DATETIME,
  subscription_end DATETIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY plan_id (plan_id),
  CONSTRAINT user_subscriptions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT user_subscriptions_ibfk_2 FOREIGN KEY (plan_id) REFERENCES premium_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
