/*
This file contains the database schema for the Namibia Hockey Union app.
These tables should be created in the Supabase dashboard.

Table: teams
- id (uuid, primary key)
- name (text, not null)
- category (text, not null)
- coach_name (text, not null)
- coach_contact (text, not null)
- manager_name (text, not null)
- manager_contact (text, not null)
- home_venue (text)
- team_colors (text)
- player_count (integer, default: 0)
- additional_info (text)
- created_at (timestamp with time zone, default: now())

Table: players
- id (uuid, primary key)
- first_name (text, not null)
- last_name (text, not null)
- date_of_birth (date)
- gender (text)
- position (text)
- jersey_number (integer)
- contact_number (text)
- email (text)
- emergency_contact_name (text)
- emergency_contact_number (text)
- team_id (uuid, foreign key references teams.id)
- additional_info (text)
- created_at (timestamp with time zone, default: now())

Table: events
- id (uuid, primary key)
- name (text, not null)
- event_type (text, not null)
- event_date (date, not null)
- location (text, not null)
- description (text, not null)
- registration_deadline (date)
- max_teams (integer)
- contact_person (text)
- contact_email (text)
- contact_phone (text)
- additional_info (text)
- created_at (timestamp with time zone, default: now())

Table: event_registrations
- id (uuid, primary key)
- event_id (uuid, foreign key references events.id)
- team_id (uuid, foreign key references teams.id)
- registration_date (timestamp with time zone, default: now())
- status (text, default: 'confirmed')
- notes (text)

Table: announcements
- id (uuid, primary key)
- title (text, not null)
- message (text, not null)
- author (text, not null)
- created_at (timestamp with time zone, default: now())
*/

// This file is for documentation purposes only and is not used in the application
export const SCHEMA_VERSION = '1.0.0';
