SELECT setval('mines_id_seq', (SELECT MAX(id) FROM mines));
