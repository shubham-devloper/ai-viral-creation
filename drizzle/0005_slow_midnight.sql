CREATE TABLE `route_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route_path` varchar(512) NOT NULL,
	`user_id` int,
	`page_load_time` int NOT NULL,
	`time_on_page` int,
	`bounce` boolean NOT NULL DEFAULT false,
	`had_interaction` boolean NOT NULL DEFAULT false,
	`referrer` text,
	`device_type` varchar(50),
	`browser` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `route_performance_id` PRIMARY KEY(`id`)
);
