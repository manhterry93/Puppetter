CREATE TABLE IF NOT EXISTS public.product(
    href text primary key,
    title text,
    rated int default 0,
    rate numeric(2,1) default 0.0,
    rate_count int default 0,
    stock int default 0,
    price int
    last_update timestamp NOT NULL DEFAULT NOW()
);

create table if not exists public.product_price(
    id serial primary key,
    price int,
    product_href text references public.product(href),
    is_flash_sale int,
    created_at timestamp NOT NULL DEFAULT NOW()
);

