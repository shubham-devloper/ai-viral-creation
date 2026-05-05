CREATE TABLE `user_violations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`generation_id` int NOT NULL,
	`violation_type` enum('INAPPROPRIATE_CONTENT','HATE_SPEECH','VIOLENCE','SPAM','COPYRIGHT','OTHER') NOT NULL,
	`reason` text,
	`status` enum('PENDING','APPROVED','REJECTED','APPEALED') NOT NULL DEFAULT 'PENDING',
	`admin_notes` text,
	`warning_count` int DEFAULT 0,
	`is_account_suspended` boolean DEFAULT false,
	`suspension_reason` text,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_violations_id` PRIMARY KEY(`id`)
);
