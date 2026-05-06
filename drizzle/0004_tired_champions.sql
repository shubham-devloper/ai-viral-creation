CREATE TABLE `not_found_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`attempted_path` varchar(512) NOT NULL,
	`referrer` text,
	`user_agent` text,
	`ip_address` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `not_found_tracking_id` PRIMARY KEY(`id`)
);
