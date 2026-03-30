CREATE TABLE `admin_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` longtext NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliate_id` int NOT NULL,
	`referred_user_id` int NOT NULL,
	`purchase_amount` decimal(12,2) NOT NULL,
	`commission_inr` decimal(12,2) NOT NULL,
	`status` enum('PENDING','PAID') DEFAULT 'PENDING',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`code` varchar(8) NOT NULL,
	`total_referrals` int DEFAULT 0,
	`total_earnings` decimal(12,2) DEFAULT '0',
	`pending_payout` decimal(12,2) DEFAULT '0',
	`paid_out` decimal(12,2) DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `affiliates_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`excerpt` text,
	`cover_image` text,
	`is_published` boolean DEFAULT false,
	`seo_title` varchar(255),
	`seo_desc` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`balance` int NOT NULL DEFAULT 10,
	`total_purchased` int DEFAULT 0,
	`total_used` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `credits_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('IMAGE','VIDEO','STORY','AVATAR') NOT NULL,
	`prompt` longtext NOT NULL,
	`output_url` text,
	`thumbnail_url` text,
	`is_watermarked` boolean DEFAULT true,
	`quality` enum('standard','hd') DEFAULT 'standard',
	`credits_used` int NOT NULL,
	`status` enum('PROCESSING','COMPLETED','FAILED') DEFAULT 'PROCESSING',
	`metadata` json,
	`is_flagged` boolean DEFAULT false,
	`flag_reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL,
	`content` longtext NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `policies_type_unique` UNIQUE(`type`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`plan` enum('FREE','STARTER','PRO','BUSINESS') DEFAULT 'FREE',
	`started_at` timestamp DEFAULT (now()),
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('PURCHASE','REFUND','BONUS','AFFILIATE_BONUS') NOT NULL,
	`credits_amount` int NOT NULL,
	`amount_inr` decimal(10,2),
	`razorpay_order_id` varchar(255),
	`razorpay_payment_id` varchar(255),
	`status` enum('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
	`package_name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`key_hash` text NOT NULL,
	`label` varchar(255),
	`is_active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `mobile` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `google_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `age_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `referred_by` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_google_id_unique` UNIQUE(`google_id`);