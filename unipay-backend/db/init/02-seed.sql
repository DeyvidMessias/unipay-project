USE uniPay;

INSERT IGNORE INTO tipo_transacao (tipo) VALUES ('entrada'), ('saida');
INSERT IGNORE INTO categoria (tipo) VALUES ('PIX'), ('Outros');
