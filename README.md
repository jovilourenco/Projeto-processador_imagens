# 🖼️ Editor de Imagens - Processamento Digital de Imagens (PDI)

Uma aplicação web interativa para aplicação de técnicas de Processamento Digital de Imagens, desenvolvida com Django e OpenCV. Permite carregar imagens e aplicar diversos filtros e transformações em tempo real.

---

## 🎯 Sobre o Projeto

Este projeto é um **editor de imagens online** que implementa diversas técnicas fundamentais de Processamento Digital de Imagens. Desenvolvido como trabalho acadêmico, oferece uma interface amigável para explorar conceitos como:

- Transformações de intensidade
- Filtragem espacial e no domínio da frequência
- Detecção de bordas
- Equalização de histograma

A aplicação é totalmente funcional no navegador, com visualização em tempo real dos resultados e seus respectivos histogramas.

---
## 🎥 Demostração 

![Demonstração](docs/videoDemo.gif)

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Django** | 6.0.2 | Framework web backend |
| **OpenCV** | 4.13.0 | Processamento de imagens |
| **NumPy** | 2.4.2 | Operações matemáticas e matriciais |
| **Bootstrap 5** | - | Interface responsiva |
| **JavaScript** | - | Interatividade e requisições AJAX |

---

## ✨ Funcionalidades

### 1. Filtros Gerais
| Filtro | Descrição |
|--------|-----------|
| **Original** | Exibe a imagem sem modificações |
| **Negativo** | Inverte as cores da imagem (255 - pixel) |
| **Escala de Cinza** | Converte a imagem para tons de cinza |

### 2. Decomposição de Canais
| Filtro | Descrição |
|--------|-----------|
| **Canais RGB** | Separa a imagem nos canais Vermelho, Verde e Azul |
| **Canais HSV** | Separa nos canais Matiz (Hue), Saturação e Valor |

### 3. Transformações de Intensidade
| Filtro | Parâmetros | Descrição |
|--------|------------|-----------|
| **Limiarização** | `k` (0-255) | Binariza a imagem com base em um limiar |
| **Transformação Logarítmica** | `c` (0-10) | Amplifica detalhes em regiões escuras |
| **Transformação de Potência** | `gamma` (0.1-3), `c` | Correção de gama |
| **Equalização de Histograma** | - | Melhora o contraste da imagem |
| **Fatiamento por Intensidade** | `low`, `high`, `preserve_bg` | Destaca uma faixa específica de intensidades |

### 4. Filtros Espaciais
| Filtro | Parâmetros | Descrição |
|--------|------------|-----------|
| **Filtro Gaussiano** | `s` (0-5) | Suavização com kernel Gaussiano |
| **Filtro de Média** | `s` (0-5) | Suavização pela média local |
| **Filtro de Mediana** | `s` (0-5) | Remove ruído preservando bordas |
| **Filtro de Mínimo** | `s` (0-5) | Operação de erosão |
| **Filtro de Máximo** | `s` (0-5) | Operação de dilatação |
| **Mediana Adaptativa** | `smax` (3-15) | Remove ruído sal e pimenta adaptativamente |

### 5. Detecção de Bordas e Realce
| Filtro | Parâmetros | Descrição |
|--------|------------|-----------|
| **Gradiente de Sobel** | - | Detecta bordas pela magnitude do gradiente |
| **Máscara de Aguçamento** | `k` (0-2), `s` (0-3) | Realça bordas subtraindo versão suavizada |
| **Realce por Laplaciano** | - | Destaca bordas usando operador Laplaciano |

### 6. Filtros no Domínio da Frequência
| Filtro | Parâmetros | Descrição |
|--------|------------|-----------|
| **Passa-Baixa Gaussiano** | `D0` (10-100) | Suavização no domínio da frequência |
| **Passa-Alta Gaussiano** | `D0` (10-100) | Realce de bordas |
| **Passa-Baixa Butterworth** | `D0`, `n` (1-5) | Suavização com transição suave |
| **Passa-Alta Butterworth** | `D0`, `n` (1-5) | Realce de bordas com controle de transição |

### 7. Adição de Ruído
| Filtro | Parâmetros | Descrição |
|--------|------------|-----------|
| **Ruído Gaussiano** | `mu`, `sigma` | Ruído com distribuição normal |
| **Ruído Sal** | `amount` (0-0.1) | Pixels aleatórios tornam-se brancos |
| **Ruído Pimenta** | `amount` (0-0.1) | Pixels aleatórios tornam-se pretos |
| **Ruído Sal e Pimenta** | `amount`, `ratio` | Combinação dos dois ruídos |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.8 ou superior
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/jovilourenco/Projeto-processador_imagens
cd Projeto-processador_imagens
```

2. **Crie um ambiente virtual**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Instale as dependências**
```bash
pip install -r requirements.txt
```

4. **Execute as migrações (opcional)**
```bash
python manage.py migrate
```

5. **Inicie o servidor**
```bash
python manage.py runserver
```

6. **Acesse no navegador**
```
http://000.0.0.0:8000/
```

---

## 📖 Como Usar

### Interface Principal

1. **Carregar Imagem**: Clique no botão "Carregar Foto" no canto superior direito
2. **Arraste ou Cole**: Você pode arrastar uma imagem para a área indicada ou colar (Ctrl+V)
3. **Escolha um Processo**: Na barra lateral esquerda, navegue pelas categorias e clique em um filtro
4. **Ajuste Parâmetros**: Quando disponível, ajuste os parâmetros do filtro
5. **Visualize o Resultado**: A imagem processada e seu histograma aparecem instantaneamente
6. **Aplique o Filtro**: Ao aplicar o filtro a imagem processada passa a ser a imagem original, assim você pode aplicar vários filtros a imagem.
7. **Retroceder e Avançar**: Você pode voltar (CTRL+Z) e avançar (CTRL+Y) os processos aplicados à imagem.
8. **Salve o Resultado**: Clique em "Salvar resultado" para baixar a imagem processada
9. **Resetar**: Clique em "Resetar" para limpar todas as modificações

---

## 🎨 Exemplos de Uso

### Exemplo 1: Melhorar Contraste com Equalização de Histograma

1. Carregue uma imagem com baixo contraste
2. Navegue até `Transformações de Intensidade`
3. Clique em **Equalização de Histograma**
4. Observe como os detalhes ficam mais visíveis e o histograma se espalha

### Exemplo 2: Remover Ruído Sal e Pimenta

1. Primeiro adicione ruído em `Ruído` → **Ruído Sal e Pimenta** (`amount: 0.05`)
2. Depois aplique `Filtros Espaciais` → **Mediana Adaptativa** (`smax: 7`)
3. Compare o resultado com a imagem original

### Exemplo 3: Detectar Bordas

1. Carregue uma imagem com objetos bem definidos
2. Converta para `Escala de Cinza` (opcional)
3. Aplique `Realce e Bordas` → **Gradiente de Sobel**
4. Visualize os contornos dos objetos

### Exemplo 4: Extrair Canal de Cor Específico

1. Carregue uma imagem colorida
2. Acesse `Decomposição` → **Canais RGB**
3. Visualize separadamente os canais Vermelho, Verde e Azul
4. Útil para análise de componentes de cor

---

## 👨‍💻 Autores

### João Victor Loureço

### Victor G. Menezes

---
