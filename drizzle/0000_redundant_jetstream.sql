CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`subject` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`digest` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`author` text NOT NULL,
	`created` text NOT NULL,
	`released` text,
	FOREIGN KEY (`released`) REFERENCES `releases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `observations` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`nonce` text NOT NULL,
	`fingerprint` text NOT NULL,
	`version` text NOT NULL,
	`location` text NOT NULL,
	`container` text NOT NULL,
	`opened` text NOT NULL,
	`items` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `observations_nonce` ON `observations` (`author`,`nonce`);--> statement-breakpoint
CREATE UNIQUE INDEX `observations_duplicate` ON `observations` (`author`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `observations_aggregate` ON `observations` (`status`,`version`,`location`,`container`);--> statement-breakpoint
CREATE TABLE `publication` (
	`key` text PRIMARY KEY NOT NULL,
	`release` text NOT NULL,
	FOREIGN KEY (`release`) REFERENCES `releases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
