-- Create user_goals table
create table public.user_goals (
  user_id uuid references auth.users not null primary key,
  income numeric not null default 0,
  annual_goal numeric not null default 0,
  initial_balance numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_goals enable row level security;

create policy "Users can view their own goals" on public.user_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert their own goals" on public.user_goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own goals" on public.user_goals
  for update using (auth.uid() = user_id);

-- Create transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  amount numeric not null,
  category text not null,
  description text,
  recurrent boolean default false,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions" on public.transactions
  for delete using (auth.uid() = user_id);
