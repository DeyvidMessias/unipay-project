import { Router } from "express";
import { pool } from "../db.js";
import { asyncRoute, HttpError } from "../http.js";

export const accountRoutes = Router();

accountRoutes.get("/", asyncRoute(async (request, response) => {
  const [rows] = await pool.execute(
    `SELECT u.idUsuario, u.nome, u.email, u.cpf, u.saldo, cp.chavePix
       FROM usuario AS u
       JOIN chave_pix AS cp ON cp.idUsuario = u.idUsuario
      WHERE u.idUsuario = ?
      LIMIT 1`,
    [request.userId],
  );
  if (!rows[0]) throw new HttpError(404, "Conta não encontrada.");

  const row = rows[0];
  response.json({
    user: {
      id: Number(row.idUsuario),
      name: row.nome,
      email: row.email,
      cpf: row.cpf,
      pixKey: row.chavePix,
      balance: Number(row.saldo),
    },
  });
}));

accountRoutes.get("/transactions", asyncRoute(async (request, response) => {
  const [rows] = await pool.execute(
    `SELECT t.idTransacao, t.valor, t.data, tipo.tipo AS tipoTransacao,
            categoria.tipo AS categoria, contraparte.nome AS contraparte
       FROM transacao AS t
       JOIN tipo_transacao AS tipo ON tipo.idTipoTransacao = t.idTipoTransacao
       JOIN categoria ON categoria.idCategoria = t.idCategoria
       JOIN contraparte ON contraparte.idContraparte = t.idContraparte
      WHERE t.idUsuario = ?
      ORDER BY t.data DESC, t.idTransacao DESC
      LIMIT 100`,
    [request.userId],
  );

  response.json({
    transactions: rows.map((row) => {
      const incoming = row.tipoTransacao === "entrada";
      return {
        id: String(row.idTransacao),
        title: incoming ? "PIX recebido" : "PIX enviado",
        detail: `${incoming ? "De" : "Para"} ${row.contraparte}`,
        date: new Date(`${row.data}Z`).toISOString(),
        amount: Number(row.valor),
        kind: incoming ? "in" : "out",
      };
    }),
  });
}));
