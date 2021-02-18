CREATE TABLE IF NOT EXISTS public.product(
    href text primary key,
    title text,
    rated int,
    rate numeric(2,1),
    rate_count int,
    stock int,
    last_update timestamp NOT NULL DEFAULT NOW()
);

create table if not exists public.product_price(
    id serial primary key,
    price int,
    product_href text references public.product(href),
    is_flash_sale int,
    created_at timestamp NOT NULL DEFAULT NOW()
);

