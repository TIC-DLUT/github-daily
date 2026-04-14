DROP TABLE `email_themes`;
--> statement-breakpoint
CREATE TABLE `email_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 0 NOT NULL,
	`template` text NOT NULL,
	`content_template` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
