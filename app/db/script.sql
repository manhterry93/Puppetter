CREATE TABLE IF NOT EXISTS public.product(
    id serial primary key,
    href text,
    title text,
    rated int,
    rate int,
    rate_count int,
    stock int,
    last_update timestamp NOT NULL DEFAULT NOW()
);

create table if not exists public.product_price(
    id serial primary key,
    price int,
    is_flash_sale int,
    created_at timestamp NOT NULL DEFAULT NOW()
);