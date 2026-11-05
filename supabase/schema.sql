-- AGREXA Supabase schema — run this in the Supabase SQL editor once.

create table if not exists products (
  id            text primary key,
  name          text not null,
  category      text not null check (category in ('insecticide','herbicide','fungicide','biopesticide')),
  active_ingredient text not null,
  concentration text,
  formulation   text,
  target_pests  text not null,
  target_crops  text not null,
  application   text,
  dosage        text,
  pack_sizes    text not null,
  reg_no        text default '[CIB&RC REG NO]',
  price_note    text default '[PRICE]',
  description   text,
  created_at    timestamptz default now()
);

create table if not exists contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  subject     text,
  message     text not null,
  status      text default 'new',
  created_at  timestamptz default now()
);

create table if not exists pest_recommendations (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  phone       text,
  email       text,
  crop        text not null,
  symptoms    text not null,
  pest        text,
  language    text default 'en',
  model_used  text,
  is_ai       boolean default false,
  result      jsonb not null,
  created_at  timestamptz default now()
);

create table if not exists dealer_enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  place       text,
  phone       text not null,
  message     text,
  status      text default 'new',
  created_at  timestamptz default now()
);

-- Row level security: writes happen through the server (service role key),
-- so keep RLS on and no public policies.
alter table products enable row level security;
alter table contacts enable row level security;
alter table pest_recommendations enable row level security;
alter table dealer_enquiries enable row level security;
