import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { PrimaryButton } from "../components/PrimaryButton";
import { Brand } from "../components/Brand";
import type { PixRecipient } from "../api";
import type { PixStep } from "../types";

const formatMoney = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatCpf = (value: string) => value.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false;

  for (let length = 9; length <= 10; length += 1) {
    const sum = digits
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const checkDigit = (sum * 10) % 11;
    if (Number(digits[length]) !== (checkDigit === 10 ? 0 : checkDigit)) return false;
  }
  return true;
}

type PixPageProps = {
  step: PixStep;
  setStep: (step: PixStep) => void;
  pixKey: string;
  setPixKey: (key: string) => void;
  recipient: PixRecipient | null;
  setRecipient: (recipient: PixRecipient | null) => void;
  amount: string;
  setAmount: (amount: string) => void;
  error: string;
  busy: boolean;
  receipt: string;
  onLookup: () => void;
  onTransfer: () => void;
  onHome: () => void;
};

export function PixPage(props: PixPageProps) {
  const { step, setStep, pixKey, setPixKey, recipient, setRecipient, amount, setAmount, error, busy, receipt, onLookup, onTransfer, onHome } = props;
  const [externalStep, setExternalStep] = useState<"details" | "review" | null>(null);
  const [externalCpf, setExternalCpf] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [externalAmount, setExternalAmount] = useState("");
  const [externalError, setExternalError] = useState("");
  const numericAmount = Number(amount.replace(",", "."));
  const numericExternalAmount = Number(externalAmount.trim().replace(",", "."));
  const goBack = () => {
    if (externalStep === "review") setExternalStep("details");
    else if (externalStep === "details") { setExternalStep(null); setExternalError(""); }
    else if (step === "key") onHome();
    else setStep("key");
  };
  const updateAmount = (event: ChangeEvent<HTMLInputElement>) => setAmount(event.target.value.replace(/[^\d,.]/g, ""));
  const handleExternalReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidCpf(externalCpf)) {
      setExternalError("Informe um CPF válido com 11 dígitos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(externalEmail)) {
      setExternalError("Informe um e-mail válido para a chave PIX.");
      return;
    }
    if (!Number.isFinite(numericExternalAmount) || numericExternalAmount <= 0 || Math.round(numericExternalAmount * 100) / 100 !== numericExternalAmount) {
      setExternalError("Informe um valor maior que zero com até duas casas decimais.");
      return;
    }
    setExternalError("");
    setExternalStep("review");
  };

  return (
    <main className="pix-layout">
      <header className="pix-top"><button id="pix-back" className="back-link" onClick={goBack}><ArrowLeft size={16} /> Voltar</button><Brand className="pix-brand" /><span className="secure"><ShieldCheck size={15} /> Ambiente seguro</span></header>
      {step !== "done" && <div className="progress"><span className="done" /><span className={externalStep === "review" || (!externalStep && step === "amount") ? "done" : ""} /></div>}
      <div className="pix-content">
        {step === "key" && !externalStep && <>
          <span className="step-label">PIX <span>·</span> PASSO 1 DE 2</span>
          <h1>Pra quem vai<br />esse PIX?</h1>
          <p>Digite a chave PIX de quem vai receber.</p>
          <label htmlFor="pix-recipient-key">Chave PIX do destinatário</label>
          <div className="pix-input-wrap"><span>✳</span><input id="pix-recipient-key" value={pixKey} onChange={(event) => { setPixKey(event.target.value); setRecipient(null); }} placeholder="E-mail usado como chave PIX" autoComplete="off" /></div>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <div className="tip"><ShieldCheck size={17} /><span><strong>Confira os dados antes de continuar.</strong><small>Você poderá revisar tudo antes de confirmar.</small></span></div>
          <PrimaryButton id="pix-next-key" disabled={!pixKey.trim() || busy} onClick={onLookup}>{busy ? "Consultando chave…" : "Continuar"}</PrimaryButton>
          <div className="pix-trust"><LockKeyhole size={13} /> Suas transações são protegidas por criptografia</div>
          <div className="pix-alternative">
            <span>Vai enviar para uma conta de outro banco?</span>
            <button id="btn-pix-outro-banco" type="button" onClick={() => { setExternalError(""); setExternalStep("details"); }}>
              Fazer PIX para conta de outro banco <ArrowRight size={15} />
            </button>
          </div>
        </>}
        {step === "key" && externalStep === "details" && <>
          <span className="step-label">PIX <span>·</span> OUTRO BANCO</span>
          <h1>Dados do<br />destinatário.</h1>
          <p>Informe os dados para revisar a transferência.</p>
          <form className="external-pix-form" onSubmit={handleExternalReview}>
            <label htmlFor="input-cpf-destinatario">CPF do destinatário</label>
            <input id="input-cpf-destinatario" name="cpf" inputMode="numeric" value={externalCpf} onChange={(event) => setExternalCpf(event.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="Somente números" maxLength={11} required />

            <label htmlFor="input-email-destinatario">E-mail cadastrado / Chave PIX</label>
            <input id="input-email-destinatario" name="email" type="email" value={externalEmail} onChange={(event) => setExternalEmail(event.target.value.trim())} placeholder="nome@banco.com.br" autoComplete="off" required />

            <label htmlFor="input-valor-pix">Valor da transferência</label>
            <div className="external-amount-wrap"><span>R$</span><input id="input-valor-pix" name="amount" inputMode="decimal" value={externalAmount} onChange={(event) => setExternalAmount(event.target.value.replace(/[^\d,.]/g, ""))} placeholder="0,00" required /></div>

            {externalError && <p className="error-msg" role="alert">{externalError}</p>}
            <PrimaryButton id="btn-avancar-pix" type="submit">Avançar</PrimaryButton>
          </form>
        </>}
        {step === "key" && externalStep === "review" && <section id="pix-external-confirmation" className="external-pix-confirmation">
          <span className="step-label">PIX <span>·</span> CONFIRMAÇÃO</span>
          <h1>Confira os dados<br />do PIX.</h1>
          <p>Revise as informações antes de confirmar a transferência.</p>
          <div className="receipt external-pix-receipt">
            <span>CPF DO DESTINATÁRIO<strong id="confirmacao-cpf-destinatario">{formatCpf(externalCpf)}</strong></span>
            <span>E-MAIL / CHAVE PIX<strong id="confirmacao-email-destinatario">{externalEmail}</strong></span>
            <span>VALOR<strong id="confirmacao-valor-pix">{formatMoney(numericExternalAmount)}</strong></span>
          </div>
          <p className="external-pix-note">Esta etapa é uma revisão dos dados; o PIX ainda não foi enviado.</p>
          <PrimaryButton id="btn-editar-pix" type="button" onClick={() => setExternalStep("details")}>Voltar e editar</PrimaryButton>
        </section>}
        {step === "amount" && <>
          <span className="step-label">PIX <span>·</span> PASSO 2 DE 2</span>
          <h1>Quanto você<br />quer enviar?</h1>
          <p>O valor será transferido na hora.</p>
          <label htmlFor="pix-amount-input">Valor do PIX</label>
          <div className="amount-input-wrap"><span>R$</span><input id="pix-amount-input" inputMode="decimal" value={amount} onChange={updateAmount} placeholder="0,00" autoFocus /></div>
          <div className="recipient-pill"><span className="recipient-avatar">{(recipient?.name ?? pixKey).slice(0, 1).toUpperCase()}</span><span><small>ENVIANDO PARA</small><strong>{recipient?.name ?? pixKey}</strong><small>{recipient?.pixKey ?? ""}</small></span><button onClick={() => setStep("key")} aria-label="Editar chave PIX"><ArrowRight size={15} /></button></div>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <PrimaryButton id="pix-confirm" disabled={!numericAmount || busy} onClick={onTransfer}>{busy ? "Enviando…" : "Confirmar PIX"}</PrimaryButton>
          <div className="pix-trust"><LockKeyhole size={13} /> Confira o valor e destinatário antes de confirmar</div>
        </>}
        {step === "done" && <div id="pix-transfer-success" className="done-state">
          <div className="done-check"><Check size={34} /></div><span className="step-label">PIX REALIZADO</span>
          <h1>Pronto. Foi<br />rapidinho, né?</h1><p>Seu PIX de <strong id="pix-success-amount">{formatMoney(numericAmount)}</strong> foi enviado.</p>
          <div className="receipt"><span>DESTINATÁRIO<strong id="pix-success-recipient">{pixKey}</strong></span><span>VALOR<strong>{formatMoney(numericAmount)}</strong></span><span>COMPROVANTE<strong>{receipt}</strong></span><span>STATUS<strong className="receipt-status">Concluído</strong></span></div>
          <PrimaryButton id="pix-finish" onClick={onHome}>Voltar para o início</PrimaryButton>
        </div>}
      </div>
    </main>
  );
}
