CREATE TABLE `options` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routeros` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`port` integer NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`tls` integer DEFAULT false NOT NULL,
	`hotspot_name` text NOT NULL,
	`dns_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`username` text NOT NULL UNIQUE,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `voucher_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`source` text NOT NULL
);
