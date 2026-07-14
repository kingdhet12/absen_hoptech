-- ==================================================
-- Supabase SQL Schema
-- Sistem Absensi Karyawan PT Hoptech Indonesia
-- ==================================================

-- Ekstensi UUID
create extension if not exists "pgcrypto";

-- ==================================================
-- Tabel employees
-- ==================================================
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  name text not null,
  division text not null,
  position text not null,
  photo text,
  join_date date not null,
  status text not null default 'Aktif' check (status in ('Aktif', 'Nonaktif')),
  created_at timestamptz not null default now()
);

create index if not exists idx_employees_employee_id on public.employees (employee_id);
create index if not exists idx_employees_name on public.employees (name);
create index if not exists idx_employees_division on public.employees (division);

-- ==================================================
-- Tabel attendance
-- ==================================================
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references public.employees(employee_id) on update cascade on delete cascade,
  attendance_date date not null,
  check_in time,
  check_out time,
  attendance_status text not null check (attendance_status in ('Hadir', 'Izin', 'Sakit', 'Alpha', 'Terlambat')),
  created_at timestamptz not null default now(),
  constraint unique_employee_attendance_per_day unique (employee_id, attendance_date)
);

create index if not exists idx_attendance_employee_id on public.attendance (employee_id);
create index if not exists idx_attendance_date on public.attendance (attendance_date);
create index if not exists idx_attendance_status on public.attendance (attendance_status);

-- ==================================================
-- Row Level Security
-- Policy ini memberi akses CRUD hanya untuk user yang login
-- melalui Supabase Authentication.
-- ==================================================
alter table public.employees enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "Authenticated users can read employees" on public.employees;
drop policy if exists "Authenticated users can insert employees" on public.employees;
drop policy if exists "Authenticated users can update employees" on public.employees;
drop policy if exists "Authenticated users can delete employees" on public.employees;

create policy "Authenticated users can read employees"
on public.employees for select
to authenticated
using (true);

create policy "Authenticated users can insert employees"
on public.employees for insert
to authenticated
with check (true);

create policy "Authenticated users can update employees"
on public.employees for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete employees"
on public.employees for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can read attendance" on public.attendance;
drop policy if exists "Authenticated users can insert attendance" on public.attendance;
drop policy if exists "Authenticated users can update attendance" on public.attendance;
drop policy if exists "Authenticated users can delete attendance" on public.attendance;

create policy "Authenticated users can read attendance"
on public.attendance for select
to authenticated
using (true);

create policy "Authenticated users can insert attendance"
on public.attendance for insert
to authenticated
with check (true);

create policy "Authenticated users can update attendance"
on public.attendance for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete attendance"
on public.attendance for delete
to authenticated
using (true);

