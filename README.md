# Simulador de Escalonamento de Processos

Este projeto é um simulador de escalonamento de processos desenvolvido em **React** para fins acadêmicos. Ele permite visualizar e comparar diferentes algoritmos de escalonamento de processos e substituição de páginas em um sistema operacional genérico.

**Link do deploy:** [https://simuladorso.vercel.app/](https://simuladorso.vercel.app/)

## 🧑‍🎓 Membros da equipe
- Bruno Neves Falcão Soares
- José Raimuindo Alves dos Santos Junior
- Rodrigo Queiroz Souza da Conceição
- Thales Brito Rodrigues

## 🚀 Funcionalidades

### Escalonamento de Processos
- Simulação dos algoritmos de escalonamento:
  - FIFO (First-In, First-Out)
  - SJF (Shortest Job First)
  - Round Robin
  - EDF (Earliest Deadline First)
- Entrada manual de processos com os seguintes parâmetros:
  - Tempo de chegada
  - Tempo de execução
  - Deadline
  - Quantum do sistema
  - Sobrecarga do sistema
- Armazenamento dos dados de entrada para reutilização entre trocas de algoritmo.
- Geração do gráfico de Gantt para visualização da execução dos processos.
- Cálculo e exibição do **turnaround médio** (tempo de espera + tempo de execução).
- Delay para acompanhar a execução.

### Substituição de Páginas
- Simulação dos algoritmos de substituição de páginas:
  - FIFO
  - Menos Recentemente Utilizada (LRU)
- Cada processo pode ter até **10 páginas**, cada uma com **4K de tamanho**.
- A RAM possui **200K de memória**.
- Implementação de **memória virtual** com abstração de **DISCO**.
- Simulação de falta de página com penalização em unidades de tempo (N u.t.).
- Gráficos em tempo real para visualizar:
  - Uso da **RAM** (páginas presentes na memória).
  - Uso do **Disco** (paginação).
  - Execução da **CPU**.
- Os processos **só executam** se todas as suas páginas estiverem na RAM.

## 🛠️ Tecnologias Utilizadas

- **NodeJS**
- **React**
- **Vite**

## 📦 Instalação e Uso

Você precisará ter o [NodeJS](https://nodejs.org/) e o [Git](https://git-scm.com/) instalados na sua máquina para executar este projeto pelas instruções abaixo:

1. Clone o repositório:
   ```bash
   git clone https://github.com/JoseRaimundo27/SimuladorSO
   ```
2. Acesse o diretório do projeto:
   ```bash
   cd SimuladorSO
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o projeto:
   ```bash
   npm run dev
   ```
5. Acesse o simulador no navegador: `http://localhost:5173`

