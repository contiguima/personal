CREATE TABLE "activity" (
	"date" date PRIMARY KEY NOT NULL,
	"steps" integer,
	"active_kcal" double precision,
	"rest_kcal" double precision,
	"total_energy" double precision
);
--> statement-breakpoint
CREATE TABLE "days" (
	"date" date PRIMARY KEY NOT NULL,
	"training_day" boolean,
	"closed" boolean DEFAULT false NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"estimated_totals" jsonb,
	"migrated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"date" date NOT NULL,
	"category" text NOT NULL,
	"category_original" text,
	"desc" text NOT NULL,
	"confidence" text,
	"kcal" double precision,
	"protein" double precision,
	"carbs" double precision,
	"fat" double precision,
	"fiber" double precision,
	"calidad_ultraprocesado" text,
	"calidad_beneficios" text,
	"calidad_puntaje" integer,
	"items" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meals_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"date" date PRIMARY KEY NOT NULL,
	"weight" double precision,
	"waist" double precision,
	"hip" double precision
);
--> statement-breakpoint
CREATE TABLE "sleep" (
	"date" date PRIMARY KEY NOT NULL,
	"duration_min" integer NOT NULL,
	"score" integer,
	"wake_energy" integer,
	"end_energy" integer,
	"vigilia" double precision,
	"rem" double precision,
	"ligero" double precision,
	"profundo" double precision
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"day_type" text PRIMARY KEY NOT NULL,
	"kcal_min" double precision NOT NULL,
	"kcal_max" double precision NOT NULL,
	"protein_min" double precision NOT NULL,
	"protein_max" double precision NOT NULL,
	"carbs_min" double precision NOT NULL,
	"carbs_max" double precision NOT NULL,
	"fat_min" double precision NOT NULL,
	"fat_max" double precision NOT NULL,
	"fiber_min" double precision NOT NULL,
	"fiber_max" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_use" (
	"date" date PRIMARY KEY NOT NULL,
	"deporte" double precision DEFAULT 0 NOT NULL,
	"trabajo_corpo" double precision DEFAULT 0 NOT NULL,
	"side_hustle" double precision DEFAULT 0 NOT NULL,
	"emprendedurismo" double precision DEFAULT 0 NOT NULL,
	"aprendizaje" double precision DEFAULT 0 NOT NULL,
	"tiktok" double precision DEFAULT 0 NOT NULL,
	"social" double precision DEFAULT 0 NOT NULL,
	"otros" double precision DEFAULT 0 NOT NULL,
	"confirmed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training" (
	"date" date PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"duracion" text,
	"ejercicios" text,
	"kcal_activas" double precision,
	"kcal_total" double precision,
	"fc_prom" text,
	"esfuerzo" text,
	"energia" text,
	"dolor" text
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_photos" ADD CONSTRAINT "meal_photos_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep" ADD CONSTRAINT "sleep_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_use" ADD CONSTRAINT "time_use_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_date_days_date_fk" FOREIGN KEY ("date") REFERENCES "public"."days"("date") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meals_date_idx" ON "meals" USING btree ("date");