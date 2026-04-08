CREATE TABLE `digest_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`trigger` text NOT NULL,
	`languages` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`error` text,
	`repo_count` integer DEFAULT 0 NOT NULL,
	`email_sent` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`digest_run_id` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text NOT NULL,
	`resend_id` text,
	`sent_at` integer,
	`error` text,
	FOREIGN KEY (`digest_run_id`) REFERENCES `digest_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 0 NOT NULL,
	`primary_color` text NOT NULL,
	`bg_color` text NOT NULL,
	`text_color` text NOT NULL,
	`accent_color` text NOT NULL,
	`font_family` text NOT NULL,
	`layout` text NOT NULL,
	`custom_css` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `repo_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`trending_repo_id` text NOT NULL,
	`digest_run_id` text NOT NULL,
	`summary` text,
	`problem_solved` text,
	`use_cases` text,
	`limitations` text,
	`readme_fetched` integer NOT NULL,
	`analyzed_at` integer NOT NULL,
	`model_used` text,
	`token_usage` integer,
	FOREIGN KEY (`trending_repo_id`) REFERENCES `trending_repos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`digest_run_id`) REFERENCES `digest_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trending_repos` (
	`id` text PRIMARY KEY NOT NULL,
	`digest_run_id` text NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`language` text,
	`stars` integer NOT NULL,
	`forks` integer NOT NULL,
	`current_period_stars` integer NOT NULL,
	`built_by` text,
	`scraped_at` integer NOT NULL,
	FOREIGN KEY (`digest_run_id`) REFERENCES `digest_runs`(`id`) ON UPDATE no action ON DELETE no action
);
