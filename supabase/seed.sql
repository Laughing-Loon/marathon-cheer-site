-- Starter content. Run after schema.sql, then edit the runner row in the Table editor
-- (or change the values below before running).

insert into public.runner (id, name, pronouns, bib, start_time, wave, start_color, corral, donate_url, cause)
values (true, 'Alex', 'they', null, '2026-11-01 09:10:00-05', '1', 'Orange', null, null, null)
on conflict (id) do nothing;

-- Sign puns. {name} becomes the runner's name; \n is a line break in the top line.
insert into public.signs (top, bottom, sort)
select * from (values
  (E'RUN {NAME}\nTHE BAGELS ARE', 'GETTING COLD', 1),
  (E'YOU ARE FASTER\nTHAN THE', 'G TRAIN', 2),
  (E'{NAME}, THIS IS A LOT\nOF WORK FOR A', 'FREE BANANA', 3),
  (E'TOUCH HERE\nFOR', 'POWER', 4),
  (E'THE WALL\nIS', 'A SUGGESTION', 5),
  (E'CLOCKS FALL\nBACK TODAY.', '{NAME} DOESN''T', 6),
  (E'{NAME}, THERE''S\nPIZZA AT', 'MILE 26', 7),
  (E'HURRY UP,\nI HAVE A', 'BRUNCH RES', 8),
  (E'RUN LIKE\nYOU STOLE', 'A BAGEL', 9),
  (E'YOU TRAINED\nFOR MONTHS.', 'I MADE A SIGN', 10),
  (E'WORST\nPARADE', 'EVER', 11),
  (E'IF FOUND ON\nTHE GROUND,', 'ROLL TO FINISH', 12),
  (E'HURRY,\nMY ARMS', 'ARE TIRED', 13),
  (E'CHAFE\nTODAY, BRAG', 'FOREVER', 14),
  (E'BLINK AND\nYOU''LL', 'MISS {NAME}', 15),
  (E'FREE HIGH\nFIVES.', 'NO REFUNDS', 16)
) as v(top, bottom, sort)
where not exists (select 1 from public.signs);
