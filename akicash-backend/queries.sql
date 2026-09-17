-- Parte 2. Ejecutar con la base akicash seleccionada.
-- Las fechas siguen la zona horaria de la sesion de MySQL.

-- 1. Total aprobado por cliente en un rango de fechas.
-- Ejemplo: todo 2026. Cambiar ambos limites para consultar otro rango.
-- El limite superior exclusivo incluye el ultimo dia completo.
SELECT c.id, c.full_name, SUM(la.requested_amount) AS total_desembolsado
FROM loan_application AS la
JOIN client AS c ON c.id = la.client_id
WHERE la.status = 'approved'
  AND la.created_at >= '2026-01-01'
  AND la.created_at < '2027-01-01'
GROUP BY c.id, c.full_name;

-- 2. Los cinco clientes con mayor monto aprobado desde el inicio del ano
-- hasta el instante actual (incluye las operaciones de hoy).
SELECT c.id, c.full_name, SUM(la.requested_amount) AS total_desembolsado
FROM loan_application AS la
JOIN client AS c ON c.id = la.client_id
WHERE la.status = 'approved'
  AND la.created_at >= MAKEDATE(YEAR(CURDATE()), 1)
  AND la.created_at <= NOW()
GROUP BY c.id, c.full_name
ORDER BY total_desembolsado DESC, c.id ASC
LIMIT 5;

-- 3. Cuotas vencidas y no pagadas. Las que vencen hoy no estan en el pasado.
SELECT i.id AS installment_id, c.id AS client_id, c.full_name,
       i.due_date, i.paid, i.amount
FROM installment AS i
JOIN loan_application AS la ON la.id = i.loan_application_id
JOIN client AS c ON c.id = la.client_id
WHERE i.paid = FALSE
  AND i.due_date < CURDATE()
ORDER BY i.due_date ASC, i.id ASC;

-- Indice propuesto (no se crea al ejecutar este archivo):
-- CREATE INDEX idx_installment_paid_due_date ON installment (paid, due_date);
-- paid resuelve primero la igualdad; due_date permite recorrer el rango vencido
-- dentro de las cuotas no pagadas. Verificar su utilidad con EXPLAIN y datos reales.
