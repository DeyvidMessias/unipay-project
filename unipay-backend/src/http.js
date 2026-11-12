export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function validateCpf(value) {
  const cpf = String(value ?? "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digitAt = (length) => {
    let total = 0;
    for (let index = 0; index < length; index += 1) {
      total += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return digitAt(9) === Number(cpf[9]) && digitAt(10) === Number(cpf[10]);
}

export function normalizePixKey(value) {
  return String(value ?? "").trim().toLowerCase();
}
