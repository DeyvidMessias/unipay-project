import time
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from fixos import CPF_DESTINO, EMAIL_TESTE, SENHA_TESTE


def capturar_tela(navegador, resultado):
    # Aqui fica a pasta das prints desse teste.
    pasta_raiz = Path(__file__).resolve().parents[2] / "prints de teste" / "8dados_destinatario_pix"
    pasta_raiz.mkdir(parents=True, exist_ok=True)

    # Pego a data e a hora pra não repetir o nome da print.
    data_hora = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    caminho_imagem = pasta_raiz / f"8dados_destinatario_pix_{resultado}_{data_hora}.png"

    # Tiro uma print pra mostrar o resultado.
    imagem_salva = navegador.save_screenshot(str(caminho_imagem))
    if imagem_salva:
        print(f"\nEvidência salva em: {caminho_imagem}")
    else:
        print("\nNão foi possível salvar a evidência.")


def test_ct08_dados_destinatario_pix():
    opcoes = webdriver.ChromeOptions()
    opcoes.add_experimental_option("prefs", {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False,
        "profile.password_manager_leak_detection": False,
    })
    navegador = webdriver.Chrome(options=opcoes)

    try:
        navegador.maximize_window()

        # Abro o UniPay.
        navegador.get("http://localhost:8080/")
        time.sleep(2)

        # Entro com a conta de teste.
        campo_usuario = navegador.find_element(By.ID, "login-email")
        campo_usuario.send_keys(EMAIL_TESTE)
        time.sleep(1)

        campo_senha = navegador.find_element(By.ID, "login-password")
        campo_senha.send_keys(SENHA_TESTE)
        time.sleep(1)

        botao_login = navegador.find_element(By.ID, "login-submit")
        botao_login.click()

        # Espero o menu aparecer depois do login.
        titulo_menu = WebDriverWait(navegador, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "side-label"))
        )
        assert titulo_menu.text == "MENU"

        # Abro o PIX e escolho a opção de outro banco.
        navegador.find_element(By.ID, "make-pix").click()
        botao_outro_banco = WebDriverWait(navegador, 10).until(
            EC.element_to_be_clickable((By.ID, "btn-pix-outro-banco"))
        )
        botao_outro_banco.click()
        time.sleep(1)

        # Coloco os dados do destinatário.
        campo_cpf = WebDriverWait(navegador, 10).until(
            EC.visibility_of_element_located((By.ID, "input-cpf-destinatario"))
        )
        campo_cpf.send_keys(CPF_DESTINO)
        time.sleep(1)
        navegador.find_element(By.ID, "input-email-destinatario").send_keys("destinatario@outrobanco.test")
        time.sleep(1)
        navegador.find_element(By.ID, "input-valor-pix").send_keys("10,00")
        time.sleep(1)

        # Avanço pra conferir os dados antes de continuar.
        navegador.find_element(By.ID, "btn-avancar-pix").click()
        time.sleep(1)
        tela_confirmacao = WebDriverWait(navegador, 10).until(
            EC.visibility_of_element_located((By.ID, "pix-external-confirmation"))
        )

        cpf_confirmacao = navegador.find_element(By.ID, "confirmacao-cpf-destinatario").text
        email_confirmacao = navegador.find_element(By.ID, "confirmacao-email-destinatario").text
        valor_confirmacao = navegador.find_element(By.ID, "confirmacao-valor-pix").text.replace("\xa0", " ")
        mensagens_erro = navegador.find_elements(By.CSS_SELECTOR, "[role='alert']")

        assert tela_confirmacao.is_displayed()
        assert len(mensagens_erro) == 0
        assert cpf_confirmacao == "168.995.350-09"
        assert email_confirmacao == "destinatario@outrobanco.test"
        assert "R$" in valor_confirmacao
        assert "10,00" in valor_confirmacao

        # Salvo a print da confirmação.
        capturar_tela(navegador, "sucesso")

    except Exception:
        # Se der erro, também salvo uma print.
        capturar_tela(navegador, "falha")
        raise

    finally:
        print("\nO navegador será fechado em 5 segundos...")
        time.sleep(5)
        navegador.quit()


if __name__ == "__main__":
    test_ct08_dados_destinatario_pix()
