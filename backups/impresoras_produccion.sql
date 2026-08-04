-- ============================================================
-- Respaldo de base de datos: Testeo de Impresoras
-- Generado: 2026-08-04T18:37:07Z (UTC)
-- Entorno: PRODUCCION (Replit)  |  Tabla: public.printers
-- Registros: 57
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "printers" (
  "id" serial PRIMARY KEY NOT NULL,
  "ai" text NOT NULL,
  "modelo" text NOT NULL,
  "estado" text NOT NULL,
  "ubicacion" text,
  "descripcion" text,
  "fecha" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "printers" ("id", "ai", "modelo", "estado", "ubicacion", "descripcion", "fecha", "created_at") VALUES
('4', '001244', 'Laserjet 1606', 'falla', 'Pasillo oficina', 'no toma hojas', '28/07/2026 02:24 p. m.', '2026-07-28 14:24:29.880101+00'),
('7', '001754', 'laserjet pro m404dw', 'falla', 'Pasillo Oficina', 'Falta unidad de imagen', '28/07/2026 02:42 p. m.', '2026-07-28 14:42:02.312864+00'),
('8', '001758', 'Laserjet m404dw', 'falla', 'Oficina pasillo', 'Falla el fusor', '28/07/2026 02:42 p. m.', '2026-07-28 14:42:56.524693+00'),
('9', '000874', 'HP Laserjet 1022', 'falla', 'Deposito de Activos', 'Rota, botones sin funcionar y obsoleta', '28/07/2026 02:44 p. m.', '2026-07-28 14:44:14.849666+00'),
('10', '001069', 'HP Laserjet 1022', 'falla', 'Deposito de Activos', 'Traba las Hojas', '28/07/2026 02:45 p. m.', '2026-07-28 14:45:15.438512+00'),
('11', '001196', 'Laserjet m454dw', 'funciona', 'Deposito de Activos', '', '28/07/2026 02:46 p. m.', '2026-07-28 14:46:17.536974+00'),
('12', '000543', 'Laserjet 1022', 'funciona', 'Deposito de Activos', '', '28/07/2026 02:46 p. m.', '2026-07-28 14:46:40.317581+00'),
('13', '001737', 'HP Deskjet ink Advantage 5075', 'parcial', 'Deposito de Activos', 'Funciona pero es de inyeccion, Donacion', '28/07/2026 02:47 p. m.', '2026-07-28 14:47:31.916665+00'),
('14', '001702', 'Officejet 200 mobile', 'funciona', 'Deposito de Activos', '', '28/07/2026 02:48 p. m.', '2026-07-28 14:48:16.420085+00'),
('15', '001701', 'Officejet 200 mobile', 'funciona', 'Deposito de Activos', '', '28/07/2026 02:48 p. m.', '2026-07-28 14:48:44.032119+00'),
('17', '001699', 'Officejet 200 mobile', 'funciona', 'Deposito de Activos', '', '28/07/2026 02:49 p. m.', '2026-07-28 14:49:40.991266+00'),
('18', '001496', 'HP M401 dne', 'funciona', 'Pasillo Oficina', '', '28/07/2026 02:51 p. m.', '2026-07-28 14:51:31.858241+00'),
('19', '000386', 'Hp laserjet 1022', 'funciona', 'Deposito PB', '', '30/07/2026 02:22 p. m.', '2026-07-30 14:22:19.103549+00'),
('20', '000930', 'HP Laserjet pro 400 m401 dne', 'falla', 'Deposito PB', 'falla fusor', NULL, NULL),
(',30/07/2026 02:24 p. m.,2026-07-30 14:24:22.014041+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('21', '001194', 'Color LaserJet CP3525n', 'falla', 'Deposito PB', 'falla unidad de transferencia', NULL, NULL),
(',30/07/2026 02:28 p. m.,2026-07-30 14:28:30.728585+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('22', '001168', 'OfficeJet PRO 8100', 'falla', 'Deposito de abajo', 'no toma bien cartuchos', '30/07/2026 02:32 p. m.', '2026-07-30 14:32:11.969443+00'),
('23', '001062', 'Color laserjet cp2025', 'funciona', 'Deposito PB', 'A color funciona impecable', '30/07/2026 02:35 p. m.', '2026-07-30 14:35:21.743543+00'),
('24', '001302', 'OfficeJet PRO 8100', 'falla', '', 'No toma hojas', '30/07/2026 02:43 p. m.', '2026-07-30 14:43:32.713345+00'),
('25', '001337', 'OfficeJet PRO 8100', 'falla', 'Deposito PB', 'traba hojas', '30/07/2026 02:46 p. m.', '2026-07-30 14:46:04.872288+00'),
('26', '000027', 'Color laserjet cp2025', 'falla', 'Deposito PB', 'sensor de color dañado', '30/07/2026 02:57 p. m.', '2026-07-30 14:57:11.996265+00'),
('27', '001063', 'Laserjetpro 7720', 'falla', 'pasillo', 'no tiene reparo', '30/07/2026 03:09 p. m.', '2026-07-30 15:09:22.849692+00'),
('28', '001275', 'HP M605', 'falla', 'Depósito de bajas', 'No toma hojas', '30/07/2026 03:35 p. m.', '2026-07-30 15:35:24.158992+00'),
('29', '000847', '	LaserJet CP1525nw color', 'funciona', '', '', '30/07/2026 04:50 p. m.', '2026-07-30 16:50:57.942261+00'),
('30', '000512', 'HP LaserJet PRO M402dn', 'falla', 'Depósito de bajas', 'Falla en unidad de imágen', '30/07/2026 05:43 p. m.', '2026-07-30 17:43:18.984054+00'),
('31', '001547', 'LaserJet Enterprise M605', 'funciona', '', '', '30/07/2026 06:26 p. m.', '2026-07-30 18:26:29.084049+00'),
('32', '001153', '	OfficeJet Pro 251dw', 'funciona', '', 'Para donacion', '30/07/2026 06:31 p. m.', '2026-07-30 18:31:48.04255+00'),
('33', '000036', 'Color laserjet cp2025', 'falla', '', 'No toma hojas', '30/07/2026 06:34 p. m.', '2026-07-30 18:34:16.954149+00'),
('34', '001215', '	OfficeJet Pro 251dw', 'funciona', '', 'Para donacion', '30/07/2026 06:44 p. m.', '2026-07-30 18:44:15.070777+00'),
('35', '000994', 'hp officejet 8100', 'falla', 'Deposito PB', 'no imprime', '30/07/2026 07:05 p. m.', '2026-07-30 19:05:21.90871+00'),
('36', '001357', 'OfficeJet 4000', 'funciona', 'Deposito PB', 'Para donacion', '30/07/2026 07:07 p. m.', '2026-07-30 19:07:07.224806+00'),
('37', '001385', 'OfficeJet 4000', 'funciona', 'Deposito PB', 'Para donacion', '30/07/2026 07:10 p. m.', '2026-07-30 19:10:19.359061+00'),
('38', '000167', 'HP OfficeJet PRO 8100', 'falla', 'Deposito PB', 'No imprime', '03/08/2026 04:05 p. m.', '2026-08-03 16:05:32.674181+00'),
('39', '001414', 'hp officejet 8100', 'funciona', 'Deposito PB', 'donacion', NULL, NULL),
(',03/08/2026 04:25 p. m.,2026-08-03 16:25:19.137445+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('40', '001634', 'HP LaserJet P2035n', 'funciona', 'Deposito PB', 'donacion', '03/08/2026 04:33 p. m.', '2026-08-03 16:33:26.018+00'),
('41', '001704', 'HP Color LaserJet Pro MFP M176n', 'funciona', 'Deposito PB', '10 puntos donacion', NULL, NULL),
(',03/08/2026 04:47 p. m.,2026-08-03 16:47:10.25426+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('42', '000023', 'HP Laserjet Pro 400 MFP m425dn', 'falla', 'Deposito PB', 'Traba hojas y el adr no funciona', '03/08/2026 05:02 p. m.', '2026-08-03 17:02:11.111398+00'),
('43', '001634', 'HP LaserJet P2035n', 'funciona', 'Deposito PB', 'Hace ruido pero imprime bien', NULL, NULL),
('donacion,03/08/2026 07:57 p. m.,2026-08-03 19:57:01.203909+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('44', '000905', 'HP Deskjet 6940', 'falla', 'Deposito PB', 'No prende', '04/08/2026 01:00 p. m.', '2026-08-04 13:00:31.537676+00'),
('45', '001241', 'hp Deskjet 6940', 'funciona', 'Deposito PB', '', '04/08/2026 01:03 p. m.', '2026-08-04 13:03:49.863674+00'),
('46', '001494', 'hp officejet 8100', 'falla', 'Deposito PB', 'no imprime', '04/08/2026 01:33 p. m.', '2026-08-04 13:33:35.263999+00'),
('47', '000032', 'hp officejet 8100', 'falla', ' Deposito PB', 'no imprime', '04/08/2026 01:42 p. m.', '2026-08-04 13:42:28.015236+00'),
('48', '000115', 'Hp Officejet 4000', 'falla', '', 'No imprime', '04/08/2026 02:58 p. m.', '2026-08-04 14:58:39.436265+00'),
('49', '000863', 'Deskjet 6940', 'funciona', '', 'Para donación', '04/08/2026 03:26 p. m.', '2026-08-04 15:26:48.546559+00'),
('50', '001391', ' Deskjet 6940', 'funciona', 'PB', 'Para donacion', '04/08/2026 03:52 p. m.', '2026-08-04 15:52:33.690417+00'),
('51', '000845', 'Hp deskjet 6940', 'funciona', 'PB', 'Donacion', '04/08/2026 03:54 p. m.', '2026-08-04 15:54:09.928777+00'),
('52', '001420', 'Hp deskjet 6940', 'funciona', 'PB', 'Para donacion', '04/08/2026 03:57 p. m.', '2026-08-04 15:57:22.541073+00'),
('53', '001068', 'Hp Officejet Pro 8100', 'funciona', 'Deposito PB', '', '04/08/2026 03:58 p. m.', '2026-08-04 15:58:26.987745+00'),
('54', '001262', 'HP Photosmart Plus B210a (CN216A)', 'falla', 'PB', 'Cabezal Roto', '04/08/2026 04:08 p. m.', '2026-08-04 16:08:04.964861+00'),
('55', '001230', '	Color LaserJet Pro M454dw', 'funciona', 'PB', '', '04/08/2026 04:23 p. m.', '2026-08-04 16:23:36.150628+00'),
('56', '001210', 'Hp officejet pro 8100', 'falla', 'Pb', 'no toma hojas', '04/08/2026 05:28 p. m.', '2026-08-04 17:28:42.454817+00'),
('57', '000030', 'OfficeJet PRO K550', 'falla', 'PB', 'Baja', '04/08/2026 06:18 p. m.', '2026-08-04 18:18:57.403986+00'),
('58', '1388', 'hp officejet 8100', 'falla', 'Deposito PB', 'no imprime', '04/08/2026 06:18 p. m.', '2026-08-04 18:18:57.62791+00')
;

SELECT pg_catalog.setval(pg_get_serial_sequence('printers', 'id'), (SELECT MAX(id) FROM printers));

COMMIT;
