CREATE TABLE `article_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`article_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`parent_comment_id` int,
	`is_approved` boolean NOT NULL DEFAULT false,
	`is_spam` boolean NOT NULL DEFAULT false,
	`admin_notes` text,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `article_comments_id` PRIMARY KEY(`id`)
);