-- ==================================================
-- Dummy Data 20 Karyawan
-- ==================================================
insert into public.employees (employee_id, name, division, position, photo, join_date, status) values
('HOP001', 'Andi Saputra', 'IT', 'Frontend Developer', null, '2022-01-10', 'Aktif'),
('HOP002', 'Budi Santoso', 'IT', 'Backend Developer', null, '2022-02-14', 'Aktif'),
('HOP003', 'Citra Lestari', 'HRD', 'HR Officer', null, '2021-11-03', 'Aktif'),
('HOP004', 'Dewi Anggraini', 'Finance', 'Finance Staff', null, '2020-07-21', 'Aktif'),
('HOP005', 'Eko Prasetyo', 'Operations', 'Operations Supervisor', null, '2019-05-17', 'Aktif'),
('HOP006', 'Fajar Nugroho', 'Warehouse', 'Warehouse Staff', null, '2023-03-08', 'Aktif'),
('HOP007', 'Gita Maharani', 'Marketing', 'Digital Marketing', null, '2022-09-12', 'Aktif'),
('HOP008', 'Hendra Wijaya', 'Sales', 'Sales Executive', null, '2021-04-19', 'Aktif'),
('HOP009', 'Intan Permata', 'Customer Service', 'CS Specialist', null, '2023-06-26', 'Aktif'),
('HOP010', 'Joko Firmansyah', 'Production', 'Production Staff', null, '2020-02-11', 'Aktif'),
('HOP011', 'Kartika Sari', 'Quality Control', 'QC Analyst', null, '2021-08-30', 'Aktif'),
('HOP012', 'Lukman Hakim', 'Maintenance', 'Technician', null, '2019-10-07', 'Aktif'),
('HOP013', 'Maya Putri', 'Procurement', 'Purchasing Staff', null, '2022-12-05', 'Aktif'),
('HOP014', 'Nanda Kurniawan', 'Logistics', 'Logistics Coordinator', null, '2023-01-18', 'Aktif'),
('HOP015', 'Olivia Ramadhani', 'Legal', 'Legal Staff', null, '2020-09-25', 'Aktif'),
('HOP016', 'Prasetya Adi', 'IT', 'System Administrator', null, '2021-03-15', 'Aktif'),
('HOP017', 'Qonita Zahra', 'Finance', 'Accounting Staff', null, '2022-05-23', 'Aktif'),
('HOP018', 'Rangga Maulana', 'Sales', 'Account Manager', null, '2019-12-02', 'Aktif'),
('HOP019', 'Siska Amelia', 'HRD', 'Recruitment Specialist', null, '2023-04-10', 'Aktif'),
('HOP020', 'Taufik Hidayat', 'Operations', 'Operations Staff', null, '2020-06-16', 'Aktif')
on conflict (employee_id) do update set
  name = excluded.name,
  division = excluded.division,
  position = excluded.position,
  photo = excluded.photo,
  join_date = excluded.join_date,
  status = excluded.status;

-- ==================================================
-- Dummy Data Absensi Opsional untuk Grafik
-- Jalankan jika ingin dashboard/grafik langsung berisi data.
-- ==================================================
insert into public.attendance (employee_id, attendance_date, check_in, check_out, attendance_status) values
('HOP001', current_date, '08:02:00', '17:02:00', 'Hadir'),
('HOP002', current_date, '08:17:00', '17:10:00', 'Terlambat'),
('HOP003', current_date, null, null, 'Izin'),
('HOP004', current_date, '07:58:00', '17:01:00', 'Hadir'),
('HOP005', current_date, null, null, 'Sakit'),
('HOP006', current_date - interval '1 day', '08:01:00', '17:00:00', 'Hadir'),
('HOP007', current_date - interval '1 day', '08:12:00', '17:20:00', 'Terlambat'),
('HOP008', current_date - interval '2 day', '07:55:00', '17:04:00', 'Hadir'),
('HOP009', current_date - interval '2 day', null, null, 'Alpha'),
('HOP010', current_date - interval '3 day', '08:00:00', '17:00:00', 'Hadir'),
('HOP011', current_date - interval '4 day', '08:03:00', '17:00:00', 'Hadir'),
('HOP012', current_date - interval '5 day', '08:20:00', '17:02:00', 'Terlambat'),
('HOP013', current_date - interval '6 day', '08:01:00', '17:10:00', 'Hadir'),
('HOP014', current_date - interval '7 day', '07:59:00', '17:00:00', 'Hadir'),
('HOP015', current_date - interval '8 day', null, null, 'Izin'),
('HOP016', current_date - interval '9 day', '08:04:00', '17:08:00', 'Hadir'),
('HOP017', current_date - interval '10 day', '08:16:00', '17:05:00', 'Terlambat'),
('HOP018', current_date - interval '11 day', '07:53:00', '17:01:00', 'Hadir'),
('HOP019', current_date - interval '12 day', null, null, 'Sakit'),
('HOP020', current_date - interval '13 day', '08:00:00', '17:00:00', 'Hadir')
on conflict (employee_id, attendance_date) do nothing;
